import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { EvolutionChart } from '@/components/student/EvolutionChart'
import { PhotoComparison } from '@/components/student/PhotoComparison'
import { BottomNav } from '@/components/student/BottomNav'
import { PeriodSelect } from '@/components/shared/PeriodSelect'
import { redirect } from 'next/navigation'
import { Dumbbell } from 'lucide-react'

export default async function ProgressPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const { days } = await searchParams
  const periodDays = Number(days) || 30
  const since = new Date(Date.now() - periodDays * 86400000)

  const student = await prisma.studentProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      exerciseLogs: {
        where: { date: { gte: since } },
        orderBy: { date: 'asc' },
        include: { exercise: true },
      },
      progressPhotos: true,
    },
  })
  if (!student) redirect('/login')

  const totalLoad = student.exerciseLogs.reduce((sum, log) => sum + log.loadKg * log.reps, 0)

  // Série pro gráfico: carga total por dia
  const byDate = new Map<string, number>()
  for (const log of student.exerciseLogs) {
    const key = log.date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
    byDate.set(key, (byDate.get(key) ?? 0) + log.loadKg * log.reps)
  }
  const chartData = Array.from(byDate.entries()).map(([date, value]) => ({ date, value }))
  const evolutionPct = chartData.length > 1
    ? Math.round(((chartData.at(-1)!.value - chartData[0].value) / chartData[0].value) * 100)
    : 0

  // Desempenho por grupo muscular: evolução da carga dentro do período, por grupo
  const byGroup = new Map<string, { first: number; last: number; count: number }>()
  for (const log of student.exerciseLogs) {
    const group = log.exercise.muscleGroup.split(',')[0].trim()
    const value = log.loadKg * log.reps
    const entry = byGroup.get(group)
    if (!entry) {
      byGroup.set(group, { first: value, last: value, count: 1 })
    } else {
      entry.last = value
      entry.count++
    }
  }
  const groupPerformance = Array.from(byGroup.entries())
    .map(([group, { first, last, count }]) => ({
      group,
      pct: count > 1 && first > 0 ? Math.round(((last - first) / first) * 100) : null,
    }))
    .filter((g) => g.pct !== null)
    .sort((a, b) => (b.pct ?? 0) - (a.pct ?? 0))
    .slice(0, 5)

  const maxPct = Math.max(1, ...groupPerformance.map((g) => Math.abs(g.pct ?? 0)))

  return (
    <main className="min-h-screen bg-navy pb-28 px-5 pt-8">
      <p className="font-display font-bold text-xl text-white mb-4">Progresso</p>

      <div className="mb-4">
        <p className="text-[11px] text-white/40 mb-1.5">Período</p>
        <PeriodSelect value={String(periodDays)} />
      </div>

      <Card variant="metric" eyebrow="Evolução geral" title={`${evolutionPct >= 0 ? '+' : ''}${evolutionPct}%`} className="mb-4">
        <p className="text-xs text-white/40 -mt-2 mb-2">de evolução</p>
        <EvolutionChart data={chartData} />
      </Card>

      {groupPerformance.length > 0 && (
        <div className="bg-navy-light border border-white/10 rounded-card p-4 mb-4">
          <p className="text-[11px] uppercase tracking-wider text-white/40 mb-3">Desempenho por grupo muscular</p>
          <div className="flex flex-col gap-3">
            {groupPerformance.map((g) => (
              <div key={g.group}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-white">{g.group}</span>
                  <span className="text-sm text-gold-light font-display font-semibold">
                    {g.pct! >= 0 ? '+' : ''}{g.pct}%
                  </span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gold rounded-full"
                    style={{ width: `${Math.min(100, (Math.abs(g.pct!) / maxPct) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Card variant="glass" eyebrow="Carga total levantada" title={`${totalLoad.toLocaleString('pt-BR')} kg`} className="mb-4">
        <div className="flex justify-end -mt-8">
          <div className="w-10 h-10 rounded-full bg-purple/30 flex items-center justify-center">
            <Dumbbell size={18} className="text-purple-200" />
          </div>
        </div>
      </Card>

      <Card variant="glass" eyebrow="Fotos" title="Comparação de progresso" className="mb-4">
        <PhotoComparison photos={student.progressPhotos} />
      </Card>

      <BottomNav />
    </main>
  )
}
