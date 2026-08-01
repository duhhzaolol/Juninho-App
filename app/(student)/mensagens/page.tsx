import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ChatThread } from '@/components/shared/ChatThread'
import { BottomNav } from '@/components/student/BottomNav'

export default async function StudentMessagesPage() {
  const session = await auth()
  const student = await prisma.studentProfile.findUnique({
    where: { userId: session?.user?.id },
    include: { trainer: { include: { user: true } } },
  })
  if (!student) return null

  return (
    <main className="min-h-screen bg-navy pb-28 px-5 pt-6">
      <ChatThread
        currentUserId={session!.user!.id as string}
        counterpartId={student.trainer.userId}
        counterpartName={student.trainer.user.name}
      />
      <BottomNav />
    </main>
  )
}
