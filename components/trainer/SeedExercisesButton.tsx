'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function SeedExercisesButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState<number | null>(null)

  async function handleClick() {
    setLoading(true)
    const res = await fetch('/api/exercises/seed-defaults', { method: 'POST' })
    setLoading(false)
    if (res.ok) {
      const data = await res.json()
      setDone(data.created)
      router.refresh()
    }
  }

  if (done !== null) {
    return <span className="text-xs text-white/40">{done} exercício(s) adicionado(s) ✓</span>
  }

  return (
    <button onClick={handleClick} disabled={loading} className="text-white/50 text-sm">
      {loading ? 'Adicionando...' : '+ Exercícios padrão'}
    </button>
  )
}
