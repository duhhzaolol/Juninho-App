'use client'

import { useState } from 'react'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { AuthShell, authInputClass } from '@/components/shared/AuthShell'
import { CodeForm } from '@/components/shared/CodeForm'
import { Button } from '@/components/ui/Button'

export default function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState<'form' | 'code'>('form')

  async function enter() {
    await signIn('credentials', { email, password, redirect: false })
    window.location.href = '/app'
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password.length < 6) {
      setError('A senha precisa ter pelo menos 6 caracteres.')
      return
    }
    setLoading(true)
    const res = await fetch('/api/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, whatsapp }),
    })
    if (res.ok) {
      const data = await res.json()
      if (data.needsCode) {
        setStep('code')
        setLoading(false)
      } else {
        await enter()
      }
      return
    }
    setLoading(false)
    if (res.status === 409) setError('Já existe uma conta com esse e-mail. Entre pelo login ou use "Esqueci minha senha".')
    else setError('Não deu pra cadastrar. Confere os campos e tenta de novo.')
  }

  if (step === 'code') {
    return (
      <AuthShell
        title="Confirme seu e-mail"
        subtitle={
          <>
            Mandamos um código de 6 dígitos para <span className="text-white">{email}</span>.
          </>
        }
      >
        <CodeForm email={email} onVerified={enter} />
        <button type="button" onClick={() => setStep('form')} className="text-white/30 text-xs mt-6">
          Errei o e-mail
        </button>
      </AuthShell>
    )
  }

  return (
    <AuthShell title="Crie sua conta" subtitle="Escolha uma planilha do Juninho e comece a treinar.">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input required placeholder="Nome completo" autoComplete="name" className={authInputClass} value={name} onChange={(e) => setName(e.target.value)} />
        <input required type="email" placeholder="E-mail" autoComplete="email" className={authInputClass} value={email} onChange={(e) => setEmail(e.target.value)} />
        <input required type="password" placeholder="Crie uma senha (mínimo 6)" autoComplete="new-password" className={authInputClass} value={password} onChange={(e) => setPassword(e.target.value)} />
        <input
          placeholder="WhatsApp com DDD (opcional)"
          inputMode="tel"
          className={authInputClass}
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value.replace(/\D/g, ''))}
        />

        {error && <p className="text-red-400 text-xs">{error}</p>}

        <Button type="submit" loading={loading} fullWidth>
          Criar conta
        </Button>
      </form>

      <p className="text-center text-white/30 text-xs mt-4">
        Use o mesmo e-mail da compra, se já comprou uma planilha.
      </p>

      <Link href="/app/login" className="text-center text-white/40 text-sm mt-6">
        Já tem conta? <span className="text-gold-light">Entrar</span>
      </Link>
    </AuthShell>
  )
}
