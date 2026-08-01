'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface ExerciseData {
  id: string
  name: string
  muscleGroup: string
  videoUrl: string | null
  gifUrl: string | null
  correctForm: string | null
  commonMistakes: string | null
}

interface ExerciseSessionProps {
  workoutId: string
  exercise: ExerciseData
  totalSets: number
  targetReps: string
  defaultLoad: number
  restSeconds: number
  nextExerciseId: string | null
  isLast: boolean
  progress: { current: number; total: number }
}

export function ExerciseSession({
  workoutId,
  exercise,
  totalSets,
  targetReps,
  defaultLoad,
  restSeconds,
  nextExerciseId,
  isLast,
  progress,
}: ExerciseSessionProps) {
  const router = useRouter()
  const [sets, setSets] = useState(
    Array.from({ length: totalSets }, () => ({
      load: defaultLoad,
      reps: parseInt(targetReps) || 10,
      done: false,
    }))
  )
  const [resting, setResting] = useState(false)
  const [seconds, setSeconds] = useState(restSeconds)
  const [finishing, setFinishing] = useState(false)
  const [elapsed, setElapsed] = useState(0)

  // Cronômetro do treino inteiro — persiste entre exercícios via localStorage
  useEffect(() => {
    const key = `workout-start-${workoutId}`
    let start = localStorage.getItem(key)
    if (!start) {
      start = String(Date.now())
      localStorage.setItem(key, start)
    }
    const startTime = Number(start)
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [workoutId])

  // Cronômetro de descanso entre séries
  useEffect(() => {
    if (!resting) return
    if (seconds <= 0) {
      setResting(false)
      return
    }
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [resting, seconds])

  function updateSet(i: number, field: 'load' | 'reps', value: number) {
    setSets((prev) => prev.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)))
  }

  function completeSet(i: number) {
    const set = sets[i]
    setSets((prev) => prev.map((s, idx) => (idx === i ? { ...s, done: true } : s)))
    setSeconds(restSeconds)
    setResting(true)

    // Salva a carga real usada — é isso que alimenta os gráficos de evolução
    fetch('/api/progress', {
      method: 'POST',
      body: JSON.stringify({ exerciseId: exercise.id, loadKg: set.load, reps: set.reps }),
    }).catch(() => {})
  }

  const allDone = sets.every((s) => s.done)

  async function finishWorkout() {
    setFinishing(true)
    localStorage.removeItem(`workout-start-${workoutId}`)
    try {
      await fetch(`/api/workouts/${workoutId}/complete`, { method: 'POST' })
    } finally {
      router.push('/dashboard')
    }
  }

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0')
  const ss = String(seconds % 60).padStart(2, '0')
  const emm = String(Math.floor(elapsed / 60)).padStart(2, '0')
  const ess = String(elapsed % 60).padStart(2, '0')

  return (
    <main className="min-h-screen bg-navy pb-32 px-5 pt-8 relative">
      <div className="flex items-center justify-between mb-1">
        <Link href={`/treino/${workoutId}`} className="text-white/50 text-sm">← {exercise.name}</Link>
        <span className="text-xs text-gold-light font-display font-semibold" title="Tempo total de treino">
          ⏱ {emm}:{ess}
        </span>
      </div>
      <p className="text-[11px] text-white/40 mb-4">Exercício {progress.current} de {progress.total}</p>

      <div className="h-44 rounded-card bg-navy-light mb-4 flex items-center justify-center text-white/30 text-sm">
        Vídeo / GIF do exercício
      </div>

      <p className="text-xs text-white/40 mb-6">{exercise.muscleGroup}</p>

      <div className="flex flex-col gap-2 mb-6">
        {sets.map((set, i) => (
          <div
            key={i}
            className={`rounded-control px-4 py-3 border ${set.done ? 'bg-gold/10 border-gold/30' : 'bg-navy-light border-white/10'}`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-display font-bold text-sm text-white/70">
                Série {i + 1} · meta {targetReps}
              </span>
              {set.done ? (
                <span className="text-xs font-semibold text-gold-light">Concluída</span>
              ) : (
                <button
                  onClick={() => completeSet(i)}
                  className="text-xs font-display font-semibold px-4 py-1.5 rounded-control bg-gold text-navy"
                >
                  Concluir
                </button>
              )}
            </div>
            <div className="flex gap-3">
              <label className="flex-1 text-[11px] text-white/40">
                Carga (kg)
                <input
                  type="number"
                  disabled={set.done}
                  value={set.load}
                  onChange={(e) => updateSet(i, 'load', Number(e.target.value))}
                  className="w-full mt-1 bg-navy border border-white/10 rounded-control px-3 py-2 text-white text-sm disabled:opacity-50"
                />
              </label>
              <label className="flex-1 text-[11px] text-white/40">
                Repetições
                <input
                  type="number"
                  disabled={set.done}
                  value={set.reps}
                  onChange={(e) => updateSet(i, 'reps', Number(e.target.value))}
                  className="w-full mt-1 bg-navy border border-white/10 rounded-control px-3 py-2 text-white text-sm disabled:opacity-50"
                />
              </label>
            </div>
          </div>
        ))}
      </div>

      {(exercise.correctForm || exercise.commonMistakes) && (
        <details className="text-[11px] text-white/50 mb-6">
          <summary className="cursor-pointer text-white/70 mb-1">Execução correta e erros comuns</summary>
          {exercise.correctForm && <p className="mb-1">{exercise.correctForm}</p>}
          {exercise.commonMistakes && <p>{exercise.commonMistakes}</p>}
        </details>
      )}

      {allDone &&
        !resting &&
        (isLast ? (
          <button
            onClick={finishWorkout}
            disabled={finishing}
            className="w-full font-display font-semibold text-sm bg-gold text-navy py-3.5 rounded-control"
          >
            {finishing ? 'Finalizando...' : 'Finalizar treino'}
          </button>
        ) : (
          <Link
            href={`/treino/${workoutId}/exercicio/${nextExerciseId}`}
            className="block text-center font-display font-semibold text-sm bg-gold text-navy py-3.5 rounded-control"
          >
            Próximo exercício →
          </Link>
        ))}

      {resting && (
        <div className="fixed bottom-6 left-5 right-5 bg-purple-dark border border-purple-light/40 rounded-card p-5 text-center">
          <p className="text-[11px] uppercase tracking-wider text-white/50 mb-1">Descanso</p>
          <p className="font-display font-extrabold text-3xl text-gold-light mb-1">{mm}:{ss}</p>
        </div>
      )}
    </main>
  )
}
