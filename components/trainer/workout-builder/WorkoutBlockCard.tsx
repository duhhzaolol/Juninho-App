'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { BlockType } from './BlockTypeMenu'

export interface WorkoutBlockData {
  id: string
  type: BlockType
  exerciseId: string | null
  extraExerciseIds: string[]
  exerciseNames: string[]
  sets: number
  reps: string
  loadKg: number | null
  restSeconds: number
  notes?: string
}

const typeLabels: Record<BlockType, string> = {
  EXERCISE: 'Exercício',
  SUPERSET: 'Superserie',
  DROPSET: 'Dropset',
  REST_PAUSE: 'Rest pause',
  BISET: 'Biset',
  CIRCUIT: 'Circuito',
  REST: 'Descanso',
}

interface WorkoutBlockProps {
  block: WorkoutBlockData
  index: number
  onEdit: () => void
  onDuplicate: () => void
  onDelete: () => void
}

export function WorkoutBlockCard({ block, index, onEdit, onDuplicate, onDelete }: WorkoutBlockProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-navy-light border border-white/10 rounded-control p-3 flex items-center gap-3"
    >
      <button {...attributes} {...listeners} className="text-white/30 cursor-grab px-1" aria-label="Arrastar bloco">
        ⠿
      </button>

      <div className="flex-1">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-[10px] uppercase tracking-wide text-gold-light">{typeLabels[block.type]}</span>
          <span className="text-xs text-white/30">#{index + 1}</span>
        </div>
        <p className="text-sm text-white">{block.exerciseNames.join(' + ') || 'Selecionar exercício'}</p>
        {block.type !== 'REST' && (
          <p className="text-xs text-white/40">
            {block.sets}x {block.reps} {block.loadKg ? `· ${block.loadKg}kg` : ''} · descanso {block.restSeconds}s
          </p>
        )}
      </div>

      <div className="flex gap-1">
        <button onClick={onEdit} className="text-white/40 text-xs px-2 py-1">Editar</button>
        <button onClick={onDuplicate} className="text-white/40 text-xs px-2 py-1">Duplicar</button>
        <button onClick={onDelete} className="text-red-400 text-xs px-2 py-1">Excluir</button>
      </div>
    </div>
  )
}
