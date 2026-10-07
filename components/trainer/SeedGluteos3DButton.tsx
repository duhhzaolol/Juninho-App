'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function SeedGluteos3DButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ exercisesCreated: number; workoutsCreated: string[]; programsCreated?: string[]; productCreated?: boolean } | null>(null)

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
        {result.workoutsCreated.length > 0
          ? `${result.programsCreated?.length ?? 0} semana(s), ${result.workoutsCreated.length} treino(s) e ${result.exercisesCreated} exercício(s) novo(s) cadastrados ✓`
          : 'As 6 semanas do Glúteos 3D já estavam cadastradas. Nada foi duplicado ✓'}
        {result.productCreated && ' A planilha também foi criada em Planilhas, como rascunho.'}
      </div>
    )
  }

  return (
    <button onClick={handleClick} disabled={loading} className="text-white/50 text-sm">
      {loading ? 'Cadastrando as 6 semanas...' : '+ Glúteos 3D completo (6 semanas)'}
    </button>
  )
}
