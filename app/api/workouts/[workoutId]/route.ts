import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: Request, { params }: { params: Promise<{ workoutId: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { workoutId } = await params
  const workout = await prisma.workout.findUnique({
    where: { id: workoutId },
    include: {
      blocks: {
        orderBy: { order: 'asc' },
        include: { exercise: true, extraItems: { orderBy: { order: 'asc' }, include: { exercise: true } } },
      },
    },
  })

  return NextResponse.json(workout)
}

export async function PUT(req: Request, { params }: { params: Promise<{ workoutId: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { workoutId } = await params
  const { name, isTemplate, blocks } = await req.json()

  const trainer = await prisma.trainerProfile.findUnique({ where: { userId: session.user.id } })
  if (!trainer) return NextResponse.json({ error: 'not a trainer' }, { status: 403 })

  const existing = await prisma.workout.findFirst({ where: { id: workoutId, trainerId: trainer.id } })
  if (!existing) return NextResponse.json({ error: 'workout not found' }, { status: 404 })

  // Substitui todos os blocos pelos que vieram do construtor
  await prisma.workoutExercise.deleteMany({ where: { workoutId } })

  const workout = await prisma.workout.update({
    where: { id: workoutId },
    data: {
      name,
      isTemplate,
      blocks: {
        create: blocks.map((b: any, i: number) => ({
          order: i,
          type: b.type,
          exerciseId: b.exerciseId || null,
          sets: b.sets,
          reps: b.reps,
          loadKg: b.loadKg,
          restSeconds: b.restSeconds,
          notes: b.notes,
          extraItems: {
            create: (b.extraExerciseIds ?? []).map((exId: string, idx: number) => ({
              exerciseId: exId,
              order: idx,
            })),
          },
        })),
      },
    },
    include: { blocks: true },
  })

  return NextResponse.json(workout)
}

export async function DELETE(req: Request, { params }: { params: Promise<{ workoutId: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { workoutId } = await params
  const trainer = await prisma.trainerProfile.findUnique({ where: { userId: session.user.id } })
  if (!trainer) return NextResponse.json({ error: 'not a trainer' }, { status: 403 })

  const existing = await prisma.workout.findFirst({ where: { id: workoutId, trainerId: trainer.id } })
  if (!existing) return NextResponse.json({ error: 'workout not found' }, { status: 404 })

  await prisma.workoutExercise.deleteMany({ where: { workoutId } })
  await prisma.workout.delete({ where: { id: workoutId } })

  return NextResponse.json({ ok: true })
}
