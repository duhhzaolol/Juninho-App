import { PrismaClient, BlockType, DayStatus } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const passwordHash = await hash('123456', 10)

  // Professor
  const trainerUser = await prisma.user.create({
    data: {
      name: 'Juninho Moro',
      email: 'juninho@jmteam.app',
      passwordHash,
      role: 'TRAINER',
      trainerProfile: { create: { bio: 'Personal trainer especialista em hipertrofia.', brandName: 'JM Team' } },
    },
    include: { trainerProfile: true },
  })
  const trainer = trainerUser.trainerProfile!

  // Exercícios
  const agachamento = await prisma.exercise.create({
    data: {
      trainerId: trainer.id,
      name: 'Agachamento livre',
      muscleGroup: 'Glúteos, quadríceps',
      equipment: 'Barra',
      description: 'Agachamento com barra livre nas costas.',
      correctForm: 'Desça controlando o quadril para trás, joelhos alinhados com a ponta dos pés.',
      commonMistakes: 'Joelhos caindo para dentro, perder a curvatura lombar.',
    },
  })
  const elevacaoPelvica = await prisma.exercise.create({
    data: {
      trainerId: trainer.id,
      name: 'Elevação pélvica',
      muscleGroup: 'Glúteos',
      equipment: 'Barra',
      description: 'Elevação de quadril com barra apoiada.',
      correctForm: 'Contraia o glúteo no topo do movimento, sem hiperextender a lombar.',
      commonMistakes: 'Usar impulso das pernas, não completar a extensão do quadril.',
    },
  })

  // Plano
  const plan = await prisma.plan.create({
    data: { trainerId: trainer.id, type: 'PROGRAMA', name: 'Programa Glúteos 3D', priceCents: 9700 },
  })

  // Aluna
  const studentUser = await prisma.user.create({
    data: {
      name: 'Carla Silva',
      email: 'carla@aluna.app',
      passwordHash,
      role: 'STUDENT',
      studentProfile: {
        create: {
          trainerId: trainer.id,
          goal: 'Hipertrofia de glúteos',
          weightKg: 62,
          heightCm: 165,
          age: 27,
          level: 'Intermediário',
        },
      },
    },
    include: { studentProfile: true },
  })
  const student = studentUser.studentProfile!

  await prisma.subscription.create({
    data: { studentId: student.id, planId: plan.id, status: 'active' },
  })

  // Treino
  const workout = await prisma.workout.create({
    data: {
      trainerId: trainer.id,
      name: 'Treino Glúteos 3D',
      goal: 'Hipertrofia',
      estimatedMin: 50,
      difficulty: 'Intermediário',
      blocks: {
        create: [
          { order: 0, type: BlockType.EXERCISE, exerciseId: agachamento.id, sets: 4, reps: '10-12', loadKg: 40, rpe: 8, restSeconds: 90 },
          { order: 1, type: BlockType.EXERCISE, exerciseId: elevacaoPelvica.id, sets: 4, reps: '12-15', loadKg: 50, rpe: 8, restSeconds: 60 },
        ],
      },
    },
  })

  await prisma.workoutAssignment.create({
    data: { studentId: student.id, workoutId: workout.id, currentWeek: 2, currentDay: 3, status: 'active' },
  })

  // Histórico de carga (últimos 10 dias, pra alimentar o gráfico de evolução)
  for (let i = 9; i >= 0; i--) {
    const date = new Date(Date.now() - i * 86400000)
    await prisma.exerciseLog.create({
      data: { studentId: student.id, exerciseId: agachamento.id, date, loadKg: 38 + (9 - i) * 0.5, reps: 10 },
    })
    await prisma.calendarEntry.create({
      data: { studentId: student.id, date, status: i % 3 === 0 ? DayStatus.MISSED : DayStatus.TRAINED },
    })
  }

  // Conteúdo de biblioteca
  await prisma.libraryContent.create({
    data: {
      trainerId: trainer.id,
      type: 'VIDEO',
      category: 'Mobilidade',
      title: 'Aquecimento de quadril — 5 minutos',
      url: 'https://example.com/aquecimento',
    },
  })

  console.log('Seed concluído:')
  console.log('  Professor: juninho@jmteam.app / 123456')
  console.log('  Aluna:     carla@aluna.app / 123456')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
