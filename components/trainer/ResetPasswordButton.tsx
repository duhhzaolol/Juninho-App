'use client'

import { useState } from 'react'
import { KeyRound } from 'lucide-react'

export function ResetPasswordButton({ studentId }: { studentId: string }) {
  const [loading, setLoading] = useState(false)
  const [tempPassword, setTempPassword] = useState<string | null>(null)

  async function handleClick() {
    if (!confirm('Isso troca a senha desse aluno. Quer continuar?')) return
    setLoading(true)
    const res = await fetch(`/api/students/${studentId}/reset-password`, { method: 'POST' })
    setLoading(false)
    if (res.ok) {
      const data = await res.json()
      setTempPassword(data.tempPassword)
    }
  }

  if (tempPassword) {
    return (
      <div className="bg-gold/10 border border-gold/30 rounded-control p-4">
        <p className="text-xs text-white/60 mb-1">Nova senha gerada — repasse pro aluno:</p>
        <p className="font-display font-bold text-lg text-gold-light">{tempPassword}</p>
      </div>
    )
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="flex items-center gap-2 text-xs text-white/50 hover:text-white/80"
    >
      <KeyRound size={14} />
      {loading ? 'Gerando...' : 'Redefinir senha do aluno'}
    </button>
  )
}
