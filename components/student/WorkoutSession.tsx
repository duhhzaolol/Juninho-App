'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Stepper } from '@/components/shared/Stepper'

interface ExerciseData {
  id: string
  name: string
  muscleGroup: string
}

interface ExerciseBlock {
  exercise: ExerciseData
  sets: number
  targetReps: string
  defaultLoad: number
}

interface WorkoutSessionProps {
  workoutId: string
  workoutName: string
  blocks: ExerciseBlock[]
}

interface SetState {
  load: number
  reps: number
  done: boolean
}

const REMINDER_MS = 10 * 60 * 1000 // 10 minutos sem registrar nada

export function WorkoutSession({ workoutId, workoutName, blocks }: WorkoutSessionProps) {
  const router = useRouter()
  const [sets, setSets] = useState<SetState[][]>(() =>
    blocks.map((b) =>
      Array.from({ length: b.sets }, () => ({
        load: b.defaultLoad,
        reps: parseInt(b.targetReps) || 10,
        done: false,
      }))
    )
  )
  const [elapsed, setElapsed] = useState(0)
  const [finishing, setFinishing] = useState(false)
  const [showReminder, setShowReminder] = useState(false)
  const lastActivity = useRef(Date.now())

  // Cronômetro do treino inteiro
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

  // Lembrete: se passar tempo demais sem registrar nenhuma série, avisa
  // (funciona enquanto o app está aberto — não é uma notificação push de verdade)
  useEffect(() => {
    const check = setInterval(() => {
      if (Date.now() - lastActivity.current > REMINDER_MS) setShowReminder(true)
    }, 30_000)
    return () => clearInterval(check)
  }, [])

  function updateSet(bi: number, si: number, field: 'load' | 'reps', value: number) {
    setSets((prev) => {
      const copy = prev.map((arr) => [...arr])
      copy[bi][si] = { ...copy[bi][si], [field]: value }
      return copy
    })
  }

  function completeSet(bi: number, si: number) {
    const set = sets[bi][si]
    setSets((prev) => {
      const copy = prev.map((arr) => [...arr])
      copy[bi][si] = { ...copy[bi][si], done: true }
      return copy
    })
    lastActivity.current = Date.now()
    setShowReminder(false)

    // Salva imediatamente — se a pessoa fechar o app no meio do treino, não perde nada
    fetch('/api/progress', {
      method: 'POST',
      body: JSON.stringify({ exerciseId: blocks[bi].exercise.id, loadKg: set.load, reps: set.reps }),
    }).catch(() => {})
  }

  async function finishWorkout() {
    setFinishing(true)
    localStorage.removeItem(`workout-start-${workoutId}`)
    try {
      await fetch(`/api/workouts/${workoutId}/complete`, { method: 'POST' })
    } finally {
      router.push('/dashboard')
    }
  }

  const totalSets = sets.flat().length
  const doneSets = sets.flat().filter((s) => s.done).length
  const emm = String(Math.floor(elapsed / 60)).padStart(2, '0')
  const ess = String(elapsed % 60).padStart(2, '0')

  return (
    <main className="min-h-screen bg-navy pb-32 px-5 pt-8">
      <div className="flex items-center justify-between mb-1">
        <p className="font-display font-bold text-lg text-white">{workoutName}</p>
        <span className="text-xs text-gold-light font-display font-semibold">⏱ {emm}:{ess}</span>
      </div>
      <p className="text-[11px] text-white/40 mb-5">{doneSets}/{totalSets} séries registradas</p>

      {showReminder && (
        <div className="bg-purple-dark border border-purple-light/40 rounded-control px-4 py-3 mb-5 flex items-center justify-between gap-3">
          <p className="text-xs text-white">Não esqueça de anotar a carga das próximas séries 💪</p>
          <button onClick={() => setShowReminder(false)} className="text-white/40 text-xs shrink-0">✕</button>
        </div>
      )}

      <div className="flex flex-col gap-6 mb-8">
        {blocks.map((block, bi) => (
          <div key={block.exercise.id}>
            <p className="font-display font-semibold text-sm text-white mb-1">
              {bi + 1}. {block.exercise.name}
            </p>
            <p className="text-[11px] text-white/40 mb-2">{block.exercise.muscleGroup}</p>

            <div className="flex flex-col gap-2">
              {sets[bi].map((set, si) => (
                <div
                  key={si}
                  className={`flex items-center justify-between rounded-control px-3 py-2 border ${
                    set.done ? 'bg-gold/10 border-gold/30' : 'bg-navy-light border-white/10'
                  }`}
                >
                  <span className="font-display font-bold text-xs text-white/60 w-14 shrink-0">
                    Série {si + 1}
                  </span>
                  <Stepper
                    value={set.load}
                    onChange={(v) => updateSet(bi, si, 'load', v)}
                    step={2.5}
                    suffix="kg"
                    disabled={set.done}
                  />
                  <Stepper
                    value={set.reps}
                    onChange={(v) => updateSet(bi, si, 'reps', v)}
                    step={1}
                    suffix="reps"
                    disabled={set.done}
                  />
                  {set.done ? (
                    <span className="text-[11px] font-semibold text-gold-light w-16 text-right shrink-0">Feita ✓</span>
                  ) : (
                    <button
                      onClick={() => completeSet(bi, si)}
                      className="text-[11px] font-display font-semibold px-3 py-1.5 rounded-control bg-gold text-navy w-16 shrink-0"
                    >
                      Concluir
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={finishWorkout}
        disabled={finishing}
        className="w-full font-display font-semibold text-sm bg-gold text-navy py-3.5 rounded-control"
      >
        {finishing ? 'Finalizando...' : 'Terminar treino'}
      </button>
    </main>
  )
}
