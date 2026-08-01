'use client'

import { cn } from '@/lib/utils'

export type BlockType = 'EXERCISE' | 'SUPERSET' | 'DROPSET' | 'REST_PAUSE' | 'BISET' | 'CIRCUIT' | 'REST'

const options: { type: BlockType; label: string; hint: string }[] = [
  { type: 'EXERCISE', label: 'Exercício simples', hint: '1 exercício' },
  { type: 'SUPERSET', label: 'Superserie', hint: '2+ exercícios sem descanso' },
  { type: 'BISET', label: 'Biset', hint: '2 exercícios, mesmo grupo' },
  { type: 'DROPSET', label: 'Dropset', hint: 'reduz carga na mesma série' },
  { type: 'REST_PAUSE', label: 'Rest pause', hint: 'pausas curtas na mesma série' },
  { type: 'CIRCUIT', label: 'Circuito', hint: '3+ exercícios em sequência' },
  { type: 'REST', label: 'Descanso', hint: 'intervalo entre blocos' },
]

export function BlockTypeMenu({ onSelect, onClose }: { onSelect: (type: BlockType) => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-end md:items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-navy-light border border-white/10 rounded-t-card md:rounded-card w-full md:w-96 p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="font-display font-semibold text-white mb-3 px-1">Adicionar bloco</p>
        <div className="flex flex-col gap-1">
          {options.map((opt) => (
            <button
              key={opt.type}
              onClick={() => onSelect(opt.type)}
              className={cn('flex items-center justify-between px-3 py-3 rounded-control text-left hover:bg-white/5')}
            >
              <span className="text-sm text-white">{opt.label}</span>
              <span className="text-xs text-white/40">{opt.hint}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
