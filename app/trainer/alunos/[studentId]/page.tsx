import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Sidebar } from '@/components/trainer/Sidebar'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { EvolutionChart } from '@/components/student/EvolutionChart'
import { PhotoComparison } from '@/components/student/PhotoComparison'
import { ResetPasswordButton } from '@/components/trainer/ResetPasswordButton'

export default async function StudentDetailPage({ params }: { params: Promise<{ studentId: string }> }) {
  const { studentId } = await params
  const student = await prisma.studentProfile.findUnique({
    where: { id: studentId },
    include: {
      user: true,
      exerciseLogs: { orderBy: { date: 'asc' } },
      progressPhotos: { orderBy: { date: 'asc' } },
      assignments: { include: { workout: true }, where: { status: 'active' } },
      subscriptions: { where: { status: 'active' }, include: { plan: true }, take: 1 },
      workoutRatings: { orderBy: { createdAt: 'desc' }, take: 5, include: { workout: true } },
    },
  })

  if (!student) return null

  const byDate = new Map<string, number>()
  for (const log of student.exerciseLogs) {
    const key = log.date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
    byDate.set(key, (byDate.get(key) ?? 0) + log.loadKg * log.reps)
  }
  const chartData = Array.from(byDate.entries()).map(([date, value]) => ({ date, value }))

  const activeSub = student.subscriptions[0]
  let dueBadge: { color: 'gold' | 'red' | 'green'; label: string } | null = null
  if (activeSub?.renewsAt) {
    const daysLeft = Math.ceil((activeSub.renewsAt.getTime() - Date.now()) / 86400000)
    if (daysLeft < 0) dueBadge = { color: 'red', label: `Vencido há ${Math.abs(daysLeft)}d` }
    else if (daysLeft <= 7) dueBadge = { color: 'gold', label: `Vence em ${daysLeft}d` }
    else dueBadge = { color: 'green', label: `Vence em ${daysLeft}d` }
  }

  return (
    <div className="min-h-screen bg-navy flex flex-col md:flex-row">
      <Sidebar />

      <main className="flex-1 px-6 py-8">
        <Link href="/trainer/alunos" className="text-white/50 text-sm mb-4 inline-block">← Alunos</Link>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-14 h-14 rounded-full bg-purple/40 border border-gold/40" />
          <div>
            <p className="font-display font-bold text-lg text-white">{student.user.name}</p>
            <p className="text-xs text-white/40">
              {student.weightKg ? `${student.weightKg}kg` : ''} {student.heightCm ? `· ${student.heightCm}cm` : ''}
            </p>
          </div>
        </div>

        <div className="bg-navy-light border border-white/10 rounded-control p-4 mb-4">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[11px] uppercase tracking-wider text-white/40">Financeiro</p>
            {dueBadge && <Badge color={dueBadge.color as any} label={dueBadge.label} />}
          </div>
          {activeSub ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white">{activeSub.plan.name}</p>
                <p className="text-xs text-white/40">
                  {((activeSub.priceCents ?? activeSub.plan.priceCents) / 100).toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                  {activeSub.renewsAt && ` · vence em ${activeSub.renewsAt.toLocaleDateString('pt-BR')}`}
                </p>
              </div>
              <Link href={`/trainer/alunos/${student.id}/plano`} className="text-gold-light text-xs">
                Renovar
              </Link>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <p className="text-sm text-white/40">Nenhum plano ativo registrado</p>
              <Link href={`/trainer/alunos/${student.id}/plano`} className="text-gold-light text-xs">
                Registrar plano
              </Link>
            </div>
          )}
        </div>

        <Link
          href={`/trainer/alunos/${student.id}/programa`}
          className="block bg-navy-light border border-white/10 rounded-control p-4 mb-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-white/40 mb-1">Programa semanal</p>
              <p className="text-sm text-white">
                {student.assignments.length > 0
                  ? `${student.assignments.length} dia(s) com treino definido`
                  : 'Nenhum treino definido ainda'}
              </p>
            </div>
            <span className="text-gold-light text-xs">Editar →</span>
          </div>
        </Link>

        <Card variant="glass" eyebrow="Evolução de carga" title="Histórico" className="mb-4">
          <EvolutionChart data={chartData} />
        </Card>

        <Card variant="glass" eyebrow="Fotos" title="Progresso visual" className="mb-4">
          <PhotoComparison photos={student.progressPhotos} />
          {student.progressPhotos.length > 0 && (
            <Link href={`/trainer/alunos/${student.id}/fotos`} className="block text-center text-xs text-gold-light mt-3">
              Ver histórico completo →
            </Link>
          )}
        </Card>

        {student.workoutRatings.length > 0 && (
          <div className="bg-navy-light border border-white/10 rounded-control p-4 mb-4">
            <p className="text-[11px] uppercase tracking-wider text-white/40 mb-3">Avaliações recentes</p>
            <div className="flex flex-col gap-3">
              {student.workoutRatings.map((r) => (
                <div key={r.id} className="border-b border-white/5 pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-white/60">{r.workout.name}</span>
                    <span className="text-gold-light text-xs">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                  </div>
                  {r.comment && <p className="text-xs text-white/40">{r.comment}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        <Link href={`/trainer/mensagens?to=${student.userId}`} className="text-gold-light text-sm block mb-4">
          Enviar mensagem →
        </Link>

        <ResetPasswordButton studentId={student.id} />
      </main>
    </div>
  )
}
