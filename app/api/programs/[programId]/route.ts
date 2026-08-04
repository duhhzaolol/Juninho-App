import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: Request, { params }: { params: Promise<{ programId: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { programId } = await params
  const program = await prisma.weeklyProgram.findUnique({
    where: { id: programId },
    include: { days: { include: { workout: true } } },
  })

  return NextResponse.json(program)
}

export async function PUT(req: Request, { params }: { params: Promise<{ programId: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { programId } = await params
  const { name, days } = await req.json()

  const trainer = await prisma.trainerProfile.findUnique({ where: { userId: session.user.id } })
  if (!trainer) return NextResponse.json({ error: 'not a trainer' }, { status: 403 })

  const existing = await prisma.weeklyProgram.findFirst({ where: { id: programId, trainerId: trainer.id } })
  if (!existing) return NextResponse.json({ error: 'program not found' }, { status: 404 })

  await prisma.weeklyProgramDay.deleteMany({ where: { programId } })

  const program = await prisma.weeklyProgram.update({
    where: { id: programId },
    data: {
      name,
      days: {
        create: days.map((d: any) => ({ weekday: d.weekday, workoutId: d.workoutId })),
      },
    },
    include: { days: true },
  })

  return NextResponse.json(program)
}

export async function DELETE(req: Request, { params }: { params: Promise<{ programId: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { programId } = await params
  const trainer = await prisma.trainerProfile.findUnique({ where: { userId: session.user.id } })
  if (!trainer) return NextResponse.json({ error: 'not a trainer' }, { status: 403 })

  const existing = await prisma.weeklyProgram.findFirst({ where: { id: programId, trainerId: trainer.id } })
  if (!existing) return NextResponse.json({ error: 'program not found' }, { status: 404 })

  await prisma.weeklyProgramDay.deleteMany({ where: { programId } })
  await prisma.weeklyProgram.delete({ where: { id: programId } })

  return NextResponse.json({ ok: true })
}
