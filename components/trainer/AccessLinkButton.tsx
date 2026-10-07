'use client'

import { useState } from 'react'
import { AccessLinkCard } from '@/components/trainer/AccessLinkCard'

// Botão da ficha do aluno: gera um link novo para ele criar/trocar a senha
export function AccessLinkButton({ studentId, label = 'Gerar link de acesso' }: { studentId: string; label?: string }) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ link: string; whatsapp: string; emailSent: boolean } | null>(null)
  const [error, setError] = useState('')

  async function generate() {
    setLoading(true)
    setError('')
    const res = await fetch(`/api/students/${studentId}/access-link`, { method: 'POST', body: JSON.stringify({ sendByEmail: false }) })
    setLoading(false)
    if (res.ok) setResult(await res.json())
    else setError('Não deu para gerar o link. Tente de novo.')
  }

  if (result) return <AccessLinkCard link={result.link} whatsapp={result.whatsapp} emailSent={result.emailSent} />

  return (
    <div>
      <button type="button" onClick={generate} disabled={loading} className="text-gold-light text-sm">
        {loading ? 'Gerando...' : `${label} →`}
      </button>
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  )
}
