import { Sidebar } from '@/components/trainer/Sidebar'
import { ExerciseForm } from '@/components/trainer/ExerciseForm'

export default function NewExercisePage() {
  return (
    <div className="min-h-screen bg-navy flex flex-col md:flex-row">
      <Sidebar />
      <main className="flex-1 px-6 py-8 max-w-xl">
        <p className="font-display font-bold text-xl text-white mb-6">Novo exercício</p>
        <ExerciseForm />
      </main>
    </div>
  )
}
