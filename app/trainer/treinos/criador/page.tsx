'use client'

import { useState } from 'react'
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
import { WorkoutBlockCard, WorkoutBlockData } from '@/components/trainer/workout-builder/WorkoutBlockCard'
import { BlockTypeMenu, BlockType } from '@/components/trainer/workout-builder/BlockTypeMenu'

let nextId = 1

export default function WorkoutBuilderPage() {
  const [name, setName] = useState('')
  const [blocks, setBlocks] = useState<WorkoutBlockData[]>([])
  const [menuOpen, setMenuOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const sensors = useSensors(useSensor(PointerSensor))

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
    setBlocks((prev) => [
      ...prev,
      {
        id: `block-${nextId++}`,
        type,
        exerciseNames: [],
        sets: 3,
        reps: '10-12',
        restSeconds: 60,
      },
    ])
    setMenuOpen(false)
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

  async function saveWorkout(asTemplate: boolean) {
    setSaving(true)
    await fetch('/api/workouts', {
      method: 'POST',
      body: JSON.stringify({ name, isTemplate: asTemplate, blocks }),
    })
    setSaving(false)
  }

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
              Salvar treino
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
                  onEdit={() => {}}
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
      </main>
    </div>
  )
}
