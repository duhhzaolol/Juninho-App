import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Sidebar } from '@/components/trainer/Sidebar'
import { Avatar } from '@/components/ui/Avatar'
import { Trophy } from 'lucide-react'

export default async function RankingPage({ searchParams }: { searchParams: Promise<{ by?: string }> }) {
  const { by } = await searchParams
  const metric = by ?? 'adesao'

  const session = await auth()
  const trainer = await prisma.trainerProfile.findUnique({ where: { userId: session?.user?.id } })
  if (!trainer) return null

  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000)

  const students = await prisma.studentProfile.findMany({
    where: { trainerId: trainer.id },
    include: {
      user: true,
      calendarEntries: { orderBy: { date: 'desc' } },
      exerciseLogs: true,
    },
  })

  const ranked = students
    .map((s) => {
      const trainedLast30 = s.calendarEntries.filter((e) => e.status === 'TRAINED' && e.date >= thirtyDaysAgo).length
      let streak = 0
      const sorted = [...s.calendarEntries].filter((e) => e.status === 'TRAINED').sort((a, b) => b.date.getTime() - a.date.getTime())
      let cursor = new Date()
      for (const entry of sorted) {
        const diff = Math.floor((cursor.getTime() - entry.date.getTime()) / 86400000)
        if (diff <= 1) { streak++; cursor = entry.date } else break
      }
      const totalLoad = s.exerciseLogs.reduce((sum, log) => sum + log.loadKg * log.reps, 0)

      return {
        id: s.id,
        name: s.user.name,
        avatarUrl: s.avatarUrl,
        adesao: Math.round((trainedLast30 / 30) * 100),
        streak,
        totalLoad,
      }
    })
    .sort((a, b) => (b as any)[metric] - (a as any)[metric])

  const metrics = [
    { value: 'adesao', label: 'Adesão' },
    { value: 'streak', label: 'Sequência' },
    { value: 'totalLoad', label: 'Carga total' },
  ]

  function formatValue(s: typeof ranked[0]) {
    if (metric === 'adesao') return `${s.adesao}%`
    if (metric === 'streak') return `${s.streak} dias`
    return `${s.totalLoad.toLocaleString('pt-BR')} kg`
  }

  return (
    <div className="min-h-screen bg-navy flex flex-col md:flex-row">
      <Sidebar />

      <main className="flex-1 px-6 py-8 max-w-lg">
        <p className="font-display font-bold text-xl text-white mb-4">Ranking</p>

        <div className="flex gap-2 mb-6">
          {metrics.map((m) => (
            <a
              key={m.value}
              href={`/trainer/ranking?by=${m.value}`}
              className={`text-xs px-3 py-1.5 rounded-full border ${
                metric === m.value ? 'bg-gold/15 border-gold text-gold-light' : 'bg-navy-light border-white/10 text-white/50'
              }`}
            >
              {m.label}
            </a>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          {ranked.map((s, i) => (
            <div key={s.id} className="flex items-center gap-3 bg-navy-light border border-white/10 rounded-control px-4 py-3">
              <div className="w-6 text-center">
                {i < 3 ? (
                  <Trophy size={16} className={i === 0 ? 'text-gold-light' : i === 1 ? 'text-white/60' : 'text-orange-400/70'} />
                ) : (
                  <span className="text-xs text-white/30">{i + 1}</span>
                )}
              </div>
              <Avatar src={s.avatarUrl} size="sm" />
              <p className="flex-1 text-sm text-white">{s.name}</p>
              <p className="text-sm font-display font-bold text-gold-light">{formatValue(s)}</p>
            </div>
          ))}
        </div>

        {ranked.length === 0 && <p className="text-white/40 text-sm">Nenhum aluno cadastrado ainda.</p>}
      </main>
    </div>
  )
}
