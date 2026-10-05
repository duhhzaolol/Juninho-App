import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const student = await prisma.studentProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      trainer: { include: { user: true } },
      subscriptions: { where: { status: 'active' }, take: 1 },
    },
  })
  if (!student) return NextResponse.json({ error: 'not a student' }, { status: 403 })

  const messagesFromTrainer = await prisma.message.findMany({
    where: { senderId: student.trainer.userId, receiverId: session.user.id, readAt: null },
    orderBy: { createdAt: 'desc' },
  })

  const activeSub = student.subscriptions[0]
  const overdueDays = activeSub?.renewsAt && activeSub.renewsAt.getTime() < Date.now()
    ? Math.ceil((Date.now() - activeSub.renewsAt.getTime()) / 86400000)
    : null

  return NextResponse.json({
    trainerName: student.trainer.user.name,
    messages: messagesFromTrainer.map((m) => ({ id: m.id, content: m.content, createdAt: m.createdAt })),
    overdueDays,
  })
}
