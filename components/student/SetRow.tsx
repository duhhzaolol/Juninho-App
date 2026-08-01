'use client'

import { cn } from '@/lib/utils'

interface SetRowProps {
  setNumber: number
  targetReps: number
  load: number
  rpe?: number
  completed: boolean
  onComplete: () => void
}

export function SetRow({ setNumber, targetReps, load, rpe, completed, onComplete }: SetRowProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between rounded-control px-4 py-3 border',
        completed ? 'bg-gold/10 border-gold/30' : 'bg-navy-light border-white/10'
      )}
    >
      <div className="flex items-center gap-3">
        <span className="font-display font-bold text-sm text-white/70 w-5">{setNumber}</span>
        <div>
          <p className="text-sm text-white">{load} kg × {targetReps} reps</p>
          {rpe && <p className="text-xs text-white/40">RPE {rpe}</p>}
        </div>
      </div>
      <button
        onClick={onComplete}
        disabled={completed}
        className={cn(
          'text-xs font-display font-semibold px-4 py-2 rounded-control',
          completed ? 'text-gold-light' : 'bg-gold text-navy'
        )}
      >
        {completed ? 'Concluída' : 'Concluir'}
      </button>
    </div>
  )
}
