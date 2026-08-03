'use client'

import { useMemo, useState } from 'react'
import { Search, Check, ChevronDown } from 'lucide-react'

interface Exercise {
  id: string
  name: string
  muscleGroup: string
}

export function ExercisePicker({
  exercises,
  value,
  onChange,
}: {
  exercises: Exercise[]
  value: string
  onChange: (id: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  const selected = exercises.find((e) => e.id === value)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return exercises
    return exercises.filter(
      (e) => e.name.toLowerCase().includes(q) || e.muscleGroup.toLowerCase().includes(q)
    )
  }, [exercises, query])

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full bg-navy border border-white/10 rounded-control px-4 py-3 text-left flex items-center justify-between"
      >
        <div>
          <p className={`text-sm ${selected ? 'text-white' : 'text-white/30'}`}>
            {selected ? selected.name : 'Selecione um exercício'}
          </p>
          {selected && <p className="text-[11px] text-white/40">{selected.muscleGroup}</p>}
        </div>
        <ChevronDown size={16} className="text-white/30 shrink-0" />
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black/70 z-[60] flex items-end md:items-center justify-center"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-navy-light border border-white/10 rounded-t-card md:rounded-card w-full md:w-[420px] max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-white/10 shrink-0">
              <p className="font-display font-semibold text-white mb-3">Escolher exercício</p>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  autoFocus
                  placeholder="Buscar por nome ou grupo muscular..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full bg-navy border border-white/10 rounded-control pl-9 pr-3 py-2.5 text-white text-sm placeholder:text-white/30"
                />
              </div>
            </div>

            <div className="overflow-y-auto flex-1">
              {filtered.length === 0 && (
                <p className="text-white/30 text-sm text-center py-8">Nenhum exercício encontrado</p>
              )}
              {filtered.map((ex) => (
                <button
                  key={ex.id}
                  type="button"
                  onClick={() => {
                    onChange(ex.id)
                    setOpen(false)
                    setQuery('')
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3.5 text-left border-b border-white/5 ${
                    ex.id === value ? 'bg-gold/10' : ''
                  }`}
                >
                  <div>
                    <p className="text-sm text-white">{ex.name}</p>
                    <p className="text-[11px] text-white/40">{ex.muscleGroup}</p>
                  </div>
                  {ex.id === value && <Check size={16} className="text-gold-light shrink-0" />}
                </button>
              ))}
            </div>

            <div className="p-3 border-t border-white/10 shrink-0">
              <button onClick={() => setOpen(false)} className="w-full text-sm text-white/50 py-2">
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
