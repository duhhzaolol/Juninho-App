'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const items = [
  { href: '/dashboard', label: 'Início' },
  { href: '/treino', label: 'Treino' },
  { href: '/progresso', label: 'Progresso' },
  { href: '/perfil', label: 'Perfil' },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-navy-light border-t border-white/10 flex justify-around py-3 px-2">
      {items.map((item) => {
        const active = pathname?.startsWith(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn('flex flex-col items-center gap-1 text-[11px]', active ? 'text-gold-light' : 'text-white/40')}
          >
            {active && <span className="w-1.5 h-1.5 rounded-full bg-gold-light" />}
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
