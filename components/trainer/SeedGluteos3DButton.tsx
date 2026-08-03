'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function SeedGluteos3DButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ exercisesCreated: number; workoutsCreated: string[] } | null>(null)

  async function handleClick() {
    setLoading(true)
    const res = await fetch('/api/workouts/seed-gluteos3d', { method: 'POST' })
    setLoading(false)
    if (res.ok) {
      const data = await res.json()
      setResult(data)
      router.refresh()
    }
  }

  if (result) {
    return (
      <div className="bg-gold/10 border border-gold/30 rounded-control p-3 text-xs text-white/70">
        {result.exercisesCreated} exercício(s) novo(s) e {result.workoutsCreated.length} treino(s) criado(s) ✓
        {result.workoutsCreated.length === 0 && ' (já existiam, nada duplicado)'}
      </div>
    )
  }

  return (
    <button onClick={handleClick} disabled={loading} className="text-white/50 text-sm">
      {loading ? 'Criando...' : '+ Programa Glúteos 3D completo'}
    </button>
  )
}
