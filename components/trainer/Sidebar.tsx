'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { isActiveRoute } from '@/lib/app-path'
import { SignOutButton } from '@/components/shared/SignOutButton'

const items = [
  { href: '/app/trainer/dashboard', label: 'Dashboard' },
  { href: '/app/trainer/alunos', label: 'Alunos' },
  { href: '/app/trainer/ranking', label: 'Ranking' },
  { href: '/app/trainer/treinos', label: 'Treinos' },
  { href: '/app/trainer/planilhas', label: 'Planilhas' },
  { href: '/app/trainer/exercicios', label: 'Exercícios' },
  { href: '/app/trainer/biblioteca', label: 'Biblioteca' },
  { href: '/app/trainer/mensagens', label: 'Mensagens' },
  { href: '/app/trainer/relatorios', label: 'Relatórios' },
  { href: '/app/trainer/planos', label: 'Planos' },
  { href: '/app/trainer/novidades', label: 'Novidades' },
  { href: '/app/trainer/ajuda', label: 'Ajuda' },
  { href: '/app/trainer/configuracoes', label: 'Configurações' },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-full md:w-56 md:min-h-screen bg-navy-light border-r border-white/10 px-4 py-6 flex md:flex-col gap-1 overflow-x-auto md:overflow-visible">
      <p className="font-display font-bold text-white px-2 mb-4 hidden md:block">Área do Professor</p>
      {items.map((item) => {
        const active = isActiveRoute(pathname, item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'px-3 py-2 rounded-control text-sm whitespace-nowrap',
              active ? 'bg-gold/10 text-gold-light' : 'text-white/60'
            )}
          >
            {item.label}
          </Link>
        )
      })}
      <div className="md:mt-auto md:pt-4">
        <SignOutButton className="px-3 py-2 rounded-control text-sm text-red-400 whitespace-nowrap" />
      </div>
    </aside>
  )
}
