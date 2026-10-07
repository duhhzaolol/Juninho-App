import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { G3D_EXERCISES, GLUTEOS_3D, g3dProgramName, g3dWorkoutGoal, g3dWorkoutName } from '@/lib/programs/gluteos3d'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

// Cadastra a planilha Glúteos 3D completa: 6 programas semanais (um por semana), 30 treinos.
// Pode clicar de novo sem medo: semanas que já existem são puladas, nada é duplicado.
export async function POST() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const trainer = await prisma.trainerProfile.findUnique({ where: { userId: session.user.id } })
  if (!trainer) return NextResponse.json({ error: 'not a trainer' }, { status: 403 })

  // 1. Garante que todos os exercícios existem na biblioteca do professor (reaproveita pelo nome)
  const existing = await prisma.exercise.findMany({ where: { trainerId: trainer.id }, select: { id: true, name: true } })
  const byName = new Map(existing.map((e) => [e.name.trim().toLowerCase(), e.id]))

  const toCreate = G3D_EXERCISES.filter((e) => !byName.has(e.name.toLowerCase()))
  if (toCreate.length > 0) {
    await prisma.exercise.createMany({
      data: toCreate.map((e) => ({ trainerId: trainer.id, name: e.name, muscleGroup: e.muscleGroup, equipment: e.equipment ?? null })),
    })
    const refreshed = await prisma.exercise.findMany({ where: { trainerId: trainer.id }, select: { id: true, name: true } })
    for (const e of refreshed) byName.set(e.name.trim().toLowerCase(), e.id)
  }

  const idOf = (name: string) => {
    const id = byName.get(name.toLowerCase())
    if (!id) throw new Error(`Exercício não encontrado: ${name}`)
    return id
  }

  // 2. Cria cada semana como um programa semanal (segunda a sexta)
  const workoutsCreated: string[] = []
  const programsCreated: string[] = []

  for (const week of GLUTEOS_3D) {
    const programName = g3dProgramName(week.week, week.phase)
    const already = await prisma.weeklyProgram.findFirst({ where: { trainerId: trainer.id, name: programName } })
    if (already) continue

    const days: { weekday: number; workoutId: string }[] = []

    for (const w of week.workouts) {
      const name = g3dWorkoutName(week.week, w.title)
      const workout = await prisma.workout.create({
        data: {
          trainerId: trainer.id,
          name,
          goal: g3dWorkoutGoal(week.phase, w.rest),
          difficulty: 'Intermediário',
          isTemplate: true,
          blocks: {
            create: w.blocks.map((b, i) => ({
              order: i,
              type: b.type,
              exerciseId: idOf(b.exercises[0]),
              sets: b.sets,
              reps: b.reps,
              restSeconds: null, // descanso fica no texto do treino (faixa do PDF)
              notes: b.notes ?? null,
              extraItems: {
                create: b.exercises.slice(1).map((exName, idx) => ({ exerciseId: idOf(exName), order: idx })),
              },
            })),
          },
        },
      })
      days.push({ weekday: w.weekday, workoutId: workout.id })
      workoutsCreated.push(name)
    }

    await prisma.weeklyProgram.create({
      data: { trainerId: trainer.id, name: programName, days: { create: days } },
    })
    programsCreated.push(programName)
  }

  // 3. Cria a planilha "Glúteos 3D" na loja, ligada às 6 semanas. Começa como rascunho:
  //    coloque "À venda" em Planilhas depois de configurar o aviso da Ticto.
  let productCreated = false
  const existingProduct = await prisma.product.findUnique({ where: { slug: 'gluteos-3d' } })
  if (!existingProduct) {
    const names = GLUTEOS_3D.map((w) => g3dProgramName(w.week, w.phase))
    const programs = await prisma.weeklyProgram.findMany({ where: { trainerId: trainer.id, name: { in: names } } })
    const programId = new Map(programs.map((p) => [p.name, p.id]))
    if (programs.length === GLUTEOS_3D.length) {
      await prisma.product.create({
        data: {
          trainerId: trainer.id,
          slug: 'gluteos-3d',
          name: 'Glúteos 3D',
          category: 'Glúteos',
          tagline: '6 semanas com foco em glúteo. Treino novo liberado toda semana.',
          description:
            'Glúteo mais forte, redondo e empinado em 6 semanas. São 5 treinos por semana: 3 de inferior com ênfase em glúteo e 2 de superior. As semanas seguem 3 fases: Base (1 e 2), Choque (3 a 5) e Deload (6). Nível intermediário.',
          priceCents: 2790,
          oldPriceCents: 9990,
          checkoutUrl: 'https://checkout.ticto.app/OA8E76744',
          tictoCodes: 'OA8E76744',
          unlockMode: 'WEEKLY',
          unlockDays: 7,
          status: 'draft',
          weeks: { create: GLUTEOS_3D.map((w) => ({ week: w.week, programId: programId.get(g3dProgramName(w.week, w.phase))! })) },
        },
      })
      productCreated = true
    }
  }

  return NextResponse.json({ exercisesCreated: toCreate.length, workoutsCreated, programsCreated, productCreated })
}
