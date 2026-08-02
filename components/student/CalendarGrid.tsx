'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DayEntry {
  status: string
  workoutName: string | null
}

interface CalendarGridProps {
  cells: { key: string; day: number; inMonth: boolean }[]
  entries: Record<string, DayEntry>
  todayKey: string
  weekDays: string[]
}

export function CalendarGrid({ cells, entries, todayKey, weekDays }: CalendarGridProps) {
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const selectedEntry = selectedKey ? entries[selectedKey] : null

  function formatSelectedDate(key: string) {
    const [y, m, d] = key.split('-').map(Number)
    return new Date(y, m - 1, d).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })
  }

  return (
    <div>
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((d) => (
          <p key={d} className="text-center text-[9px] text-white/30 font-semibold">{d}</p>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map(({ key, day, inMonth }, i) => {
          const entry = entries[key]
          const status = entry?.status
          const isToday = key === todayKey

          return (
            <div key={i} className="flex items-center justify-center aspect-square">
              <button
                type="button"
                onClick={() => status && setSelectedKey(key)}
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-xs font-display font-semibold',
                  !inMonth && 'text-white/15',
                  inMonth && !status && 'text-white/40',
                  status === 'TRAINED' && 'bg-gold text-navy',
                  status === 'MISSED' && 'bg-red-500/20 text-red-300',
                  status === 'CARDIO' && 'bg-purple-600/50 text-white',
                  status === 'REST' && 'bg-white/10 text-white/40',
                  isToday && 'ring-2 ring-purple-light ring-offset-2 ring-offset-navy-light',
                  selectedKey === key && 'ring-2 ring-white'
                )}
              >
                {status === 'TRAINED' ? <Check size={14} /> : day}
              </button>
            </div>
          )
        })}
      </div>

      {selectedEntry && (
        <div className="mt-4 bg-white/5 border border-white/10 rounded-control p-3">
          <p className="text-[11px] text-white/40 capitalize mb-0.5">{formatSelectedDate(selectedKey!)}</p>
          <p className="text-sm text-white">
            {selectedEntry.workoutName ? `Treino: ${selectedEntry.workoutName}` : 'Sem treino registrado nesse dia'}
          </p>
        </div>
      )}
    </div>
  )
}
