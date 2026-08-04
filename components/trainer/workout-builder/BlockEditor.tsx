'use client'

import { useEffect, useState } from 'react'
import { WorkoutBlockData } from './WorkoutBlockCard'
import { ExercisePicker } from './ExercisePicker'
import { Plus, X } from 'lucide-react'

interface Exercise {
  id: string
  name: string
  muscleGroup: string
}

const blockTypes: { value: WorkoutBlockData['type']; label: string; hint: string; multi: boolean }[] = [
  { value: 'EXERCISE', label: 'Exercício simples', hint: '1 exercício', multi: false },
  { value: 'SUPERSET', label: 'Superserie', hint: '2+ exercícios sem descanso', multi: true },
  { value: 'BISET', label: 'Biset', hint: '2 exercícios, mesmo grupo', multi: true },
  { value: 'DROPSET', label: 'Dropset', hint: 'reduz carga na mesma série', multi: false },
  { value: 'REST_PAUSE', label: 'Rest pause', hint: 'pausas curtas na mesma série', multi: false },
  { value: 'CIRCUIT', label: 'Circuito', hint: '3+ exercícios em sequência', multi: true },
]

const inputClass = 'w-full bg-navy border border-white/10 rounded-control px-3 py-2 text-white text-sm'

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
  const [exerciseIds, setExerciseIds] = useState<string[]>(
    [block.exerciseId, ...(block.extraExerciseIds ?? [])].filter(Boolean) as string[]
  )
  const [type, setType] = useState<WorkoutBlockData['type']>(block.type)
  const [form, setForm] = useState({
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

  const currentType = blockTypes.find((t) => t.value === type)!

  function setPrimaryExercise(id: string) {
    setExerciseIds((prev) => (prev.length === 0 ? [id] : [id, ...prev.slice(1)]))
  }

  function setExtraExercise(index: number, id: string) {
    setExerciseIds((prev) => {
      const copy = [...prev]
      copy[index] = id
      return copy
    })
  }

  function addExtraSlot() {
    setExerciseIds((prev) => [...prev, ''])
  }

  function removeExtraSlot(index: number) {
    setExerciseIds((prev) => prev.filter((_, i) => i !== index))
  }

  function update(field: string, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleSave() {
    const validIds = exerciseIds.filter(Boolean)
    const [primaryId, ...extraIds] = validIds
    const exerciseNames = validIds.map((id) => exercises.find((e) => e.id === id)?.name).filter(Boolean) as string[]

    onSave({
      ...block,
      type,
      exerciseId: primaryId || null,
      extraExerciseIds: extraIds,
      exerciseNames,
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
        className="bg-navy-light border border-white/10 rounded-t-card md:rounded-card w-full md:w-[420px] p-4 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="font-display font-semibold text-white mb-3">Montar bloco</p>

        <div className="flex flex-col gap-3">
          <div>
            <label className="text-xs text-white/40 mb-1 block">
              {currentType.multi ? 'Exercício 1' : 'Exercício'}
            </label>
            <ExercisePicker exercises={exercises} value={exerciseIds[0] ?? ''} onChange={setPrimaryExercise} />
            {exercises.length === 0 && (
              <p className="text-[11px] text-white/30 mt-1">
                Nenhum exercício cadastrado ainda — crie um na Biblioteca de Exercícios primeiro.
              </p>
            )}
          </div>

          {currentType.multi && (
            <>
              {exerciseIds.slice(1).map((id, i) => (
                <div key={i} className="flex items-end gap-2">
                  <div className="flex-1">
                    <label className="text-xs text-white/40 mb-1 block">Exercício {i + 2}</label>
                    <ExercisePicker exercises={exercises} value={id} onChange={(newId) => setExtraExercise(i + 1, newId)} />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeExtraSlot(i + 1)}
                    className="text-white/40 p-2.5 shrink-0"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addExtraSlot}
                className="flex items-center gap-1.5 text-gold-light text-xs font-display font-semibold self-start"
              >
                <Plus size={14} /> Adicionar exercício
              </button>
            </>
          )}

          <div className="border-t border-white/10 pt-3">
            <label className="text-xs text-white/40 mb-2 block">Tipo de bloco</label>
            <div className="grid grid-cols-2 gap-2">
              {blockTypes.map((bt) => (
                <button
                  key={bt.value}
                  type="button"
                  onClick={() => setType(bt.value)}
                  className={`text-left px-3 py-2 rounded-control border text-xs ${
                    type === bt.value
                      ? 'bg-gold/15 border-gold text-gold-light'
                      : 'bg-navy border-white/10 text-white/60'
                  }`}
                >
                  <p className="font-display font-semibold">{bt.label}</p>
                  <p className="text-[10px] opacity-70">{bt.hint}</p>
                </button>
              ))}
            </div>
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
