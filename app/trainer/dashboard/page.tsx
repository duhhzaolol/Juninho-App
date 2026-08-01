import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Card } from '@/components/ui/Card'
import { Sidebar } from '@/components/trainer/Sidebar'

export default async function TrainerDashboardPage() {
  const session = await auth()
  const trainer = await prisma.trainerProfile.findUnique({
    where: { userId: session?.user?.id },
    include: {
      students: {
        include: {
          calendarEntries: { orderBy: { date: 'desc' }, take: 1 },
          assignments: { where: { status: 'active' } },
        },
      },
    },
  })

  if (!trainer) return null

  const totalStudents = trainer.students.length
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000)

  const active = trainer.students.filter((s) => s.calendarEntries[0]?.date && s.calendarEntries[0].date > sevenDaysAgo).length
  const inactive = totalStudents - active
  const withoutActiveWorkout = trainer.students.filter((s) => s.assignments.length === 0).length

  return (
    <div className="min-h-screen bg-navy flex flex-col md:flex-row">
      <Sidebar />

      <main className="flex-1 px-6 py-8">
        <p className="font-display font-bold text-xl text-white mb-6">Dashboard</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <Card variant="metric" eyebrow="Alunos ativos" title={String(active)} />
          <Card variant="metric" eyebrow="Inativos" title={String(inactive)} />
          <Card variant="metric" eyebrow="Total de alunos" title={String(totalStudents)} />
          <Card variant="metric" eyebrow="Sem treino ativo" title={String(withoutActiveWorkout)} />
        </div>

        <Card variant="glass" eyebrow="Alunos sem treinar" title={`${inactive} alunos precisam de atenção`} />
      </main>
    </div>
  )
}
