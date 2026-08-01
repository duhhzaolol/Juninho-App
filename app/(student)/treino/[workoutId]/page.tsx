import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { BottomNav } from '@/components/student/BottomNav'

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

  const active = student?.assignments[0]
  if (active) redirect(`/treino/${active.workoutId}`)

  return (
    <main className="min-h-screen bg-navy pb-28 px-5 pt-16 flex flex-col items-center text-center">
      <p className="text-white text-sm mb-1">Você ainda não tem nenhum treino ativo.</p>
      <p className="text-white/40 text-xs">Fale com seu professor para receber seu primeiro treino.</p>
      <BottomNav />
    </main>
  )
}
