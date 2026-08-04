import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const withUserId = searchParams.get('with')
  if (!withUserId) return NextResponse.json({ error: 'missing "with"' }, { status: 400 })

  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: session.user.id, receiverId: withUserId },
        { senderId: withUserId, receiverId: session.user.id },
      ],
    },
    orderBy: { createdAt: 'asc' },
  })

  return NextResponse.json(messages)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { receiverId, content } = await req.json()

  const message = await prisma.message.create({
    data: { senderId: session.user.id, receiverId, content },
  })

  return NextResponse.json(message)
}
