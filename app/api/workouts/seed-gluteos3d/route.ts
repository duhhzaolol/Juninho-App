import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const NEW_EXERCISES: { name: string; muscleGroup: string }[] = [
  { name: 'Ostra com Mini Band', muscleGroup: 'Glúteos' },
  { name: 'Passada Lateral com Mini Band', muscleGroup: 'Glúteos' },
  { name: 'Step com Banco ou Halteres', muscleGroup: 'Glúteos, quadríceps' },
  { name: 'Tríceps Francês Unilateral', muscleGroup: 'Tríceps' },
  { name: 'Pull Down', muscleGroup: 'Costas' },
  { name: 'Rosca na Polia com Halteres', muscleGroup: 'Bíceps' },
  { name: 'Tríceps no Banco', muscleGroup: 'Tríceps' },
  { name: 'Remada Máquina', muscleGroup: 'Costas' },
  { name: 'Abdominal Remador', muscleGroup: 'Abdômen' },
  { name: 'Afundo no Smith com Step na Frente', muscleGroup: 'Glúteos, quadríceps' },
  { name: 'Abdução de Quadril com Mini Band', muscleGroup: 'Glúteos' },
  { name: 'Abdução Máquina Lateral com Band', muscleGroup: 'Glúteos' },
  { name: 'Remada Baixa com Triângulo', muscleGroup: 'Costas' },
  { name: 'Elevação Frontal em Y', muscleGroup: 'Ombro' },
  { name: 'Crucifixo Inverso com Halteres', muscleGroup: 'Ombro, costas' },
  { name: 'Abdominal Infra na Polia', muscleGroup: 'Abdômen' },
  { name: 'Extensão de Quadril com Mini Band', muscleGroup: 'Glúteos' },
  { name: 'Elevação Pélvica Unilateral', muscleGroup: 'Glúteos' },
  { name: 'Hack V-Squat', muscleGroup: 'Quadríceps, glúteos' },
  { name: 'Leg Horizontal Unilateral', muscleGroup: 'Quadríceps' },
]

type Block = {
  type: 'EXERCISE' | 'SUPERSET' | 'DROPSET' | 'REST_PAUSE' | 'BISET' | 'CIRCUIT'
  exercise: string
  sets: number
  reps: string
  rest: number
  notes?: string
}

const R90 = 90
const R50 = 50

const DAYS: { name: string; weekday: number; goal: string; blocks: Block[] }[] = [
  {
    name: 'Glúteos 3D - Segunda (Glúteos/Posterior)',
    weekday: 1,
    goal: 'Ênfase em glúteos, estímulo em posterior',
    blocks: [
      { type: 'EXERCISE', exercise: 'Ostra com Mini Band', sets: 3, reps: '12-15', rest: R90, notes: 'Pré-ativação de glúteo' },
      { type: 'EXERCISE', exercise: 'Passada Lateral com Mini Band', sets: 3, reps: '12-15', rest: R90, notes: 'Pré-ativação de glúteo' },
      { type: 'REST_PAUSE', exercise: 'Elevação Pélvica', sets: 3, reps: '12-15', rest: R90, notes: '2 séries de 12-15 + 1 cluster set (4-4-4)' },
      { type: 'EXERCISE', exercise: 'Agachamento Sumô', sets: 3, reps: '12-15', rest: R90 },
      { type: 'EXERCISE', exercise: 'Agachamento Búlgaro', sets: 3, reps: '12-15', rest: R90 },
      { type: 'EXERCISE', exercise: 'Extensão de Quadril na Polia', sets: 3, reps: '12-15', rest: R90 },
      { type: 'DROPSET', exercise: 'Cadeira Abdutora', sets: 3, reps: '12-15', rest: R90, notes: '2 séries de 12-15 + 1 drop set' },
      { type: 'EXERCISE', exercise: 'Step com Banco ou Halteres', sets: 3, reps: '12-15', rest: R90 },
    ],
  },
  {
    name: 'Glúteos 3D - Terça (Costas/Ombros/Tríceps/Abdômen)',
    weekday: 2,
    goal: 'Costas, ombros, tríceps e abdômen',
    blocks: [
      { type: 'SUPERSET', exercise: 'Desenvolvimento com Halteres', sets: 3, reps: '12-15', rest: 0, notes: 'Superserie com: Tríceps Francês Unilateral' },
      { type: 'SUPERSET', exercise: 'Tríceps Francês Unilateral', sets: 3, reps: '12-15', rest: R50 },
      { type: 'SUPERSET', exercise: 'Pull Down', sets: 3, reps: '12-15', rest: 0, notes: 'Superserie com: Rosca na Polia com Halteres' },
      { type: 'SUPERSET', exercise: 'Rosca na Polia com Halteres', sets: 3, reps: '12-15', rest: R50 },
      { type: 'SUPERSET', exercise: 'Remada Unilateral', sets: 3, reps: '12-15', rest: 0, notes: 'Superserie com: Tríceps no Banco' },
      { type: 'SUPERSET', exercise: 'Tríceps no Banco', sets: 3, reps: '12-15', rest: R50 },
      { type: 'SUPERSET', exercise: 'Desenvolvimento com Halteres', sets: 3, reps: '12-15', rest: 0, notes: 'Superserie com: Elevação Frontal' },
      { type: 'SUPERSET', exercise: 'Elevação Frontal', sets: 3, reps: '12-15', rest: R50 },
      { type: 'EXERCISE', exercise: 'Remada Máquina', sets: 3, reps: '12-15', rest: R50, notes: 'Alternativa: Pulldown Frontal' },
      { type: 'SUPERSET', exercise: 'Abdominal Infra', sets: 3, reps: '12-15', rest: 0, notes: 'Superserie com: Abdominal Remador' },
      { type: 'SUPERSET', exercise: 'Abdominal Remador', sets: 3, reps: '12-15', rest: R50 },
    ],
  },
  {
    name: 'Glúteos 3D - Quarta (Quadríceps/Glúteo)',
    weekday: 3,
    goal: 'Ênfase em quadríceps, estímulo em glúteo',
    blocks: [
      { type: 'EXERCISE', exercise: 'Agachamento Livre', sets: 3, reps: '12-15', rest: R90, notes: 'Pode ser feito no Smith' },
      { type: 'EXERCISE', exercise: 'Agachamento Hack', sets: 3, reps: '12-15', rest: R90 },
      { type: 'REST_PAUSE', exercise: 'Leg Press 45°', sets: 3, reps: '12-15', rest: R90, notes: '2 séries de 12-15 + 1 cluster set (4-4-4)' },
      { type: 'DROPSET', exercise: 'Cadeira Extensora', sets: 3, reps: '12-15', rest: R90, notes: '2 séries de 12-15 + 1 back-off set' },
      { type: 'EXERCISE', exercise: 'Afundo no Smith com Step na Frente', sets: 3, reps: '12-15', rest: R90 },
      { type: 'EXERCISE', exercise: 'Abdução de Quadril com Mini Band', sets: 3, reps: '12-15', rest: R90 },
      { type: 'EXERCISE', exercise: 'Abdução Máquina Lateral com Band', sets: 3, reps: '12-15', rest: R90 },
    ],
  },
  {
    name: 'Glúteos 3D - Quinta (Superior Completo)',
    weekday: 4,
    goal: 'Superior completo',
    blocks: [
      { type: 'SUPERSET', exercise: 'Pull Down', sets: 3, reps: '12-15', rest: 0, notes: 'Superserie com: Rosca Direta com Barra' },
      { type: 'SUPERSET', exercise: 'Rosca Direta', sets: 3, reps: '12-15', rest: R50 },
      { type: 'SUPERSET', exercise: 'Remada Baixa com Triângulo', sets: 3, reps: '12-15', rest: 0, notes: 'Superserie com: Rosca Martelo' },
      { type: 'SUPERSET', exercise: 'Rosca Martelo', sets: 3, reps: '12-15', rest: R50 },
      { type: 'SUPERSET', exercise: 'Supino Máquina', sets: 3, reps: '12-15', rest: 0, notes: 'Superserie com: Elevação Frontal em Y' },
      { type: 'SUPERSET', exercise: 'Elevação Frontal em Y', sets: 3, reps: '12-15', rest: R50 },
      { type: 'SUPERSET', exercise: 'Crucifixo Inverso com Halteres', sets: 3, reps: '12-15', rest: 0, notes: 'Superserie com: Tríceps Testa' },
      { type: 'SUPERSET', exercise: 'Tríceps Testa', sets: 3, reps: '12-15', rest: R50 },
      { type: 'SUPERSET', exercise: 'Abdominal Infra na Polia', sets: 3, reps: '12-15', rest: 0, notes: 'Superserie com: Prancha' },
      { type: 'SUPERSET', exercise: 'Prancha', sets: 3, reps: '12-15', rest: R50 },
      { type: 'EXERCISE', exercise: 'Abdominal Máquina', sets: 3, reps: '12-15', rest: R50 },
    ],
  },
  {
    name: 'Glúteos 3D - Sexta (Perna Completa/Glúteo)',
    weekday: 5,
    goal: 'Perna completa, ênfase em glúteo',
    blocks: [
      { type: 'EXERCISE', exercise: 'Extensão de Quadril com Mini Band', sets: 3, reps: '12-15', rest: R90, notes: 'Pré-ativação de glúteo' },
      { type: 'EXERCISE', exercise: 'Abdução de Quadril com Mini Band', sets: 3, reps: '12-15', rest: R90, notes: 'Pré-ativação de glúteo' },
      { type: 'EXERCISE', exercise: 'Elevação Pélvica Unilateral', sets: 3, reps: '12-15', rest: R90 },
      { type: 'REST_PAUSE', exercise: 'Levantamento Terra Sumô', sets: 3, reps: '12-15', rest: R90, notes: '2 séries de 12-15 + 1 cluster set (4-4-4)' },
      { type: 'EXERCISE', exercise: 'Hack V-Squat', sets: 3, reps: '12-15', rest: R90 },
      { type: 'EXERCISE', exercise: 'Leg Horizontal Unilateral', sets: 3, reps: '12-15', rest: R90 },
      { type: 'EXERCISE', exercise: 'Mesa Flexora', sets: 3, reps: '12-15', rest: R90 },
      { type: 'EXERCISE', exercise: 'Cadeira Flexora', sets: 3, reps: '12-15', rest: R90 },
    ],
  },
]

export async function POST() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const trainer = await prisma.trainerProfile.findUnique({ where: { userId: session.user.id } })
  if (!trainer) return NextResponse.json({ error: 'not a trainer' }, { status: 403 })

  // 1. Garante que os exercícios novos existem
  const existing = await prisma.exercise.findMany({ where: { trainerId: trainer.id }, select: { id: true, name: true } })
  const byName = new Map(existing.map((e) => [e.name.toLowerCase(), e.id]))

  const toCreate = NEW_EXERCISES.filter((e) => !byName.has(e.name.toLowerCase()))
  if (toCreate.length > 0) {
    await prisma.exercise.createMany({
      data: toCreate.map((e) => ({ trainerId: trainer.id, name: e.name, muscleGroup: e.muscleGroup })),
    })
    const refreshed = await prisma.exercise.findMany({ where: { trainerId: trainer.id }, select: { id: true, name: true } })
    for (const e of refreshed) byName.set(e.name.toLowerCase(), e.id)
  }

  // 2. Cria os 5 treinos com os blocos
  const createdWorkouts: string[] = []
  for (const day of DAYS) {
    const already = await prisma.workout.findFirst({ where: { trainerId: trainer.id, name: day.name } })
    if (already) continue // já existe, não duplica

    await prisma.workout.create({
      data: {
        trainerId: trainer.id,
        name: day.name,
        goal: day.goal,
        blocks: {
          create: day.blocks.map((b, i) => ({
            order: i,
            type: b.type,
            exerciseId: byName.get(b.exercise.toLowerCase()) ?? null,
            sets: b.sets,
            reps: b.reps,
            restSeconds: b.rest,
            notes: b.notes ?? null,
          })),
        },
      },
    })
    createdWorkouts.push(day.name)
  }

  return NextResponse.json({ exercisesCreated: toCreate.length, workoutsCreated: createdWorkouts })
}
