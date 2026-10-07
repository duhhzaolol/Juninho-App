'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

// Tira ou devolve o acesso de uma compradora (pede confirmação antes de tirar)
export function PurchaseStatusButton({ productId, purchaseId, status }: { productId: string; purchaseId: string; status: string }) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)
  const next = status === 'active' ? 'refunded' : 'active'

  async function apply() {
    setLoading(true)
    await fetch(`/api/products/${productId}/purchases/${purchaseId}`, { method: 'PATCH', body: JSON.stringify({ status: next }) })
    setLoading(false)
    setConfirming(false)
    router.refresh()
  }

  if (status === 'active' && !confirming) {
    return <button type="button" onClick={() => setConfirming(true)} className="text-xs text-white/40">Tirar acesso</button>
  }
  if (status === 'active' && confirming) {
    return (
      <span className="flex items-center gap-2 text-xs">
        <button type="button" onClick={apply} disabled={loading} className="text-red-400">{loading ? '...' : 'Confirmar'}</button>
        <button type="button" onClick={() => setConfirming(false)} className="text-white/40">Cancelar</button>
      </span>
    )
  }
  return (
    <button type="button" onClick={apply} disabled={loading} className="text-xs text-gold-light">
      {loading ? '...' : 'Devolver acesso'}
    </button>
  )
}
