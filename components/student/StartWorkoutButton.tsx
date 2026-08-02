'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2 } from 'lucide-react'

export function StartWorkoutButton({ workoutId, alreadyTrained }: { workoutId: string; alreadyTrained: boolean }) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)

  if (!alreadyTrained) {
    return (
      <button
        onClick={() => router.push(`/treino/${workoutId}/sessao`)}
        className="w-full text-center font-display font-semibold text-sm bg-gold text-navy py-3.5 rounded-control mb-6"
      >
        Iniciar treino
      </button>
    )
  }

  if (confirming) {
    return (
      <div className="bg-navy-light border border-white/10 rounded-control p-4 mb-6">
        <p className="text-sm text-white mb-3">Tem certeza que quer treinar esses exercícios de novo?</p>
        <div className="flex gap-2">
          <button
            onClick={() => setConfirming(false)}
            className="flex-1 text-sm font-display font-semibold py-2.5 rounded-control bg-white/10 text-white"
          >
            Cancelar
          </button>
          <button
            onClick={() => router.push(`/treino/${workoutId}/sessao`)}
            className="flex-1 text-sm font-display font-semibold py-2.5 rounded-control bg-gold text-navy"
          >
            Sim, treinar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 bg-gold/10 border border-gold/30 rounded-control p-4 mb-6">
      <CheckCircle2 size={20} className="text-gold-light shrink-0" />
      <div className="flex-1">
        <p className="text-sm text-white font-medium">Você já treinou hoje</p>
        <button onClick={() => setConfirming(true)} className="text-xs text-gold-light underline">
          Treinar novamente
        </button>
      </div>
    </div>
  )
}
