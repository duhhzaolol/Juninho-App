'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { Sidebar } from '@/components/trainer/Sidebar'
import { Button } from '@/components/ui/Button'
import { WorkoutBlockCard, WorkoutBlockData } from './WorkoutBlockCard'
import { BlockTypeMenu, BlockType } from './BlockTypeMenu'
import { BlockEditor } from './BlockEditor'

let nextId = 1

interface WorkoutBuilderProps {
  workoutId?: string
  initialName?: string
  initialBlocks?: WorkoutBlockData[]
}

export function WorkoutBuilder({ workoutId, initialName = '', initialBlocks = [] }: WorkoutBuilderProps) {
  const router = useRouter()
  const [name, setName] = useState(initialName)
  const [blocks, setBlocks] = useState<WorkoutBlockData[]>(initialBlocks)
  const [menuOpen, setMenuOpen] = useState(false)
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const sensors = useSensors(useSensor(PointerSensor))
  const isEditing = Boolean(workoutId)

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    setBlocks((prev) => {
      const oldIndex = prev.findIndex((b) => b.id === active.id)
      const newIndex = prev.findIndex((b) => b.id === over.id)
      return arrayMove(prev, oldIndex, newIndex)
    })
  }

  function addBlock(type: BlockType) {
    const newId = `block-${nextId++}`
    setBlocks((prev) => [
      ...prev,
      {
        id: newId,
        type,
        exerciseId: null,
        exerciseNames: [],
        sets: 3,
        reps: '10-12',
        loadKg: null,
        restSeconds: 60,
      },
    ])
    setMenuOpen(false)
    setEditingBlockId(newId) // já abre pra escolher o exercício
  }

  function duplicateBlock(id: string) {
    setBlocks((prev) => {
      const block = prev.find((b) => b.id === id)
      if (!block) return prev
      return [...prev, { ...block, id: `block-${nextId++}` }]
    })
  }

  function deleteBlock(id: string) {
    setBlocks((prev) => prev.filter((b) => b.id !== id))
  }

  function saveBlockEdit(updated: WorkoutBlockData) {
    setBlocks((prev) => prev.map((b) => (b.id === updated.id ? updated : b)))
    setEditingBlockId(null)
  }

  async function saveWorkout(asTemplate: boolean) {
    setSaving(true)
    const payload = { name, isTemplate: asTemplate, blocks }

    const res = await fetch(isEditing ? `/api/workouts/${workoutId}` : '/api/workouts', {
      method: isEditing ? 'PUT' : 'POST',
      body: JSON.stringify(payload),
    })

    setSaving(false)
    if (res.ok) router.push('/trainer/treinos')
  }

  const editingBlock = blocks.find((b) => b.id === editingBlockId)

  return (
    <div className="min-h-screen bg-navy flex flex-col md:flex-row">
      <Sidebar />

      <main className="flex-1 px-6 py-8 pb-28">
        <div className="flex items-center justify-between mb-6">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome do treino"
            className="bg-transparent font-display font-bold text-xl text-white placeholder:text-white/30 outline-none"
          />
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => saveWorkout(true)} disabled={saving}>
              Salvar como modelo
            </Button>
            <Button variant="primary" size="sm" onClick={() => saveWorkout(false)} disabled={saving}>
              {isEditing ? 'Salvar alterações' : 'Salvar treino'}
            </Button>
          </div>
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col gap-2 mb-4">
              {blocks.map((block, i) => (
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

        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => setMenuOpen(true)}>
            + Bloco
          </Button>
        </div>

        {menuOpen && <BlockTypeMenu onSelect={addBlock} onClose={() => setMenuOpen(false)} />}
        {editingBlock && (
          <BlockEditor block={editingBlock} onSave={saveBlockEdit} onClose={() => setEditingBlockId(null)} />
        )}
      </main>
    </div>
  )
}
