import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { avatarUrl } = await req.json()
  if (typeof avatarUrl !== 'string' || avatarUrl.length > 300_000) {
    return NextResponse.json({ error: 'invalid image' }, { status: 400 })
  }

  const student = await prisma.studentProfile.findUnique({ where: { userId: session.user.id } })
  if (!student) return NextResponse.json({ error: 'not a student' }, { status: 403 })

  await prisma.studentProfile.update({ where: { id: student.id }, data: { avatarUrl } })

  return NextResponse.json({ ok: true })
}
