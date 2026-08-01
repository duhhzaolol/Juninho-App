'use client'

import { useState } from 'react'
import Link from 'next/link'
import { SetRow } from '@/components/student/SetRow'
import { RestTimer } from '@/components/student/RestTimer'

// Em produção estes dados vêm de uma query ao Prisma (exercise + workoutExercise
// pelo exerciseId/workoutId dos params), simplificado aqui para o fluxo de UI.
const exercise = {
  name: 'Agachamento',
  videoUrl: null,
  muscleGroup: 'Glúteos, quadríceps',
  correctForm: 'Desça controlando o quadril para trás, joelhos alinhados com a ponta dos pés.',
  commonMistakes: 'Joelhos caindo para dentro, perder a curvatura lombar.',
  restSeconds: 60,
  sets: [
    { setNumber: 1, targetReps: 12, load: 40, rpe: 7 },
    { setNumber: 2, targetReps: 12, load: 40, rpe: 8 },
    { setNumber: 3, targetReps: 10, load: 42, rpe: 8 },
    { setNumber: 4, targetReps: 10, load: 42, rpe: 9 },
  ],
}

export default function ExercisePage() {
  const [completed, setCompleted] = useState<number[]>([])
  const [resting, setResting] = useState(false)

  function handleComplete(setNumber: number) {
    setCompleted((prev) => [...prev, setNumber])
    setResting(true)
    // Em produção: POST para /api/progress criando um ExerciseLog
  }

  return (
    <main className="min-h-screen bg-navy pb-32 px-5 pt-8">
      <Link href="../.." className="text-white/50 text-sm mb-4 inline-block">← {exercise.name}</Link>

      <div className="bg-navy-light rounded-card h-44 mb-4 flex items-center justify-center text-white/30 text-sm">
        Vídeo / GIF do exercício
      </div>

      <p className="text-xs text-white/40 mb-6">{exercise.muscleGroup}</p>

      <div className="flex flex-col gap-2 mb-6">
        {exercise.sets.map((set) => (
          <SetRow
            key={set.setNumber}
            {...set}
            completed={completed.includes(set.setNumber)}
            onComplete={() => handleComplete(set.setNumber)}
          />
        ))}
      </div>

      <details className="text-xs text-white/50">
        <summary className="cursor-pointer text-white/70 mb-1">Execução correta e erros comuns</summary>
        <p className="mb-1">{exercise.correctForm}</p>
        <p>{exercise.commonMistakes}</p>
      </details>

      {resting && (
        <RestTimer seconds={exercise.restSeconds} onFinish={() => setResting(false)} />
      )}
    </main>
  )
}
