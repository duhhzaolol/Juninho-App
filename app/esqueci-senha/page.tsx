'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AuthShell, authInputClass } from '@/components/shared/AuthShell'
import { Button } from '@/components/ui/Button'
import { WhatsAppButton } from '@/components/student/WhatsAppButton'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [state, setState] = useState<'form' | 'sent' | 'no-email'>('form')
  const [whatsapp, setWhatsapp] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/auth/forgot', { method: 'POST', body: JSON.stringify({ email }) })
    const data = await res.json().catch(() => ({}))
    setLoading(false)
    if (data.reason === 'no-email') {
      setWhatsapp(data.whatsapp ?? null)
      setState('no-email')
    } else setState('sent')
  }

  if (state === 'sent') {
    return (
      <AuthShell title="Confira seu e-mail" subtitle={<>Se existir uma conta com <span className="text-white">{email}</span>, mandamos um link para criar uma senha nova. Ele vale por 1 dia.</>}>
        <Link href="/app/login" className="text-center text-gold-light text-sm">Voltar para o login</Link>
      </AuthShell>
    )
  }

  if (state === 'no-email') {
    return (
      <AuthShell title="Fale com o Juninho" subtitle="Ele te manda um link para criar uma senha nova.">
        <WhatsAppButton number={whatsapp} />
        <Link href="/app/login" className="text-center text-white/40 text-sm mt-2">Voltar para o login</Link>
      </AuthShell>
    )
  }

  return (
    <AuthShell title="Esqueceu a senha?" subtitle="Digite o e-mail da sua conta. Vamos mandar um link para criar uma senha nova.">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input required type="email" placeholder="E-mail" autoComplete="email" className={authInputClass} value={email} onChange={(e) => setEmail(e.target.value)} />
        <Button type="submit" loading={loading} fullWidth>Enviar link</Button>
      </form>
      <Link href="/app/login" className="text-center text-white/40 text-sm mt-6">Voltar para o login</Link>
    </AuthShell>
  )
}
