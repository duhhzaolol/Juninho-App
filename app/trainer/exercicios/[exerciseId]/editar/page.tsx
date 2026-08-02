import { prisma } from '@/lib/prisma'
import { Sidebar } from '@/components/trainer/Sidebar'
import { ExerciseForm } from '@/components/trainer/ExerciseForm'

export default async function EditExercisePage({ params }: { params: Promise<{ exerciseId: string }> }) {
  const { exerciseId } = await params
  const exercise = await prisma.exercise.findUnique({ where: { id: exerciseId } })
  if (!exercise) return null

  return (
    <div className="min-h-screen bg-navy flex flex-col md:flex-row">
      <Sidebar />
      <main className="flex-1 px-6 py-8 max-w-xl">
        <p className="font-display font-bold text-xl text-white mb-6">Editar exercício</p>
        <ExerciseForm
          exerciseId={exercise.id}
          initial={{
            name: exercise.name,
            muscleGroup: exercise.muscleGroup,
            equipment: exercise.equipment ?? '',
            videoUrl: exercise.videoUrl ?? '',
            gifUrl: exercise.gifUrl ?? '',
            description: exercise.description ?? '',
            correctForm: exercise.correctForm ?? '',
            commonMistakes: exercise.commonMistakes ?? '',
          }}
        />
      </main>
    </div>
  )
}
