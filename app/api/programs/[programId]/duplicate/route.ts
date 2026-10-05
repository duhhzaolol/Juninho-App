import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(req: Request, { params }: { params: Promise<{ programId: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { programId } = await params
  const trainer = await prisma.trainerProfile.findUnique({ where: { userId: session.user.id } })
  if (!trainer) return NextResponse.json({ error: 'not a trainer' }, { status: 403 })

  const original = await prisma.weeklyProgram.findFirst({
    where: { id: programId, trainerId: trainer.id },
    include: {
      days: {
        include: {
          workout: {
            include: {
              blocks: {
                orderBy: { order: 'asc' },
                include: { extraItems: { orderBy: { order: 'asc' } } },
              },
            },
          },
        },
      },
    },
  })
  if (!original) return NextResponse.json({ error: 'program not found' }, { status: 404 })

  const newDays: { weekday: number; workoutId: string }[] = []

  for (const day of original.days) {
    if (!day.workout) continue

    const newWorkout = await prisma.workout.create({
      data: {
        trainerId: trainer.id,
        name: day.workout.name,
        goal: day.workout.goal,
        blocks: {
          create: day.workout.blocks.map((b) => ({
            order: b.order,
            type: b.type,
            exerciseId: b.exerciseId,
            sets: b.sets,
            reps: b.reps,
            loadKg: b.loadKg,
            restSeconds: b.restSeconds,
            notes: b.notes,
            extraItems: {
              create: b.extraItems.map((it) => ({ exerciseId: it.exerciseId, order: it.order })),
            },
          })),
        },
      },
    })

    newDays.push({ weekday: day.weekday, workoutId: newWorkout.id })
  }

  const newProgram = await prisma.weeklyProgram.create({
    data: {
      trainerId: trainer.id,
      name: `${original.name} (cópia)`,
      days: { create: newDays },
    },
  })

  return NextResponse.json(newProgram)
}
