import Link from 'next/link'
import { prisma } from '@/lib/prisma'

export default async function WorkoutPage({ params }: { params: Promise<{ workoutId: string }> }) {
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

  return (
    <main className="min-h-screen bg-navy pb-28 px-5 pt-8">
      <Link href="/dashboard" className="text-white/50 text-sm mb-4 inline-block">← Voltar</Link>

      <p className="font-display font-bold text-xl text-white mb-1">{workout.name}</p>
      <div className="flex gap-3 text-xs text-white/50 mb-6">
        {workout.goal && <span>{workout.goal}</span>}
        {workout.estimatedMin && <span>· {workout.estimatedMin} min</span>}
        {workout.difficulty && <span>· {workout.difficulty}</span>}
      </div>

      <div className="flex flex-col gap-3">
        {workout.blocks.map((block, i) => (
          <Link
            key={block.id}
            href={`/treino/${workout.id}/exercicio/${block.exerciseId ?? block.id}`}
            className="flex items-center justify-between bg-navy-light border border-white/10 rounded-control px-4 py-3"
          >
            <div>
              <p className="text-sm text-white">
                {i + 1}. {block.exercise?.name ?? block.type}
              </p>
              <p className="text-xs text-white/40">
                {block.sets}x{block.reps} {block.loadKg ? `· ${block.loadKg}kg` : ''}
              </p>
            </div>
            <span className="text-white/30">›</span>
          </Link>
        ))}
      </div>
    </main>
  )
}
