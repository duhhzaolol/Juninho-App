import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/trainer/Sidebar'

export default async function ReportsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const trainer = await prisma.trainerProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      students: {
        include: {
          user: true,
          exerciseLogs: true,
          calendarEntries: { orderBy: { date: 'desc' } },
          assignments: true,
          workoutRatings: true,
        },
      },
    },
  })
  if (!trainer) return null

  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000)

  const totalStudents = trainer.students.length
  const activeStudents = trainer.students.filter((s) => {
    const last = s.calendarEntries[0]?.date
    return last && last >= sevenDaysAgo
  }).length

  const adherences = trainer.students.map((s) => {
    const trained = s.calendarEntries.filter((e) => e.status === 'TRAINED' && e.date >= thirtyDaysAgo).length
    return (trained / 30) * 100
  })
  const avgAdherence = adherences.length > 0 ? Math.round(adherences.reduce((a, b) => a + b, 0) / adherences.length) : 0

  const workoutsCompletedLast30 = trainer.students.reduce(
    (sum, s) => sum + s.calendarEntries.filter((e) => e.status === 'TRAINED' && e.date >= thirtyDaysAgo).length,
    0
  )

  const allRatings = trainer.students.flatMap((s) => s.workoutRatings)
  const avgRating = allRatings.length > 0
    ? (allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length).toFixed(1)
    : null

  const summaryStats = [
    { label: 'Alunos ativos', value: `${activeStudents}/${totalStudents}` },
    { label: 'Adesão média', value: `${avgAdherence}%` },
    { label: 'Treinos (30d)', value: String(workoutsCompletedLast30) },
    { label: 'Avaliação média', value: avgRating ? `${avgRating} ★` : '—' },
  ]

  // Quem mais treinou: ranking por número de registros de carga
  const maisTreinaram = [...trainer.students]
    .sort((a, b) => b.exerciseLogs.length - a.exerciseLogs.length)
    .slice(0, 5)
    .filter((s) => s.exerciseLogs.length > 0)

  // Quem está parado: sem treinar há mais de 7 dias (ou nunca)
  const parados = trainer.students.filter((s) => {
    const last = s.calendarEntries[0]?.date
    return !last || last < sevenDaysAgo
  })

  // Quem concluiu programa: tem assignment com status "completed"
  const concluiram = trainer.students.filter((s) => s.assignments.some((a) => a.status === 'completed'))

  // Quem abandonou: tem assignment com status "abandoned"
  const abandonaram = trainer.students.filter((s) => s.assignments.some((a) => a.status === 'abandoned'))

  const sections = [
    { title: 'Quem mais treinou', students: maisTreinaram, empty: 'Ninguém registrou treino ainda.' },
    { title: 'Quem está parado', students: parados, empty: 'Todo mundo está treinando em dia.' },
    { title: 'Quem concluiu o programa', students: concluiram, empty: 'Nenhum programa concluído ainda.' },
    { title: 'Quem abandonou', students: abandonaram, empty: 'Ninguém abandonou o programa.' },
  ]

  return (
    <div className="min-h-screen bg-navy flex flex-col md:flex-row">
      <Sidebar />

      <main className="flex-1 px-6 py-8">
        <p className="font-display font-bold text-xl text-white mb-6">Relatórios</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {summaryStats.map((stat) => (
            <div key={stat.label} className="bg-navy-light border border-white/10 rounded-control p-3">
              <p className="font-display font-bold text-xl text-white">{stat.value}</p>
              <p className="text-[10px] text-white/40">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sections.map((section) => (
            <div key={section.title} className="bg-navy-light border border-white/10 rounded-control p-4">
              <p className="text-[11px] uppercase tracking-wider text-gold-light mb-3">{section.title}</p>
              {section.students.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {section.students.map((s) => (
                    <div key={s.id} className="flex items-center justify-between text-sm">
                      <span className="text-white">{s.user.name}</span>
                      <span className="text-white/40 text-xs">{s.exerciseLogs.length} registros</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-white/40 text-xs">{section.empty}</p>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
