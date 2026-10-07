'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { AccessLinkCard } from '@/components/trainer/AccessLinkCard'

const inputClass =
  'w-full bg-navy border border-white/10 rounded-control px-3 py-2.5 text-white placeholder:text-white/30 text-sm'

export function GrantForm({ productId }: { productId: string }) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<{ accessLink: string | null; whatsapp: string; emailSent: boolean; alreadyHad: boolean } | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch(`/api/products/${productId}/grant`, { method: 'POST', body: JSON.stringify({ email, name, phone }) })
    setLoading(false)
    if (res.ok) {
      setResult(await res.json())
      router.refresh()
    } else {
      const data = await res.json().catch(() => ({}))
      setError(data.error === 'invalid email' ? 'Confira o e-mail.' : data.error || 'Não deu para liberar. Tente de novo.')
    }
  }

  if (result) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-green-400">
          {result.alreadyHad ? 'Essa pessoa já tinha acesso.' : 'Acesso liberado.'}{' '}
          {result.accessLink ? 'Mande o link para ela criar a senha:' : 'Ela já tem senha e vê a planilha ao entrar no app.'}
        </p>
        <AccessLinkCard link={result.accessLink} whatsapp={result.whatsapp} emailSent={result.emailSent} />
        <button type="button" onClick={() => { setResult(null); setEmail(''); setName(''); setPhone('') }} className="text-white/40 text-sm self-start">
          Liberar para outra pessoa
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <input required type="email" placeholder="E-mail da compradora" className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} />
      <input placeholder="Nome (opcional)" className={inputClass} value={name} onChange={(e) => setName(e.target.value)} />
      <input placeholder="WhatsApp (opcional)" inputMode="tel" className={inputClass} value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} />
      {error && <p className="text-red-400 text-xs md:col-span-3">{error}</p>}
      <div className="md:col-span-3">
        <Button type="submit" loading={loading} size="sm">Liberar acesso</Button>
      </div>
    </form>
  )
}
