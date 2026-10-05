import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function PUT(req: Request, { params }: { params: Promise<{ exerciseId: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { exerciseId } = await params
  const trainer = await prisma.trainerProfile.findUnique({ where: { userId: session.user.id } })
  if (!trainer) return NextResponse.json({ error: 'not a trainer' }, { status: 403 })

  const existing = await prisma.exercise.findFirst({ where: { id: exerciseId, trainerId: trainer.id } })
  if (!existing) return NextResponse.json({ error: 'exercise not found' }, { status: 404 })

  const data = await req.json()
  const exercise = await prisma.exercise.update({ where: { id: exerciseId }, data })

  return NextResponse.json(exercise)
}

export async function DELETE(req: Request, { params }: { params: Promise<{ exerciseId: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { exerciseId } = await params
  const trainer = await prisma.trainerProfile.findUnique({ where: { userId: session.user.id } })
  if (!trainer) return NextResponse.json({ error: 'not a trainer' }, { status: 403 })

  const existing = await prisma.exercise.findFirst({ where: { id: exerciseId, trainerId: trainer.id } })
  if (!existing) return NextResponse.json({ error: 'exercise not found' }, { status: 404 })

  // Não deixa excluir se algum treino ainda usa esse exercício
  const inUse = await prisma.workoutExercise.findFirst({ where: { exerciseId } })
  const inUseAsExtra = await prisma.blockExercise.findFirst({ where: { exerciseId } })
  if (inUse || inUseAsExtra) {
    return NextResponse.json({ error: 'exercise in use' }, { status: 409 })
  }

  await prisma.exercise.delete({ where: { id: exerciseId } })
  return NextResponse.json({ ok: true })
}
