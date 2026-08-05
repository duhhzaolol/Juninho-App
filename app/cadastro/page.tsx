'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

const inputClass =
  'bg-navy-light border border-white/10 rounded-control px-4 py-3 text-white placeholder:text-white/30'

export default function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

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
    setLoading(false)

    if (res.ok) {
      setDone(true)
    } else if (res.status === 409) {
      setError('Já existe uma conta com esse e-mail.')
    } else {
      setError('Não deu pra cadastrar. Confere os campos e tenta de novo.')
    }
  }

  if (done) {
    return (
      <main className="min-h-screen bg-navy flex flex-col justify-center items-center px-8 text-center">
        <Image src="/logo-jm.png" alt="JM" width={90} height={75} className="mb-4" />
        <p className="font-display font-bold text-xl text-white mb-2">Cadastro enviado! 🎉</p>
        <p className="text-sm text-white/50 mb-8 max-w-xs">
          Seu cadastro está em análise. Assim que for aprovado, você recebe uma mensagem no WhatsApp e já pode entrar.
        </p>
        <Link href="/login" className="text-gold-light text-sm">Voltar pro login</Link>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-navy flex flex-col justify-center px-8">
      <div className="flex flex-col items-center text-center mb-8">
        <Image src="/logo-jm.png" alt="JM" width={100} height={83} priority />
        <p className="font-display font-extrabold text-white text-sm tracking-[0.35em] -mt-1">TEAM</p>
        <p className="font-display font-bold text-xl text-white mt-6 mb-1">Seja membro do time.</p>
        <p className="text-white/50 text-sm">Preencha seus dados pra começar.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input required placeholder="Nome completo" className={inputClass} value={name} onChange={(e) => setName(e.target.value)} />
        <input required type="email" placeholder="E-mail" className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} />
        <input required type="password" placeholder="Crie uma senha" className={inputClass} value={password} onChange={(e) => setPassword(e.target.value)} />
        <input
          required
          placeholder="WhatsApp (com DDD, ex: 19999999999)"
          className={inputClass}
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value.replace(/\D/g, ''))}
        />

        {error && <p className="text-red-400 text-xs">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="font-display font-semibold rounded-control py-3.5 bg-gradient-to-br from-gold-light to-gold text-navy shadow-[0_0_24px_-4px_rgba(245,179,0,0.55)]"
        >
          {loading ? 'Enviando...' : 'Criar cadastro'}
        </button>
      </form>

      <Link href="/login" className="text-center text-white/40 text-sm mt-6">
        Já tem conta? <span className="text-gold-light">Entrar</span>
      </Link>
    </main>
  )
}
