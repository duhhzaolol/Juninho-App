import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const trainer = await prisma.trainerProfile.findUnique({ where: { userId: session.user.id } })
  if (!trainer) return NextResponse.json({ error: 'not a trainer' }, { status: 403 })

  const programs = await prisma.weeklyProgram.findMany({
    where: { trainerId: trainer.id },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  })

  return NextResponse.json(programs)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { name, days } = await req.json()

  const trainer = await prisma.trainerProfile.findUnique({ where: { userId: session.user.id } })
  if (!trainer) return NextResponse.json({ error: 'not a trainer' }, { status: 403 })

  const program = await prisma.weeklyProgram.create({
    data: {
      trainerId: trainer.id,
      name,
      days: {
        create: days.map((d: any) => ({ weekday: d.weekday, workoutId: d.workoutId })),
      },
    },
    include: { days: true },
  })

  return NextResponse.json(program)
}
