'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { ChevronLeft, ChevronRight, Coffee } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { WorkoutBlockCard, WorkoutBlockData } from './workout-builder/WorkoutBlockCard'
import { BlockEditor } from './workout-builder/BlockEditor'

let nextId = 1

const orderedWeekdays = [
  { weekday: 1, label: 'Segunda-feira' },
  { weekday: 2, label: 'Terça-feira' },
  { weekday: 3, label: 'Quarta-feira' },
  { weekday: 4, label: 'Quinta-feira' },
  { weekday: 5, label: 'Sexta-feira' },
  { weekday: 6, label: 'Sábado' },
  { weekday: 0, label: 'Domingo' },
]

interface DayData {
  weekday: number
  mode: 'rest' | 'new'
  existingWorkoutId: string
  workoutName: string
  blocks: WorkoutBlockData[]
}


export function WeeklyWorkoutBuilder() {
  const router = useRouter()
  const [programName, setProgramName] = useState('')
  const [activeStep, setActiveStep] = useState(0) // índice em orderedWeekdays
  const [days, setDays] = useState<DayData[]>(
    orderedWeekdays.map((d) => ({ weekday: d.weekday, mode: 'rest', existingWorkoutId: '', workoutName: '', blocks: [] }))
  )
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const sensors = useSensors(useSensor(PointerSensor))

  const current = days[activeStep]
  const currentInfo = orderedWeekdays[activeStep]
  const isLastDay = activeStep === orderedWeekdays.length - 1

  function updateCurrentDay(patch: Partial<DayData>) {
    setDays((prev) => prev.map((d, i) => (i === activeStep ? { ...d, ...patch } : d)))
  }

  function addBlock() {
    const newId = `block-${nextId++}`
    const newBlock: WorkoutBlockData = {
      id: newId,
      type: 'EXERCISE',
      exerciseId: null,
      extraExerciseIds: [],
      exerciseNames: [],
      sets: 3,
      reps: '10-12',
      loadKg: null,
      restSeconds: 60,
    }
    updateCurrentDay({ blocks: [...current.blocks, newBlock] })
    setEditingBlockId(newId)
  }

  function saveBlockEdit(updated: WorkoutBlockData) {
    updateCurrentDay({ blocks: current.blocks.map((b) => (b.id === updated.id ? updated : b)) })
    setEditingBlockId(null)
  }

  function duplicateBlock(id: string) {
    const block = current.blocks.find((b) => b.id === id)
    if (!block) return
    updateCurrentDay({ blocks: [...current.blocks, { ...block, id: `block-${nextId++}` }] })
  }

  function deleteBlock(id: string) {
    updateCurrentDay({ blocks: current.blocks.filter((b) => b.id !== id) })
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    updateCurrentDay({
      blocks: (() => {
        const oldIndex = current.blocks.findIndex((b) => b.id === active.id)
        const newIndex = current.blocks.findIndex((b) => b.id === over.id)
        return arrayMove(current.blocks, oldIndex, newIndex)
      })(),
    })
  }

  const editingBlock = current.blocks.find((b) => b.id === editingBlockId)

  async function handleSave() {
    setSaving(true)
    const res = await fetch('/api/programs/create-full', {
      method: 'POST',
      body: JSON.stringify({
        name: programName,
        days: days.map((d) => ({
          weekday: d.weekday,
          rest: d.mode === 'rest',
          existingWorkoutId: null,
          workoutName: d.mode === 'new' ? (d.workoutName || `${programName} - ${orderedWeekdays.find((w) => w.weekday === d.weekday)?.label}`) : null,
          blocks: d.mode === 'new' ? d.blocks : [],
        })),
      }),
    })
    setSaving(false)
    if (res.ok) router.push('/trainer/treinos/programas')
  }

  return (
    <main className="flex-1 px-6 py-8 pb-32 max-w-lg">
      <Link href="/trainer/treinos" className="text-white/50 flex items-center gap-1 text-sm mb-4">
        <ChevronLeft size={18} /> Treinos
      </Link>

      <input
        value={programName}
        onChange={(e) => setProgramName(e.target.value)}
        placeholder="Nome do programa (ex: Glúteos 3D)"
        className="w-full bg-transparent font-display font-bold text-xl text-white placeholder:text-white/30 outline-none mb-4 border-b border-white/10 pb-2"
      />

      <div className="flex gap-1.5 mb-6">
        {orderedWeekdays.map((d, i) => (
          <button
            key={d.weekday}
            onClick={() => setActiveStep(i)}
            className={`flex-1 h-8 rounded-control text-[10px] font-display font-bold flex items-center justify-center ${
              i === activeStep
                ? 'bg-gold text-navy'
                : days[i].mode !== 'rest'
                ? 'bg-gold/15 text-gold-light'
                : 'bg-white/5 text-white/30'
            }`}
          >
            {d.label.slice(0, 3)}
          </button>
        ))}
      </div>

      <p className="font-display font-semibold text-white mb-3">{currentInfo.label}</p>

      <div className="grid grid-cols-2 gap-2 mb-5">
        <button
          onClick={() => updateCurrentDay({ mode: 'rest' })}
          className={`flex flex-col items-center gap-1 py-3 rounded-control border text-xs ${
            current.mode === 'rest' ? 'bg-gold/15 border-gold text-gold-light' : 'bg-navy-light border-white/10 text-white/60'
          }`}
        >
          <Coffee size={16} />
          Descanso
        </button>
        <button
          onClick={() => updateCurrentDay({ mode: 'new' })}
          className={`py-3 rounded-control border text-xs ${
            current.mode === 'new' ? 'bg-gold/15 border-gold text-gold-light' : 'bg-navy-light border-white/10 text-white/60'
          }`}
        >
          Montar treino
        </button>
      </div>

      {current.mode === 'new' && (
        <div className="mb-4">
          <input
            value={current.workoutName}
            onChange={(e) => updateCurrentDay({ workoutName: e.target.value })}
            placeholder={`Nome do treino (ex: ${programName || 'Programa'} - ${currentInfo.label})`}
            className="w-full bg-navy-light border border-white/10 rounded-control px-3 py-2.5 text-white placeholder:text-white/30 text-sm mb-3"
          />

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={current.blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
              <div className="flex flex-col gap-2 mb-3">
                {current.blocks.map((block, i) => (
                  <WorkoutBlockCard
                    key={block.id}
                    block={block}
                    index={i}
                    onEdit={() => setEditingBlockId(block.id)}
                    onDuplicate={() => duplicateBlock(block.id)}
                    onDelete={() => deleteBlock(block.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          <Button variant="ghost" size="sm" onClick={addBlock}>+ Bloco</Button>
        </div>
      )}

      <div className="flex gap-2 mt-6">
        {activeStep > 0 && (
          <button
            onClick={() => setActiveStep((s) => s - 1)}
            className="flex items-center gap-1 text-sm text-white/50 px-4 py-3 rounded-control bg-navy-light border border-white/10"
          >
            <ChevronLeft size={16} /> Dia anterior
          </button>
        )}

        {!isLastDay ? (
          <button
            onClick={() => setActiveStep((s) => s + 1)}
            className="flex-1 flex items-center justify-center gap-1 text-sm font-display font-semibold py-3 rounded-control bg-gold text-navy"
          >
            Próximo dia <ChevronRight size={16} />
          </button>
        ) : (
          <button
            onClick={handleSave}
            disabled={saving || !programName}
            className="flex-1 text-sm font-display font-semibold py-3 rounded-control bg-gold text-navy disabled:opacity-50"
          >
            {saving ? 'Salvando...' : 'Salvar programa'}
          </button>
        )}
      </div>

      {editingBlock && (
        <BlockEditor block={editingBlock} onSave={saveBlockEdit} onClose={() => setEditingBlockId(null)} />
      )}
    </main>
  )
}
