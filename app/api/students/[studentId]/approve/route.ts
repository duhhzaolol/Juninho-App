import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(req: Request, { params }: { params: Promise<{ studentId: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { studentId } = await params
  const trainer = await prisma.trainerProfile.findUnique({ where: { userId: session.user.id } })
  if (!trainer) return NextResponse.json({ error: 'not a trainer' }, { status: 403 })

  const student = await prisma.studentProfile.findFirst({ where: { id: studentId, trainerId: trainer.id } })
  if (!student) return NextResponse.json({ error: 'student not found' }, { status: 404 })

  const updated = await prisma.studentProfile.update({
    where: { id: studentId },
    data: { status: 'active' },
  })

  return NextResponse.json(updated)
}
