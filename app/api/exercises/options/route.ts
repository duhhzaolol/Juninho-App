import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const trainer = await prisma.trainerProfile.findUnique({ where: { userId: session.user.id } })
  if (!trainer) return NextResponse.json({ error: 'not a trainer' }, { status: 403 })

  const exercises = await prisma.exercise.findMany({
    where: { trainerId: trainer.id },
    select: { muscleGroup: true, equipment: true },
  })

  const muscleGroups = new Set<string>()
  const equipment = new Set<string>()

  for (const ex of exercises) {
    for (const part of ex.muscleGroup.split(',')) {
      const trimmed = part.trim()
      if (trimmed) muscleGroups.add(trimmed)
    }
    if (ex.equipment?.trim()) equipment.add(ex.equipment.trim())
  }

  return NextResponse.json({
    muscleGroups: Array.from(muscleGroups).sort(),
    equipment: Array.from(equipment).sort(),
  })
}
