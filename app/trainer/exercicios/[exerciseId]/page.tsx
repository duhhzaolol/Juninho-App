import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Sidebar } from '@/components/trainer/Sidebar'

export default async function ExerciseDetailPage({ params }: { params: Promise<{ exerciseId: string }> }) {
  const { exerciseId } = await params
  const exercise = await prisma.exercise.findUnique({ where: { id: exerciseId } })
  if (!exercise) return null

  return (
    <div className="min-h-screen bg-navy flex flex-col md:flex-row">
      <Sidebar />

      <main className="flex-1 px-6 py-8 max-w-xl">
        <Link href="/trainer/exercicios" className="text-white/50 text-sm mb-4 inline-block">← Biblioteca</Link>

        <div className="h-48 rounded-card bg-navy-light mb-4 flex items-center justify-center text-white/20 text-xs">
          {exercise.gifUrl ? 'GIF' : exercise.videoUrl ? 'Vídeo' : 'Sem mídia cadastrada'}
        </div>

        <p className="font-display font-bold text-xl text-white mb-1">{exercise.name}</p>
        <p className="text-xs text-gold-light mb-6">{exercise.muscleGroup} {exercise.equipment && `· ${exercise.equipment}`}</p>

        {exercise.description && (
          <div className="mb-4">
            <p className="text-[11px] uppercase tracking-wider text-white/40 mb-1">Descrição</p>
            <p className="text-sm text-white/80">{exercise.description}</p>
          </div>
        )}
        {exercise.correctForm && (
          <div className="mb-4">
            <p className="text-[11px] uppercase tracking-wider text-white/40 mb-1">Execução correta</p>
            <p className="text-sm text-white/80">{exercise.correctForm}</p>
          </div>
        )}
        {exercise.commonMistakes && (
          <div className="mb-4">
            <p className="text-[11px] uppercase tracking-wider text-white/40 mb-1">Erros comuns</p>
            <p className="text-sm text-white/80">{exercise.commonMistakes}</p>
          </div>
        )}
      </main>
    </div>
  )
}
