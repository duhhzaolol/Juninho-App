import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { EvolutionChart } from '@/components/student/EvolutionChart'
import { PhotoComparison } from '@/components/student/PhotoComparison'
import { BottomNav } from '@/components/student/BottomNav'
import { redirect } from 'next/navigation'
import { cn } from '@/lib/utils'

export default async function ProgressPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const student = await prisma.studentProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      exerciseLogs: { orderBy: { date: 'asc' } },
      progressPhotos: true,
      calendarEntries: true,
    },
  })

  if (!student) redirect('/login')

  // Carga total levantada (soma de carga x reps de todos os logs)
  const totalLoad = student.exerciseLogs.reduce((sum, log) => sum + log.loadKg * log.reps, 0)

  // Série para o gráfico: carga total por dia
  const byDate = new Map<string, number>()
  for (const log of student.exerciseLogs) {
    const key = log.date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
    byDate.set(key, (byDate.get(key) ?? 0) + log.loadKg * log.reps)
  }
  const chartData = Array.from(byDate.entries()).map(([date, value]) => ({ date, value }))

  // Sequência atual de dias treinados
  const trainedDates = student.calendarEntries
    .filter((e) => e.status === 'TRAINED')
    .map((e) => e.date)
    .sort((a, b) => b.getTime() - a.getTime())

  let streak = 0
  let cursor = new Date()
  for (const date of trainedDates) {
    const diffDays = Math.floor((cursor.getTime() - date.getTime()) / 86400000)
    if (diffDays <= 1) {
      streak++
      cursor = date
    } else break
  }

  // Últimos 14 dias, pra mostrar um resumo do calendário aqui também
  const entryMap = new Map(student.calendarEntries.map((e) => [e.date.toISOString().slice(0, 10), e.status]))
  const last14Days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (13 - i))
    return d
  })

  return (
    <main className="min-h-screen bg-navy pb-28 px-5 pt-8">
      <p className="font-display font-bold text-xl text-white mb-6">Progresso</p>

      <Card variant="metric" eyebrow="Evolução geral" title={`+${chartData.length > 1 ? Math.round(((chartData.at(-1)!.value - chartData[0].value) / chartData[0].value) * 100) : 0}%`} className="mb-4">
        <EvolutionChart data={chartData} />
      </Card>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <Card variant="glass" eyebrow="Carga total levantada" title={`${totalLoad.toLocaleString('pt-BR')} kg`} />
        <Card variant="glass" eyebrow="Sequência atual" title={`${streak} dias`} />
      </div>

      <div className="bg-navy-light border border-white/10 rounded-card p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] uppercase tracking-wider text-white/40">Últimos 14 dias</p>
          <Link href="/calendario" className="text-[11px] text-gold-light">Ver ficha completa →</Link>
        </div>
        <div className="flex gap-1.5">
          {last14Days.map((d) => {
            const key = d.toISOString().slice(0, 10)
            const trained = entryMap.get(key) === 'TRAINED'
            return (
              <div
                key={key}
                className={cn(
                  'flex-1 aspect-square rounded-md',
                  trained ? 'bg-gold' : 'bg-white/10'
                )}
                title={d.toLocaleDateString('pt-BR')}
              />
            )
          })}
        </div>
      </div>

      <Card variant="glass" eyebrow="Fotos" title="Comparação de progresso" className="mb-4">
        <PhotoComparison photos={student.progressPhotos} />
      </Card>

      <BottomNav />
    </main>
  )
}
