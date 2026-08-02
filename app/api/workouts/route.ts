import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const trainer = await prisma.trainerProfile.findUnique({ where: { userId: session.user.id } })
  if (!trainer) return NextResponse.json({ error: 'not a trainer' }, { status: 403 })

  const workouts = await prisma.workout.findMany({
    where: { trainerId: trainer.id },
    orderBy: { name: 'asc' },
    select: { id: true, name: true },
  })

  return NextResponse.json(workouts)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { name, isTemplate, blocks } = await req.json()

  const trainer = await prisma.trainerProfile.findUnique({ where: { userId: session.user.id } })
  if (!trainer) return NextResponse.json({ error: 'not a trainer' }, { status: 403 })

  const workout = await prisma.workout.create({
    data: {
      trainerId: trainer.id,
      name,
      isTemplate,
      blocks: {
        create: blocks.map((b: any, i: number) => ({
          order: i,
          type: b.type,
          sets: b.sets,
          reps: b.reps,
          restSeconds: b.restSeconds,
          notes: b.notes,
        })),
      },
    },
    include: { blocks: true },
  })

  return NextResponse.json(workout)
}
