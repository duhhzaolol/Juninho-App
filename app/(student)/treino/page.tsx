import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { BottomNav } from '@/components/student/BottomNav'
import { StatusCard } from '@/components/shared/StatusCard'
import { Dumbbell } from 'lucide-react'

export default async function TreinoIndexPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const student = await prisma.studentProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      assignments: {
        where: { status: 'active' },
        orderBy: { startedAt: 'desc' },
        take: 1,
      },
    },
  })
  if (!student) redirect('/login')

  const active = student.assignments[0]
  if (active) redirect(`/treino/${active.workoutId}`)

  return (
    <main className="min-h-screen bg-navy pb-28 px-5 pt-16">
      <StatusCard
        variant="info"
        icon={<Dumbbell size={18} />}
        title="Seu treino está sendo montado"
        subtitle="Assim que o professor publicar seu treino, ele aparece aqui automaticamente."
      />
      <BottomNav />
    </main>
  )
}
