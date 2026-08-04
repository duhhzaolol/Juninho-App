import Link from 'next/link'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { BottomNav } from '@/components/student/BottomNav'
import { StartWorkoutButton } from '@/components/student/StartWorkoutButton'

export default async function WorkoutPage({ params }: { params: Promise<{ workoutId: string }> }) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const { workoutId } = await params
  const workout = await prisma.workout.findUnique({
    where: { id: workoutId },
    include: {
      blocks: {
        orderBy: { order: 'asc' },
        include: { exercise: true, extraItems: { orderBy: { order: 'asc' }, include: { exercise: true } } },
      },
    },
  })
  if (!workout) return null

  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)

  const student = await prisma.studentProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      calendarEntries: { where: { date: { gte: startOfToday } }, take: 1 },
    },
  })

  const alreadyTrainedToday = student?.calendarEntries[0]?.status === 'TRAINED'

  return (
    <main className="min-h-screen bg-navy pb-28 px-5 pt-8">
      <Link href="/dashboard" className="text-white/50 text-sm mb-4 inline-block">← Voltar</Link>

      <p className="font-display font-bold text-xl text-white mb-1">{workout.name}</p>
      <div className="flex gap-3 text-xs text-white/50 mb-6">
        {workout.goal && <span>{workout.goal}</span>}
        {workout.estimatedMin && <span>· {workout.estimatedMin} min</span>}
        {workout.difficulty && <span>· {workout.difficulty}</span>}
      </div>

      {workout.blocks[0] && (
        <StartWorkoutButton workoutId={workout.id} alreadyTrained={alreadyTrainedToday} />
      )}

      <div className="flex flex-col gap-3">
        {workout.blocks.map((block, i) => (
          <Link
            key={block.id}
            href={`/treino/${workout.id}/exercicio/${block.exerciseId ?? block.id}`}
            className="flex items-center justify-between bg-navy-light border border-white/10 rounded-control px-4 py-3"
          >
            <div>
              <p className="text-sm text-white">
                {i + 1}. {[block.exercise?.name, ...block.extraItems.map((it) => it.exercise.name)].filter(Boolean).join(' + ') || block.type}
              </p>
              <p className="text-xs text-white/40">
                {block.sets}x{block.reps} {block.loadKg ? `· ${block.loadKg}kg` : ''}
              </p>
            </div>
            <span className="text-white/30">›</span>
          </Link>
        ))}
      </div>

      <BottomNav />
    </main>
  )
}
