import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

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
      data: { studentId: student.id, date: new Date(), status: 'TRAINED', workoutId },
    })
  } else {
    // Se já tinha um registro de hoje sem treino vinculado, completa com o treino feito agora
    await prisma.calendarEntry.update({
      where: { id: alreadyLoggedToday.id },
      data: { status: 'TRAINED', workoutId },
    })
  }

  return NextResponse.json({ ok: true })
}
