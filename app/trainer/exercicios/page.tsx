import Link from 'next/link'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Sidebar } from '@/components/trainer/Sidebar'

export default async function ExerciseLibraryPage({ searchParams }: { searchParams: Promise<{ grupo?: string }> }) {
  const { grupo } = await searchParams
  const session = await auth()
  const trainer = await prisma.trainerProfile.findUnique({ where: { userId: session?.user?.id } })
  if (!trainer) return null

  const exercises = await prisma.exercise.findMany({
    where: {
      trainerId: trainer.id,
      ...(grupo ? { muscleGroup: grupo } : {}),
    },
    orderBy: { muscleGroup: 'asc' },
  })

  const muscleGroups = Array.from(new Set(exercises.map((e) => e.muscleGroup)))

  return (
    <div className="min-h-screen bg-navy flex flex-col md:flex-row">
      <Sidebar />

      <main className="flex-1 px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <p className="font-display font-bold text-xl text-white">Biblioteca de exercícios</p>
          <Link href="/trainer/exercicios/novo" className="text-gold-light text-sm">+ Novo exercício</Link>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto">
          <Link
            href="/trainer/exercicios"
            className={`text-xs px-3 py-1.5 rounded-control whitespace-nowrap ${!grupo ? 'bg-gold/10 text-gold-light' : 'bg-navy-light text-white/50'}`}
          >
            Todos
          </Link>
          {muscleGroups.map((group) => (
            <Link
              key={group}
              href={`/trainer/exercicios?grupo=${encodeURIComponent(group)}`}
              className={`text-xs px-3 py-1.5 rounded-control whitespace-nowrap ${grupo === group ? 'bg-gold/10 text-gold-light' : 'bg-navy-light text-white/50'}`}
            >
              {group}
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {exercises.map((exercise) => (
            <Link
              key={exercise.id}
              href={`/trainer/exercicios/${exercise.id}`}
              className="flex gap-3 bg-navy-light border border-white/10 rounded-control p-3"
            >
              <div className="w-16 h-16 rounded-control bg-navy shrink-0 flex items-center justify-center text-white/20 text-[10px]">
                {exercise.gifUrl ? 'GIF' : 'sem mídia'}
              </div>
              <div>
                <p className="text-sm text-white">{exercise.name}</p>
                <p className="text-xs text-white/40">{exercise.muscleGroup}</p>
                {exercise.equipment && <p className="text-xs text-white/30">{exercise.equipment}</p>}
              </div>
            </Link>
          ))}

          {exercises.length === 0 && (
            <p className="text-white/40 text-sm">Nenhum exercício cadastrado ainda.</p>
          )}
        </div>
      </main>
    </div>
  )
}
