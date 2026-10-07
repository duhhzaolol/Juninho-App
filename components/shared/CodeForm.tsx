'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { authInputClass } from '@/components/shared/AuthShell'

// Campo do código de 6 dígitos + "reenviar código"
export function CodeForm({ email, onVerified }: { email?: string; onVerified: () => void | Promise<void> }) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  async function verify(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const res = await fetch('/api/signup/verify', { method: 'POST', body: JSON.stringify({ email, code }) })
    if (res.ok) {
      await onVerified()
      return
    }
    const data = await res.json().catch(() => ({}))
    setLoading(false)
    setError(
      data.error === 'expired'
        ? 'O código expirou. Toque em "Reenviar código".'
        : data.error === 'blocked'
          ? 'Muitas tentativas. Toque em "Reenviar código" para receber um novo.'
          : 'Código incorreto. Confira e tente de novo.'
    )
  }

  async function resend() {
    setError('')
    setInfo('')
    const res = await fetch('/api/signup/resend', { method: 'POST', body: JSON.stringify({ email }) })
    const data = await res.json().catch(() => ({}))
    if (data.verified) return onVerified()
    if (res.status === 429) setInfo('Espere um minuto antes de pedir outro código.')
    else setInfo('Código novo enviado. Confira também a caixa de spam.')
  }

  return (
    <form onSubmit={verify} className="flex flex-col gap-4">
      <input
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={6}
        placeholder="000000"
        className={`${authInputClass} text-center font-display font-bold text-2xl tracking-[0.5em]`}
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
      />
      {error && <p className="text-red-400 text-xs">{error}</p>}
      {info && <p className="text-gold-light text-xs">{info}</p>}
      <Button type="submit" loading={loading} fullWidth disabled={code.length !== 6}>
        Confirmar
      </Button>
      <button type="button" onClick={resend} className="text-white/40 text-sm">
        Não recebeu? <span className="text-gold-light">Reenviar código</span>
      </button>
    </form>
  )
}
