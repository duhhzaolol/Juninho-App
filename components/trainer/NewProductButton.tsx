'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function NewProductButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function create() {
    setLoading(true)
    const res = await fetch('/api/products', { method: 'POST', body: JSON.stringify({ name: 'Nova planilha' }) })
    if (res.ok) {
      const p = await res.json()
      router.push(`/trainer/planilhas/${p.id}`)
    } else setLoading(false)
  }

  return (
    <button type="button" onClick={create} disabled={loading} className="text-gold-light text-sm">
      {loading ? 'Criando...' : '+ Nova planilha'}
    </button>
  )
}
