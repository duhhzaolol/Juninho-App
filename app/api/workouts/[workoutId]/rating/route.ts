import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(req: Request, { params }: { params: Promise<{ workoutId: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { workoutId } = await params
  const { rating, comment } = await req.json()

  if (typeof rating !== 'number' || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'invalid rating' }, { status: 400 })
  }

  const student = await prisma.studentProfile.findUnique({ where: { userId: session.user.id } })
  if (!student) return NextResponse.json({ error: 'not a student' }, { status: 403 })

  const created = await prisma.workoutRating.create({
    data: { studentId: student.id, workoutId, rating, comment: comment || null },
  })

  return NextResponse.json(created)
}
