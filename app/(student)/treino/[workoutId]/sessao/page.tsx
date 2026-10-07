import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { WorkoutSession } from '@/components/student/WorkoutSession'
import { redirect } from 'next/navigation'
import { canAccessWorkout } from '@/lib/store'

export default async function WorkoutSessionPage({
  params,
}: {
  params: Promise<{ workoutId: string }>
}) {
  const session = await auth()
  const { workoutId } = await params
  if (!session?.user?.id) redirect('/login')
  if (!(await canAccessWorkout(session.user.id, workoutId))) redirect('/planilhas')

  const workout = await prisma.workout.findUnique({
    where: { id: workoutId },
    include: {
      blocks: {
        orderBy: { order: 'asc' },
        include: {
          exercise: true,
          extraItems: { orderBy: { order: 'asc' }, include: { exercise: true } },
        },
      },
    },
  })
  if (!workout) return null

  const blocks = workout.blocks
    .filter((b) => b.exercise)
    .map((b) => ({
      exercises: [
        {
          id: b.exercise!.id,
          name: b.exercise!.name,
          muscleGroup: b.exercise!.muscleGroup,
          videoUrl: b.exercise!.videoUrl,
          gifUrl: b.exercise!.gifUrl,
        },
        ...b.extraItems.map((it) => ({
          id: it.exercise.id,
          name: it.exercise.name,
          muscleGroup: it.exercise.muscleGroup,
          videoUrl: it.exercise.videoUrl,
          gifUrl: it.exercise.gifUrl,
        })),
      ],
      sets: b.sets ?? 3,
      targetReps: b.reps ?? '10-12',
      defaultLoad: b.loadKg ?? 0,
      restSeconds: b.restSeconds ?? null,
      notes: b.notes,
    }))

  return (
    <WorkoutSession
      workoutId={workout.id}
      workoutName={workout.name}
      subtitle={workout.goal}
      studentName={session?.user?.name?.split(' ')[0] ?? 'Atleta'}
      blocks={blocks}
    />
  )
}
