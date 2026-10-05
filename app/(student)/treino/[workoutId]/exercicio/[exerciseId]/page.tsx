import { prisma } from '@/lib/prisma'
import { ExerciseSession } from '@/components/student/ExerciseSession'

export default async function ExercisePage({
  params,
}: {
  params: Promise<{ workoutId: string; exerciseId: string }>
}) {
  const { workoutId, exerciseId } = await params

  const workout = await prisma.workout.findUnique({
    where: { id: workoutId },
    include: {
      blocks: {
        orderBy: { order: 'asc' },
        include: { exercise: true },
      },
    },
  })
  if (!workout) return null

  const sequence = workout.blocks.filter((b) => b.exerciseId)
  const index = sequence.findIndex((b) => b.exerciseId === exerciseId)
  const block = sequence[index]
  if (!block || !block.exercise) return null

  const nextExerciseId = sequence[index + 1]?.exerciseId ?? null
  const isLast = index === sequence.length - 1

  return (
    <ExerciseSession
      workoutId={workoutId}
      exercise={{
        id: block.exercise.id,
        name: block.exercise.name,
        muscleGroup: block.exercise.muscleGroup,
        videoUrl: block.exercise.videoUrl,
        gifUrl: block.exercise.gifUrl,
        correctForm: block.exercise.correctForm,
        commonMistakes: block.exercise.commonMistakes,
      }}
      totalSets={block.sets ?? 3}
      targetReps={block.reps ?? '10-12'}
      defaultLoad={block.loadKg ?? 0}
      restSeconds={block.restSeconds ?? 60}
      nextExerciseId={nextExerciseId}
      isLast={isLast}
      progress={{ current: index + 1, total: sequence.length }}
    />
  )
}
