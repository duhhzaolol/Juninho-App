'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/Button'
import { authInputClass } from '@/components/shared/AuthShell'

export function SetPasswordForm({ token, email }: { token: string; email: string }) {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password.length < 6) return setError('A senha precisa ter pelo menos 6 caracteres.')
    if (password !== confirm) return setError('As duas senhas não estão iguais.')
    setLoading(true)
    const res = await fetch('/api/auth/set-password', { method: 'POST', body: JSON.stringify({ token, password }) })
    if (!res.ok) {
      setLoading(false)
      return setError('Este link expirou. Peça um novo em "Esqueci minha senha".')
    }
    await signIn('credentials', { email, password, redirect: false })
    window.location.href = '/app'
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <input type="password" placeholder="Nova senha (mínimo 6)" autoComplete="new-password" className={authInputClass} value={password} onChange={(e) => setPassword(e.target.value)} />
      <input type="password" placeholder="Repita a senha" autoComplete="new-password" className={authInputClass} value={confirm} onChange={(e) => setConfirm(e.target.value)} />
      {error && <p className="text-red-400 text-xs">{error}</p>}
      <Button type="submit" loading={loading} fullWidth>
        Salvar senha e entrar
      </Button>
      <p className="text-center text-white/30 text-xs">
        Dica: depois de entrar, use &quot;Adicionar à tela de início&quot; no navegador para o app ficar com ícone no celular.
      </p>
    </form>
  )
}
