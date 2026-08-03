'use client'

import { useEffect, useState } from 'react'
import { WorkoutBlockData } from './WorkoutBlockCard'
import { ExercisePicker } from './ExercisePicker'

interface Exercise {
  id: string
  name: string
  muscleGroup: string
}

const inputClass =
  'w-full bg-navy border border-white/10 rounded-control px-3 py-2 text-white text-sm'

export function BlockEditor({
  block,
  onSave,
  onClose,
}: {
  block: WorkoutBlockData
  onSave: (updated: WorkoutBlockData) => void
  onClose: () => void
}) {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [form, setForm] = useState({
    exerciseId: block.exerciseId ?? '',
    sets: block.sets,
    reps: block.reps,
    loadKg: block.loadKg?.toString() ?? '',
    restSeconds: block.restSeconds,
    notes: block.notes ?? '',
  })

  useEffect(() => {
    fetch('/api/exercises')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setExercises(data)
      })
  }, [])

  function update(field: string, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleSave() {
    const exercise = exercises.find((e) => e.id === form.exerciseId)
    onSave({
      ...block,
      exerciseId: form.exerciseId || null,
      exerciseNames: exercise ? [exercise.name] : [],
      sets: Number(form.sets),
      reps: form.reps,
      loadKg: form.loadKg ? Number(form.loadKg) : null,
      restSeconds: Number(form.restSeconds),
      notes: form.notes,
    })
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-end md:items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-navy-light border border-white/10 rounded-t-card md:rounded-card w-full md:w-96 p-4 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="font-display font-semibold text-white mb-3">Editar bloco</p>

        <div className="flex flex-col gap-3">
          <div>
            <label className="text-xs text-white/40 mb-1 block">Exercício</label>
            <ExercisePicker
              exercises={exercises}
              value={form.exerciseId}
              onChange={(id) => update('exerciseId', id)}
            />
            {exercises.length === 0 && (
              <p className="text-[11px] text-white/30 mt-1">
                Nenhum exercício cadastrado ainda — crie um na Biblioteca de Exercícios primeiro.
              </p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-xs text-white/40 mb-1 block">Séries</label>
              <input type="number" className={inputClass} value={form.sets} onChange={(e) => update('sets', e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-white/40 mb-1 block">Reps</label>
              <input placeholder="10-12" className={inputClass} value={form.reps} onChange={(e) => update('reps', e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-white/40 mb-1 block">Carga (kg)</label>
              <input type="number" className={inputClass} value={form.loadKg} onChange={(e) => update('loadKg', e.target.value)} />
            </div>
          </div>

          <div>
            <label className="text-xs text-white/40 mb-1 block">Descanso (segundos)</label>
            <input type="number" className={inputClass} value={form.restSeconds} onChange={(e) => update('restSeconds', e.target.value)} />
          </div>

          <div>
            <label className="text-xs text-white/40 mb-1 block">Observações</label>
            <textarea rows={2} className={inputClass} value={form.notes} onChange={(e) => update('notes', e.target.value)} />
          </div>

          <div className="flex gap-2 mt-2">
            <button onClick={onClose} className="flex-1 text-sm font-display font-semibold py-2.5 rounded-control bg-white/10 text-white">
              Cancelar
            </button>
            <button onClick={handleSave} className="flex-1 text-sm font-display font-semibold py-2.5 rounded-control bg-gold text-navy">
              Salvar bloco
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
