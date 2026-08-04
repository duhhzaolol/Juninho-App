'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Stepper } from '@/components/shared/Stepper'
import { RestScreen } from '@/components/student/RestScreen'
import { CheckCircle2, Star, Play } from 'lucide-react'

interface ExerciseData {
  id: string
  name: string
  muscleGroup: string
  videoUrl: string | null
  gifUrl: string | null
}

interface ExerciseBlock {
  exercises: ExerciseData[] // 1 exercício = simples; 2+ = superserie/biset/circuito
  sets: number
  targetReps: string
  defaultLoad: number
  restSeconds: number
  notes?: string | null
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

const REMINDER_MS = 10 * 60 * 1000

export function WorkoutSession({ workoutId, workoutName, blocks }: WorkoutSessionProps) {
  // sets[blockIndex][exerciseIndexNoBloco][rodada]
  const [sets, setSets] = useState<SetState[][][]>(() =>
    blocks.map((b) =>
      b.exercises.map(() =>
        Array.from({ length: b.sets }, () => ({
          load: b.defaultLoad,
          reps: parseInt(b.targetReps) || 10,
          done: false,
        }))
      )
    )
  )
  const [activeIndex, setActiveIndex] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [finishing, setFinishing] = useState(false)
  const [showReminder, setShowReminder] = useState(false)
  const [resting, setResting] = useState(false)
  const [restSeconds, setRestSeconds] = useState(0)
  const [restTotal, setRestTotal] = useState(0)
  const [restStartTime, setRestStartTime] = useState<number | null>(null)
  const [restNextLabel, setRestNextLabel] = useState('')
  const [completed, setCompleted] = useState(false)
  const [completedAt, setCompletedAt] = useState<Date | null>(null)
  const [finalElapsed, setFinalElapsed] = useState(0)
  const [rating, setRating] = useState(0)
  const [ratingComment, setRatingComment] = useState('')
  const [ratingSent, setRatingSent] = useState(false)
  const [sendingRating, setSendingRating] = useState(false)
  const lastActivity = useRef(Date.now())

  useEffect(() => {
    const key = `workout-start-${workoutId}`
    let start = localStorage.getItem(key)
    if (!start) {
      start = String(Date.now())
      localStorage.setItem(key, start)
    }
    const startTime = Number(start)

    function tick() {
      setElapsed(Math.floor((Date.now() - startTime) / 1000))
    }
    tick()
    const interval = setInterval(tick, 1000)

    function onVisible() {
      if (document.visibilityState === 'visible') tick()
    }
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [workoutId])

  useEffect(() => {
    if (!resting || restStartTime === null) return

    function tick() {
      const remaining = restTotal - Math.floor((Date.now() - restStartTime!) / 1000)
      if (remaining <= 0) {
        setRestSeconds(0)
        setResting(false)
      } else {
        setRestSeconds(remaining)
      }
    }
    tick()
    const interval = setInterval(tick, 1000)

    function onVisible() {
      if (document.visibilityState === 'visible') tick()
    }
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [resting, restStartTime, restTotal])

  useEffect(() => {
    const check = setInterval(() => {
      if (Date.now() - lastActivity.current > REMINDER_MS) setShowReminder(true)
    }, 30_000)
    return () => clearInterval(check)
  }, [])

  function isRoundDone(bi: number, si: number) {
    return sets[bi].every((exArr) => exArr[si].done)
  }

  function isBlockDone(bi: number) {
    return sets[bi].every((exArr) => exArr.every((s) => s.done))
  }

  // Acha a próxima célula liberada (rodada, exercício) dentro do bloco
  function nextUp(bi: number): { si: number; exIdx: number } | null {
    for (let si = 0; si < blocks[bi].sets; si++) {
      for (let exIdx = 0; exIdx < blocks[bi].exercises.length; exIdx++) {
        if (!sets[bi][exIdx][si].done) return { si, exIdx }
      }
    }
    return null
  }

  function nextStepLabel(bi: number, si: number, isLastExerciseOfRound: boolean) {
    if (!isLastExerciseOfRound) return null // sem descanso entre exercícios da mesma rodada
    if (si + 1 < blocks[bi].sets) return `Rodada ${si + 2} · ${blocks[bi].exercises[0].name}`
    for (let nb = bi + 1; nb < blocks.length; nb++) {
      if (blocks[nb].exercises.length > 0) return blocks[nb].exercises[0].name
    }
    return 'Último exercício — hora de terminar o treino!'
  }

  function updateSet(bi: number, exIdx: number, si: number, field: 'load' | 'reps', value: number) {
    setSets((prev) => {
      const copy = prev.map((block) => block.map((arr) => [...arr]))
      copy[bi][exIdx][si] = { ...copy[bi][exIdx][si], [field]: value }
      return copy
    })
  }

  function completeSet(bi: number, exIdx: number, si: number) {
    const set = sets[bi][exIdx][si]
    const updated = sets.map((block) => block.map((arr) => [...arr]))
    updated[bi][exIdx][si] = { ...updated[bi][exIdx][si], done: true }
    setSets(updated)

    lastActivity.current = Date.now()
    setShowReminder(false)

    fetch('/api/progress', {
      method: 'POST',
      body: JSON.stringify({ exerciseId: blocks[bi].exercises[exIdx].id, loadKg: set.load, reps: set.reps }),
    }).catch(() => {})

    const isLastExerciseOfRound = exIdx === blocks[bi].exercises.length - 1
    const label = nextStepLabel(bi, si, isLastExerciseOfRound)

    if (isLastExerciseOfRound) {
      // rodada completa — descansa de verdade
      setRestTotal(blocks[bi].restSeconds)
      setRestNextLabel(label ?? '')
      setRestSeconds(blocks[bi].restSeconds)
      setRestStartTime(Date.now())
      setResting(true)
    }
    // se não for o último exercício da rodada, segue direto pro próximo (sem descanso) — nada a fazer aqui,
    // a UI já libera a próxima célula sozinha porque "sets" mudou.

    const allDoneInBlock = updated[bi].every((exArr) => exArr.every((s) => s.done))
    if (allDoneInBlock && bi === activeIndex && bi + 1 < blocks.length) {
      setActiveIndex(bi + 1)
    }
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
                  <Star size={28} className={n <= rating ? 'text-gold fill-gold' : 'text-white/20'} />
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

  const totalSets = sets.flat(2).length
  const doneSets = sets.flat(2).filter((s) => s.done).length
  const emm = String(Math.floor(elapsed / 60)).padStart(2, '0')
  const ess = String(elapsed % 60).padStart(2, '0')

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

      <div className="flex flex-col gap-2 mb-8">
        {blocks.map((block, bi) => {
          const blockDone = isBlockDone(bi)
          const isLocked = bi > activeIndex && !blockDone
          const isMulti = block.exercises.length > 1
          const title = block.exercises.map((e) => e.name).join(' + ')

          if (blockDone) {
            return (
              <button
                key={bi}
                onClick={() => setActiveIndex(bi)}
                className="flex items-center justify-between bg-gold/10 border border-gold/20 rounded-control px-4 py-3 text-left"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-gold-light shrink-0" />
                  <span className="text-sm text-white">{bi + 1}. {title}</span>
                </div>
                <span className="text-[11px] text-white/40 shrink-0">revisar</span>
              </button>
            )
          }

          if (isLocked) {
            return (
              <div key={bi} className="flex items-center bg-white/5 border border-white/5 rounded-control px-4 py-3 opacity-40">
                <span className="text-sm text-white/50">{bi + 1}. {title}</span>
              </div>
            )
          }

          // bloco ativo — aberto e interativo
          const up = nextUp(bi)

          return (
            <div key={bi} className="bg-navy-light border border-gold/20 rounded-card p-4">
              <p className="font-display font-semibold text-sm text-white mb-1">{bi + 1}. {title}</p>
              <p className="text-[11px] text-white/40 mb-3">{block.exercises[0].muscleGroup}</p>

              {block.exercises[0].gifUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={block.exercises[0].gifUrl} alt={title} className="w-full rounded-control mb-3 bg-navy" />
              ) : block.exercises[0].videoUrl ? (
                <a
                  href={block.exercises[0].videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 h-28 rounded-control bg-navy border border-white/10 mb-3 text-gold-light text-sm"
                >
                  <Play size={16} /> Ver vídeo do exercício
                </a>
              ) : (
                <div className="h-24 rounded-control bg-navy border border-white/10 mb-3 flex items-center justify-center text-white/20 text-xs">
                  Vídeo / GIF do exercício
                </div>
              )}

              {block.notes && (
                <div className="bg-purple-dark/50 border border-purple-light/20 rounded-control px-3 py-2 mb-3">
                  <p className="text-[10px] uppercase tracking-wide text-purple-200 mb-0.5">Observação do professor</p>
                  <p className="text-xs text-white/80">{block.notes}</p>
                </div>
              )}

              <div className="flex flex-col gap-3">
                {Array.from({ length: block.sets }).map((_, si) => (
                  <div key={si}>
                    {isMulti && (
                      <p className="text-[10px] uppercase tracking-wide text-white/30 mb-1.5">Rodada {si + 1}</p>
                    )}
                    <div className="flex flex-col gap-2">
                      {block.exercises.map((ex, exIdx) => {
                        const set = sets[bi][exIdx][si]
                        const isNext = up && up.si === si && up.exIdx === exIdx

                        return (
                          <div
                            key={exIdx}
                            className={`flex items-center justify-between rounded-control px-3 py-2 border ${
                              set.done ? 'bg-gold/10 border-gold/30' : isNext ? 'bg-navy border-white/10' : 'bg-navy/40 border-white/5 opacity-40'
                            }`}
                          >
                            <span className="font-display font-bold text-xs text-white/60 w-20 shrink-0 truncate">
                              {isMulti ? ex.name : `Série ${si + 1}`}
                            </span>
                            <Stepper
                              value={set.load}
                              onChange={(v) => updateSet(bi, exIdx, si, 'load', v)}
                              step={2.5}
                              suffix="kg"
                              disabled={!isNext}
                            />
                            <Stepper
                              value={set.reps}
                              onChange={(v) => updateSet(bi, exIdx, si, 'reps', v)}
                              step={1}
                              suffix="reps"
                              disabled={!isNext}
                            />
                            {set.done ? (
                              <span className="text-[11px] font-semibold text-gold-light w-16 text-right shrink-0">Feita ✓</span>
                            ) : (
                              <button
                                onClick={() => completeSet(bi, exIdx, si)}
                                disabled={!isNext}
                                className="text-[11px] font-display font-semibold px-3 py-1.5 rounded-control bg-gold text-navy w-16 shrink-0 disabled:opacity-30"
                              >
                                Concluir
                              </button>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <button
        onClick={finishWorkout}
        disabled={finishing}
        className="w-full font-display font-semibold text-sm bg-gold text-navy py-3.5 rounded-control"
      >
        {finishing ? 'Finalizando...' : 'Terminar treino'}
      </button>

      {resting && (
        <RestScreen
          seconds={restSeconds}
          total={restTotal}
          nextLabel={restNextLabel}
          onSkip={() => setResting(false)}
        />
      )}
    </main>
  )
}
