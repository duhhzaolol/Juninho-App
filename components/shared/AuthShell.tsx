import Image from 'next/image'
import { ReactNode } from 'react'
import { MainDomainHop } from '@/components/shared/MainDomainHop'

// Moldura das telas de acesso (cadastro, código, criar senha, esqueci a senha)
export function AuthShell({
  title,
  subtitle,
  children,
  hop = true,
}: {
  title: string
  subtitle?: ReactNode
  children: ReactNode
  hop?: boolean // leva do app.juninhomoro.com.br para o juninhomoro.com.br (desligado em telas de quem já está logado)
}) {
  return (
    <main className="min-h-screen bg-navy flex flex-col justify-center px-8 py-10">
      {hop && <MainDomainHop />}
      <div className="flex flex-col items-center text-center mb-8">
        <Image src="/logo-jm.png" alt="JM" width={90} height={75} priority />
        <p className="font-display font-extrabold text-white text-sm tracking-[0.35em] -mt-1">TEAM</p>
        <p className="font-display font-bold text-xl text-white mt-6 mb-1">{title}</p>
        {subtitle && <div className="text-white/50 text-sm max-w-xs">{subtitle}</div>}
      </div>
      {children}
    </main>
  )
}

export const authInputClass =
  'w-full bg-navy-light border border-white/10 rounded-control px-4 py-3 text-white placeholder:text-white/30'
