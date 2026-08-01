'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Dumbbell, BarChart3, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const items = [
  { href: '/dashboard', label: 'Início', icon: Home },
  { href: '/treino', label: 'Treino', icon: Dumbbell },
  { href: '/progresso', label: 'Progresso', icon: BarChart3 },
  { href: '/perfil', label: 'Perfil', icon: User },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-navy-light border-t border-white/10 flex justify-around py-3 px-2">
      {items.map((item) => {
        const active = pathname?.startsWith(item.href)
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn('flex flex-col items-center gap-1 text-[11px]', active ? 'text-gold-light' : 'text-white/40')}
          >
            <Icon size={20} strokeWidth={active ? 2.5 : 2} />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
