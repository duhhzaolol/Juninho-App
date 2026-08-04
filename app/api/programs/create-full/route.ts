import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

interface IncomingDay {
  weekday: number
  rest: boolean
  existingWorkoutId: string | null
  workoutName: string | null
  blocks: any[]
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { name, days } = await req.json() as { name: string; days: IncomingDay[] }
  if (!name) return NextResponse.json({ error: 'missing name' }, { status: 400 })

  const trainer = await prisma.trainerProfile.findUnique({ where: { userId: session.user.id } })
  if (!trainer) return NextResponse.json({ error: 'not a trainer' }, { status: 403 })

  const programDays: { weekday: number; workoutId: string }[] = []

  for (const day of days) {
    if (day.rest) continue

    if (day.existingWorkoutId) {
      programDays.push({ weekday: day.weekday, workoutId: day.existingWorkoutId })
      continue
    }

    if (day.blocks.length === 0) continue // nada montado pra esse dia, trata como sem treino

    const workout = await prisma.workout.create({
      data: {
        trainerId: trainer.id,
        name: day.workoutName || name,
        blocks: {
          create: day.blocks.map((b: any, i: number) => ({
            order: i,
            type: b.type,
            exerciseId: b.exerciseId || null,
            sets: b.sets,
            reps: b.reps,
            loadKg: b.loadKg,
            restSeconds: b.restSeconds,
            notes: b.notes,
            extraItems: {
              create: (b.extraExerciseIds ?? []).map((exId, idx) => ({ exerciseId: exId, order: idx })),
            },
          })),
        },
      },
    })

    programDays.push({ weekday: day.weekday, workoutId: workout.id })
  }

  const program = await prisma.weeklyProgram.create({
    data: {
      trainerId: trainer.id,
      name,
      days: { create: programDays },
    },
    include: { days: true },
  })

  return NextResponse.json(program)
}
