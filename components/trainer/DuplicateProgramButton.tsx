'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Copy } from 'lucide-react'

export function DuplicateProgramButton({ programId }: { programId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    setLoading(true)
    const res = await fetch(`/api/programs/${programId}/duplicate`, { method: 'POST' })
    setLoading(false)
    if (res.ok) {
      const data = await res.json()
      router.push(`/trainer/treinos/programas/${data.id}/editar`)
    }
  }

  return (
    <button onClick={handleClick} disabled={loading} className="flex items-center gap-1.5 text-white/50 text-sm">
      <Copy size={14} />
      {loading ? 'Duplicando...' : 'Duplicar'}
    </button>
  )
}
