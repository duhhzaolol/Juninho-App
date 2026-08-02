import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { BottomNav } from '@/components/student/BottomNav'
import { StatusCard } from '@/components/shared/StatusCard'
import { Dumbbell, Coffee } from 'lucide-react'

export default async function TreinoIndexPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const weekday = new Date().getDay()
  const isRestDay = weekday === 0 || weekday === 6

  const student = await prisma.studentProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      assignments: {
        where: { status: 'active', weekday },
        take: 1,
      },
    },
  })
  if (!student) redirect('/login')

  const todaysAssignment = student.assignments[0]
  if (todaysAssignment) redirect(`/treino/${todaysAssignment.workoutId}`)

  return (
    <main className="min-h-screen bg-navy pb-28 px-5 pt-16">
      {isRestDay ? (
        <StatusCard
          variant="info"
          icon={<Coffee size={18} />}
          title="Hoje é dia de descanso"
          subtitle="Aproveite para recuperar — amanhã tem treino de novo."
        />
      ) : (
        <StatusCard
          variant="info"
          icon={<Dumbbell size={18} />}
          title="Seu treino está sendo montado"
          subtitle="Assim que o professor publicar seu treino, ele aparece aqui automaticamente."
        />
      )}
      <BottomNav />
    </main>
  )
}
