'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { SignOutButton } from '@/components/shared/SignOutButton'

const items = [
  { href: '/trainer/dashboard', label: 'Dashboard' },
  { href: '/trainer/alunos', label: 'Alunos' },
  { href: '/trainer/treinos', label: 'Treinos' },
  { href: '/trainer/mensagens', label: 'Mensagens' },
  { href: '/trainer/relatorios', label: 'Relatórios' },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-full md:w-56 md:min-h-screen bg-navy-light border-r border-white/10 px-4 py-6 flex md:flex-col gap-1 overflow-x-auto md:overflow-visible">
      <p className="font-display font-bold text-white px-2 mb-4 hidden md:block">Área do Professor</p>
      {items.map((item) => {
        const active = pathname?.startsWith(item.href)
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
