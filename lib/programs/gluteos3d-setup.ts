// Cadastra o Glúteos 3D completo: 6 programas semanais (um por semana), 30 treinos e a planilha na loja.
//
// Tudo vai em poucas consultas grandes e numa transação só: ou cadastra tudo, ou nada.
// (A versão anterior gravava treino por treino, quase 500 consultas. Com o banco em São Paulo e o
// servidor da Vercel nos EUA, passava de 1 minuto e era interrompida no meio.)
//
// Pode tocar de novo sem medo: semanas que já existem são puladas e nada é duplicado.
import { randomUUID } from 'crypto'
import { prisma } from '@/lib/prisma'
import { G3D_EXERCISES, GLUTEOS_3D, g3dProgramName, g3dWorkoutGoal, g3dWorkoutName, type G3DBlockType } from '@/lib/programs/gluteos3d'

export const G3D_SLUG = 'gluteos-3d'
export const G3D_PROGRAM_NAMES = GLUTEOS_3D.map((w) => g3dProgramName(w.week, w.phase))

// O que já está cadastrado (para mostrar ou esconder o botão no painel)
export async function gluteos3dStatus(trainerId: string) {
  const [weeksReady, product] = await Promise.all([
    prisma.weeklyProgram.count({ where: { trainerId, name: { in: G3D_PROGRAM_NAMES } } }),
    prisma.product.findUnique({ where: { slug: G3D_SLUG }, select: { id: true } }),
  ])
  const totalWeeks = GLUTEOS_3D.length
  return { weeksReady, totalWeeks, productId: product?.id ?? null, complete: weeksReady >= totalWeeks && !!product }
}

export async function setupGluteos3D(trainerId: string) {
  return prisma.$transaction(
    async (tx) => {
      // trava: dois cliques ao mesmo tempo não cadastram em dobro
      await tx.$executeRawUnsafe('SELECT pg_advisory_xact_lock(4242002)')

      // 1. Exercícios: reaproveita os da biblioteca pelo nome e cria só os que faltam
      const existing = await tx.exercise.findMany({ where: { trainerId }, select: { id: true, name: true } })
      const byName = new Map(existing.map((e) => [e.name.trim().toLowerCase(), e.id]))
      const newExercises = G3D_EXERCISES.filter((e) => !byName.has(e.name.trim().toLowerCase())).map((e) => ({
        id: randomUUID(),
        trainerId,
        name: e.name,
        muscleGroup: e.muscleGroup,
        equipment: e.equipment ?? null,
      }))
      if (newExercises.length > 0) {
        await tx.exercise.createMany({ data: newExercises })
        for (const e of newExercises) byName.set(e.name.trim().toLowerCase(), e.id)
      }
      const idOf = (name: string) => {
        const id = byName.get(name.trim().toLowerCase())
        if (!id) throw new Error(`Exercício não encontrado: ${name}`)
        return id
      }

      // 2. Quais semanas faltam
      const programs = await tx.weeklyProgram.findMany({
        where: { trainerId, name: { in: G3D_PROGRAM_NAMES } },
        select: { id: true, name: true },
      })
      const programIdByName = new Map(programs.map((p) => [p.name, p.id]))
      const missingWeeks = GLUTEOS_3D.filter((w) => !programIdByName.has(g3dProgramName(w.week, w.phase)))

      // 3. Treinos soltos de uma tentativa anterior que parou no meio (sem semana, sem aluna, sem histórico)
      const missingWorkoutNames = missingWeeks.flatMap((w) => w.workouts.map((wo) => g3dWorkoutName(w.week, wo.title)))
      if (missingWorkoutNames.length > 0) {
        const leftovers = await tx.workout.findMany({
          where: {
            trainerId,
            name: { in: missingWorkoutNames },
            programDays: { none: {} },
            assignments: { none: {} },
            calendarEntries: { none: {} },
            ratings: { none: {} },
          },
          select: { id: true },
        })
        const ids = leftovers.map((w) => w.id)
        if (ids.length > 0) {
          await tx.blockExercise.deleteMany({ where: { block: { workoutId: { in: ids } } } })
          await tx.workoutExercise.deleteMany({ where: { workoutId: { in: ids } } })
          await tx.workout.deleteMany({ where: { id: { in: ids } } })
        }
      }

      // 4. Monta as semanas que faltam e grava tudo de uma vez
      const workouts: { id: string; trainerId: string; name: string; goal: string; difficulty: string; isTemplate: boolean }[] = []
      const blocks: {
        id: string
        workoutId: string
        order: number
        type: G3DBlockType
        exerciseId: string
        sets: number
        reps: string
        restSeconds: null
        notes: string | null
      }[] = []
      const extras: { id: string; blockId: string; exerciseId: string; order: number }[] = []
      const newPrograms: { id: string; trainerId: string; name: string; createdAt: Date }[] = []
      const days: { id: string; programId: string; weekday: number; workoutId: string }[] = []
      const now = Date.now()

      for (const week of missingWeeks) {
        const programId = randomUUID()
        const programName = g3dProgramName(week.week, week.phase)
        // semana 6 fica como a mais recente, igual quando eram criadas uma a uma
        newPrograms.push({ id: programId, trainerId, name: programName, createdAt: new Date(now - (10 - week.week) * 1000) })
        programIdByName.set(programName, programId)

        for (const w of week.workouts) {
          const workoutId = randomUUID()
          workouts.push({
            id: workoutId,
            trainerId,
            name: g3dWorkoutName(week.week, w.title),
            goal: g3dWorkoutGoal(week.phase, w.rest),
            difficulty: 'Intermediário',
            isTemplate: true,
          })
          w.blocks.forEach((b, order) => {
            const blockId = randomUUID()
            blocks.push({
              id: blockId,
              workoutId,
              order,
              type: b.type,
              exerciseId: idOf(b.exercises[0]),
              sets: b.sets,
              reps: b.reps,
              restSeconds: null, // descanso fica no texto do treino (faixa do PDF)
              notes: b.notes ?? null,
            })
            b.exercises.slice(1).forEach((name, idx) => extras.push({ id: randomUUID(), blockId, exerciseId: idOf(name), order: idx }))
          })
          days.push({ id: randomUUID(), programId, weekday: w.weekday, workoutId })
        }
      }

      if (workouts.length > 0) {
        await tx.workout.createMany({ data: workouts })
        await tx.workoutExercise.createMany({ data: blocks })
        if (extras.length > 0) await tx.blockExercise.createMany({ data: extras })
        await tx.weeklyProgram.createMany({ data: newPrograms })
        await tx.weeklyProgramDay.createMany({ data: days })
      }

      // 5. Planilha "Glúteos 3D" na loja, ligada às 6 semanas. Começa como rascunho:
      //    coloque "À venda" em Planilhas depois de configurar o aviso da Ticto.
      let productCreated = false
      const product = await tx.product.findUnique({ where: { slug: G3D_SLUG }, select: { id: true } })
      let productId = product?.id ?? null
      if (!product) {
        productId = randomUUID()
        await tx.product.create({
          data: {
            id: productId,
            trainerId,
            slug: G3D_SLUG,
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
          },
        })
        await tx.productWeek.createMany({
          data: GLUTEOS_3D.map((w) => ({
            id: randomUUID(),
            productId: productId!,
            week: w.week,
            programId: programIdByName.get(g3dProgramName(w.week, w.phase))!,
          })),
        })
        productCreated = true
      }

      return {
        exercisesCreated: newExercises.length,
        workoutsCreated: workouts.map((w) => w.name),
        programsCreated: newPrograms.map((p) => p.name),
        productCreated,
        productId,
      }
    },
    { maxWait: 15000, timeout: 50000 },
  )
}
