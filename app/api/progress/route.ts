import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { exerciseId, loadKg, reps, notes } = await req.json()

  const student = await prisma.studentProfile.findUnique({ where: { userId: session.user.id } })
  if (!student) return NextResponse.json({ error: 'not a student' }, { status: 403 })

  const log = await prisma.exerciseLog.create({
    data: { studentId: student.id, exerciseId, loadKg, reps, notes },
  })

  return NextResponse.json(log)
}
