import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const trainer = await prisma.trainerProfile.findUnique({ where: { userId: session.user.id } })
  if (!trainer) return NextResponse.json({ error: 'not a trainer' }, { status: 403 })

  const data = await req.json()

  const exercise = await prisma.exercise.create({
    data: { trainerId: trainer.id, ...data },
  })

  return NextResponse.json(exercise)
}

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const trainer = await prisma.trainerProfile.findUnique({ where: { userId: session.user.id } })
  if (!trainer) return NextResponse.json({ error: 'not a trainer' }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const grupo = searchParams.get('grupo')

  const exercises = await prisma.exercise.findMany({
    where: { trainerId: trainer.id, ...(grupo ? { muscleGroup: grupo } : {}) },
    orderBy: { name: 'asc' },
  })

  return NextResponse.json(exercises)
}
