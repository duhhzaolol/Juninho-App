'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import Image from 'next/image'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { WhatsAppButton } from '@/components/student/WhatsAppButton'
import { APP_VERSION } from '@/lib/version'

export function LoginForm({ trainerWhatsapp }: { trainerWhatsapp: string | null }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await signIn('credentials', { email, password, callbackUrl: '/' })
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-navy flex flex-col justify-center px-8">
      <div className="flex flex-col items-center text-center mb-10">
        <Image src="/logo-jm.png" alt="JM" width={110} height={92} priority />
        <p className="font-display font-extrabold text-white text-sm tracking-[0.35em] -mt-1">TEAM</p>

        <p className="font-display font-bold text-xl text-white mt-6 mb-1">Bem-vindo ao time.</p>
        <p className="text-white/50 text-sm">Entre para continuar sua evolução.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-navy-light border border-white/10 rounded-control px-4 py-3 text-white placeholder:text-white/30"
        />

        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-navy-light border border-white/10 rounded-control px-4 py-3 pr-12 text-white placeholder:text-white/30"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40"
            aria-label={showPassword ? 'Esconder senha' : 'Mostrar senha'}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <Button type="submit" loading={loading} fullWidth>
          Entrar
        </Button>
      </form>

      {trainerWhatsapp && (
        <>
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-white/30 text-xs">Ou</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <WhatsAppButton number={trainerWhatsapp} />
        </>
      )}

      <div className="mt-10 flex flex-col items-center gap-2">
        <p className="text-[10px] text-white/25">Criado por</p>
        <Image src="/instaby-logo.png" alt="Instaby" width={130} height={43} />
        <p className="text-[9px] text-white/20">{APP_VERSION}</p>
      </div>
    </main>
  )
}
