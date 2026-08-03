import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const DEFAULT_EXERCISES: { name: string; muscleGroup: string; equipment?: string }[] = [
  // Glúteos e pernas
  { name: 'Agachamento Livre', muscleGroup: 'Glúteos, quadríceps', equipment: 'Barra' },
  { name: 'Agachamento Sumô', muscleGroup: 'Glúteos, adutores', equipment: 'Barra ou halter' },
  { name: 'Agachamento Búlgaro', muscleGroup: 'Glúteos, quadríceps', equipment: 'Halteres' },
  { name: 'Agachamento Hack', muscleGroup: 'Quadríceps, glúteos', equipment: 'Máquina hack' },
  { name: 'Elevação Pélvica', muscleGroup: 'Glúteos', equipment: 'Barra ou máquina' },
  { name: 'Elevação Pélvica Unilateral', muscleGroup: 'Glúteos', equipment: 'Peso corporal ou halter' },
  { name: 'Cadeira Abdutora', muscleGroup: 'Glúteos', equipment: 'Máquina' },
  { name: 'Abdução de Quadril no Cabo', muscleGroup: 'Glúteos', equipment: 'Cabo/polia' },
  { name: 'Stiff', muscleGroup: 'Posterior de coxa, glúteos', equipment: 'Barra ou halteres' },
  { name: 'Levantamento Terra Sumô', muscleGroup: 'Posterior de coxa, glúteos', equipment: 'Barra' },
  { name: 'Leg Press 45°', muscleGroup: 'Quadríceps, glúteos', equipment: 'Máquina' },
  { name: 'Cadeira Extensora', muscleGroup: 'Quadríceps', equipment: 'Máquina' },
  { name: 'Cadeira Flexora', muscleGroup: 'Posterior de coxa', equipment: 'Máquina' },
  { name: 'Mesa Flexora', muscleGroup: 'Posterior de coxa', equipment: 'Máquina' },
  { name: 'Afundo / Passada', muscleGroup: 'Glúteos, quadríceps', equipment: 'Halteres ou smith' },
  { name: 'Extensão de Quadril na Polia', muscleGroup: 'Glúteos', equipment: 'Cabo/polia' },
  { name: 'Panturrilha em Pé', muscleGroup: 'Panturrilha', equipment: 'Máquina ou smith' },

  // Costas
  { name: 'Puxada Aberta', muscleGroup: 'Costas', equipment: 'Polia alta' },
  { name: 'Puxada Frontal', muscleGroup: 'Costas', equipment: 'Polia alta' },
  { name: 'Remada Baixa', muscleGroup: 'Costas', equipment: 'Polia baixa' },
  { name: 'Remada Unilateral', muscleGroup: 'Costas', equipment: 'Halter' },
  { name: 'Levantamento Terra', muscleGroup: 'Costas, posterior de coxa', equipment: 'Barra' },

  // Ombro
  { name: 'Desenvolvimento com Halteres', muscleGroup: 'Ombro', equipment: 'Halteres' },
  { name: 'Elevação Lateral', muscleGroup: 'Ombro', equipment: 'Halteres' },
  { name: 'Elevação Frontal', muscleGroup: 'Ombro', equipment: 'Halteres' },
  { name: 'Face Pull', muscleGroup: 'Ombro, costas', equipment: 'Corda/polia' },

  // Peito
  { name: 'Supino Reto', muscleGroup: 'Peito', equipment: 'Barra' },
  { name: 'Supino Máquina', muscleGroup: 'Peito', equipment: 'Máquina' },
  { name: 'Crucifixo', muscleGroup: 'Peito', equipment: 'Halteres' },
  { name: 'Crossover', muscleGroup: 'Peito', equipment: 'Cabo/polia' },

  // Braços
  { name: 'Rosca Direta', muscleGroup: 'Bíceps', equipment: 'Barra W' },
  { name: 'Rosca Martelo', muscleGroup: 'Bíceps', equipment: 'Halteres' },
  { name: 'Tríceps Testa', muscleGroup: 'Tríceps', equipment: 'Halteres ou barra' },
  { name: 'Tríceps Corda', muscleGroup: 'Tríceps', equipment: 'Corda/polia' },

  // Abdômen
  { name: 'Abdominal Infra', muscleGroup: 'Abdômen', equipment: 'Solo' },
  { name: 'Abdominal Máquina', muscleGroup: 'Abdômen', equipment: 'Máquina' },
  { name: 'Prancha', muscleGroup: 'Abdômen', equipment: 'Solo' },
]

export async function POST() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const trainer = await prisma.trainerProfile.findUnique({ where: { userId: session.user.id } })
  if (!trainer) return NextResponse.json({ error: 'not a trainer' }, { status: 403 })

  const existing = await prisma.exercise.findMany({
    where: { trainerId: trainer.id },
    select: { name: true },
  })
  const existingNames = new Set(existing.map((e) => e.name.toLowerCase()))

  const toCreate = DEFAULT_EXERCISES.filter((e) => !existingNames.has(e.name.toLowerCase()))

  if (toCreate.length > 0) {
    await prisma.exercise.createMany({
      data: toCreate.map((e) => ({
        trainerId: trainer.id,
        name: e.name,
        muscleGroup: e.muscleGroup,
        equipment: e.equipment ?? null,
      })),
    })
  }

  return NextResponse.json({ created: toCreate.length, skipped: DEFAULT_EXERCISES.length - toCreate.length })
}
