import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request, { params }: { params: Promise<{ workoutId: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { workoutId } = await params

  const student = await prisma.studentProfile.findUnique({ where: { userId: session.user.id } })
  if (!student) return NextResponse.json({ error: 'not a student' }, { status: 403 })

  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)

  const alreadyLoggedToday = await prisma.calendarEntry.findFirst({
    where: { studentId: student.id, date: { gte: startOfToday } },
  })

  if (!alreadyLoggedToday) {
    await prisma.calendarEntry.create({
      data: { studentId: student.id, date: new Date(), status: 'TRAINED' },
    })
  }

  const assignment = await prisma.workoutAssignment.findFirst({
    where: { studentId: student.id, workoutId, status: 'active' },
  })

  if (assignment) {
    await prisma.workoutAssignment.update({
      where: { id: assignment.id },
      data: { currentDay: assignment.currentDay + 1 },
    })
  }

  return NextResponse.json({ ok: true })
}
