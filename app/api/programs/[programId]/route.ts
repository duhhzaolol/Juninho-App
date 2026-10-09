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

// Exclui o programa. Não deixa excluir se ele for uma semana de alguma planilha (a planilha quebraria).
// Os treinos do programa saem junto, menos os que alguma aluna já usou ou que estão em outro programa:
// esses ficam guardados, para o histórico e a agenda de quem já treina com eles continuarem certos.
export async function DELETE(req: Request, { params }: { params: Promise<{ programId: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { programId } = await params
  const trainer = await prisma.trainerProfile.findUnique({ where: { userId: session.user.id } })
  if (!trainer) return NextResponse.json({ error: 'not a trainer' }, { status: 403 })

  const existing = await prisma.weeklyProgram.findFirst({ where: { id: programId, trainerId: trainer.id }, include: { days: true } })
  if (!existing) return NextResponse.json({ error: 'program not found' }, { status: 404 })

  const inProducts = await prisma.productWeek.findMany({ where: { programId }, include: { product: { select: { name: true } } } })
  if (inProducts.length > 0) {
    return NextResponse.json(
      { error: 'in_product', products: inProducts.map((w) => ({ name: w.product.name, week: w.week })) },
      { status: 409 }
    )
  }

  const workoutIds = existing.days.map((d) => d.workoutId).filter((id): id is string => !!id)

  await prisma.$transaction(
    async (tx) => {
      await tx.weeklyProgramDay.deleteMany({ where: { programId } })
      await tx.weeklyProgram.delete({ where: { id: programId } })
      if (workoutIds.length === 0) return
      const unused = await tx.workout.findMany({
        where: {
          id: { in: workoutIds },
          trainerId: trainer.id,
          programDays: { none: {} },
          assignments: { none: {} },
          calendarEntries: { none: {} },
          ratings: { none: {} },
        },
        select: { id: true },
      })
      const ids = unused.map((w) => w.id)
      if (ids.length === 0) return
      await tx.blockExercise.deleteMany({ where: { block: { workoutId: { in: ids } } } })
      await tx.workoutExercise.deleteMany({ where: { workoutId: { in: ids } } })
      await tx.workout.deleteMany({ where: { id: { in: ids } } })
    },
    { maxWait: 10000, timeout: 30000 }
  )

  return NextResponse.json({ ok: true })
}
