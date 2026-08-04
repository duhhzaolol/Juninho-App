import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: Request, { params }: { params: Promise<{ studentId: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { studentId } = await params

  const assignments = await prisma.workoutAssignment.findMany({
    where: { studentId, status: 'active', weekday: { not: null } },
    select: { weekday: true, workoutId: true },
  })

  return NextResponse.json({ schedule: assignments })
}

export async function POST(req: Request, { params }: { params: Promise<{ studentId: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { studentId } = await params
  const { schedule } = await req.json() as { schedule: { weekday: number; workoutId: string }[] }

  const trainer = await prisma.trainerProfile.findUnique({ where: { userId: session.user.id } })
  if (!trainer) return NextResponse.json({ error: 'not a trainer' }, { status: 403 })

  const student = await prisma.studentProfile.findFirst({ where: { id: studentId, trainerId: trainer.id } })
  if (!student) return NextResponse.json({ error: 'student not found' }, { status: 404 })

  // Substitui o programa semanal inteiro pelo que foi enviado
  await prisma.workoutAssignment.updateMany({
    where: { studentId, status: 'active', weekday: { not: null } },
    data: { status: 'replaced' },
  })

  if (schedule.length > 0) {
    await prisma.workoutAssignment.createMany({
      data: schedule.map((item) => ({
        studentId,
        workoutId: item.workoutId,
        weekday: item.weekday,
        status: 'active',
      })),
    })
  }

  return NextResponse.json({ ok: true })
}
