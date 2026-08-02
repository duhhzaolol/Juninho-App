'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/Button'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await signIn('credentials', { email, password, callbackUrl: '/' })
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-navy flex flex-col justify-center px-8">
      <p className="font-display font-extrabold text-3xl text-white mb-1">JM Team</p>
      <p className="text-white/50 text-sm mb-10">Entre para continuar sua evolução.</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-navy-light border border-white/10 rounded-control px-4 py-3 text-white placeholder:text-white/30"
        />
        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="bg-navy-light border border-white/10 rounded-control px-4 py-3 text-white placeholder:text-white/30"
        />
        <Button type="submit" loading={loading} fullWidth>
          Entrar
        </Button>
      </form>
    </main>
  )
}
