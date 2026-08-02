'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Stepper } from '@/components/shared/Stepper'
import { CheckCircle2, Star } from 'lucide-react'

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
  restSeconds: number
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
  const [resting, setResting] = useState(false)
  const [restSeconds, setRestSeconds] = useState(0)
  const [completed, setCompleted] = useState(false)
  const [completedAt, setCompletedAt] = useState<Date | null>(null)
  const [finalElapsed, setFinalElapsed] = useState(0)
  const [rating, setRating] = useState(0)
  const [ratingComment, setRatingComment] = useState('')
  const [ratingSent, setRatingSent] = useState(false)
  const [sendingRating, setSendingRating] = useState(false)
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

  // Cronômetro de descanso entre séries
  useEffect(() => {
    if (!resting) return
    if (restSeconds <= 0) {
      setResting(false)
      return
    }
    const t = setTimeout(() => setRestSeconds((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [resting, restSeconds])

  // Lembrete: se passar tempo demais sem registrar nenhuma série, avisa
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

    setRestSeconds(blocks[bi].restSeconds)
    setResting(true)

    fetch('/api/progress', {
      method: 'POST',
      body: JSON.stringify({ exerciseId: blocks[bi].exercise.id, loadKg: set.load, reps: set.reps }),
    }).catch(() => {})
  }

  async function sendRating() {
    if (rating === 0) return
    setSendingRating(true)
    await fetch(`/api/workouts/${workoutId}/rating`, {
      method: 'POST',
      body: JSON.stringify({ rating, comment: ratingComment }),
    }).catch(() => {})
    setSendingRating(false)
    setRatingSent(true)
  }

  async function finishWorkout() {
    setFinishing(true)
    setFinalElapsed(elapsed)
    try {
      await fetch(`/api/workouts/${workoutId}/complete`, { method: 'POST' })
    } finally {
      localStorage.removeItem(`workout-start-${workoutId}`)
      setCompletedAt(new Date())
      setCompleted(true)
      setFinishing(false)
    }
  }

  if (completed && completedAt) {
    const femm = String(Math.floor(finalElapsed / 60)).padStart(2, '0')
    const fess = String(finalElapsed % 60).padStart(2, '0')

    return (
      <main className="min-h-screen bg-navy flex flex-col items-center justify-center px-8 text-center">
        <div className="w-16 h-16 rounded-full bg-gold/15 flex items-center justify-center mb-4">
          <CheckCircle2 size={32} className="text-gold-light" />
        </div>
        <p className="font-display font-bold text-xl text-white mb-1">Treino concluído! 🎉</p>
        <p className="text-sm text-white/50 mb-6">
          {completedAt.toLocaleDateString('pt-BR')} às{' '}
          {completedAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        </p>
        <div className="bg-navy-light border border-white/10 rounded-card px-8 py-4 mb-6">
          <p className="text-[11px] uppercase tracking-wider text-white/40 mb-1">Tempo total</p>
          <p className="font-display font-bold text-2xl text-gold-light">{femm}:{fess}</p>
        </div>

        {!ratingSent ? (
          <div className="w-full bg-navy-light border border-white/10 rounded-card p-4 mb-6">
            <p className="text-sm text-white font-medium mb-3">Como foi seu treino hoje?</p>
            <div className="flex justify-center gap-1 mb-3">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" onClick={() => setRating(n)}>
                  <Star
                    size={28}
                    className={n <= rating ? 'text-gold fill-gold' : 'text-white/20'}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <>
                <textarea
                  placeholder="Deixe um comentário (opcional)"
                  rows={2}
                  value={ratingComment}
                  onChange={(e) => setRatingComment(e.target.value)}
                  className="w-full bg-navy border border-white/10 rounded-control px-3 py-2 text-white text-sm placeholder:text-white/30 mb-3"
                />
                <button
                  onClick={sendRating}
                  disabled={sendingRating}
                  className="w-full font-display font-semibold text-sm bg-gold text-navy py-2.5 rounded-control"
                >
                  {sendingRating ? 'Enviando...' : 'Enviar avaliação'}
                </button>
              </>
            )}
          </div>
        ) : (
          <p className="text-sm text-gold-light mb-6">Valeu pelo feedback! 🙌</p>
        )}

        <Link
          href="/dashboard"
          className="w-full font-display font-semibold text-sm bg-gold text-navy py-3.5 rounded-control text-center"
        >
          Voltar ao início
        </Link>
      </main>
    )
  }

  const totalSets = sets.flat().length
  const doneSets = sets.flat().filter((s) => s.done).length
  const emm = String(Math.floor(elapsed / 60)).padStart(2, '0')
  const ess = String(elapsed % 60).padStart(2, '0')
  const rmm = String(Math.floor(restSeconds / 60)).padStart(2, '0')
  const rss = String(restSeconds % 60).padStart(2, '0')

  return (
    <main className="min-h-screen bg-navy pb-40 px-5 pt-8 relative">
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

      {resting && (
        <div className="fixed bottom-6 left-5 right-5 bg-purple-dark border border-purple-light/40 rounded-card p-4 text-center z-10">
          <p className="text-[10px] uppercase tracking-wider text-white/50 mb-1">Descanso</p>
          <p className="font-display font-extrabold text-2xl text-gold-light">{rmm}:{rss}</p>
        </div>
      )}
    </main>
  )
}
