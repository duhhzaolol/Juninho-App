import { prisma } from '@/lib/prisma'
import { WorkoutSession } from '@/components/student/WorkoutSession'

export default async function WorkoutSessionPage({
  params,
}: {
  params: Promise<{ workoutId: string }>
}) {
  const { workoutId } = await params

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

  const blocks = workout.blocks
    .filter((b) => b.exercise)
    .map((b) => ({
      exercise: {
        id: b.exercise!.id,
        name: b.exercise!.name,
        muscleGroup: b.exercise!.muscleGroup,
      },
      sets: b.sets ?? 3,
      targetReps: b.reps ?? '10-12',
      defaultLoad: b.loadKg ?? 0,
      restSeconds: b.restSeconds ?? 60,
    }))

  return <WorkoutSession workoutId={workout.id} workoutName={workout.name} blocks={blocks} />
}
