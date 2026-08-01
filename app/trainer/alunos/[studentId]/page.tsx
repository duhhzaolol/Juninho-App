import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Sidebar } from '@/components/trainer/Sidebar'
import { Card } from '@/components/ui/Card'
import { EvolutionChart } from '@/components/student/EvolutionChart'
import { PhotoComparison } from '@/components/student/PhotoComparison'

export default async function StudentDetailPage({ params }: { params: Promise<{ studentId: string }> }) {
  const { studentId } = await params
  const student = await prisma.studentProfile.findUnique({
    where: { id: studentId },
    include: {
      user: true,
      exerciseLogs: { orderBy: { date: 'asc' } },
      progressPhotos: true,
      assignments: { include: { workout: true }, where: { status: 'active' } },
    },
  })

  if (!student) return null

  const byDate = new Map<string, number>()
  for (const log of student.exerciseLogs) {
    const key = log.date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
    byDate.set(key, (byDate.get(key) ?? 0) + log.loadKg * log.reps)
  }
  const chartData = Array.from(byDate.entries()).map(([date, value]) => ({ date, value }))

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

        {student.assignments[0] && (
          <Card
            variant="workout"
            eyebrow="Treino ativo"
            title={student.assignments[0].workout.name}
            subtitle={`Semana ${student.assignments[0].currentWeek}`}
            className="mb-4"
          />
        )}

        <Card variant="glass" eyebrow="Evolução de carga" title="Histórico" className="mb-4">
          <EvolutionChart data={chartData} />
        </Card>

        <Card variant="glass" eyebrow="Fotos" title="Progresso visual" className="mb-4">
          <PhotoComparison photos={student.progressPhotos} />
        </Card>

        <Link href={`/trainer/mensagens?to=${student.userId}`} className="text-gold-light text-sm">
          Enviar mensagem →
        </Link>
      </main>
    </div>
  )
}
