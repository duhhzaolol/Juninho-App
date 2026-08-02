import { prisma } from '@/lib/prisma'
import { WorkoutBuilder } from '@/components/trainer/workout-builder/WorkoutBuilder'
import { WorkoutBlockData } from '@/components/trainer/workout-builder/WorkoutBlockCard'

export default async function EditWorkoutPage({ params }: { params: Promise<{ workoutId: string }> }) {
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

  const initialBlocks: WorkoutBlockData[] = workout.blocks.map((b) => ({
    id: b.id,
    type: b.type,
    exerciseId: b.exerciseId,
    exerciseNames: b.exercise ? [b.exercise.name] : [],
    sets: b.sets ?? 3,
    reps: b.reps ?? '10-12',
    loadKg: b.loadKg,
    restSeconds: b.restSeconds ?? 60,
    notes: b.notes ?? undefined,
  }))

  return <WorkoutBuilder workoutId={workout.id} initialName={workout.name} initialBlocks={initialBlocks} />
}
