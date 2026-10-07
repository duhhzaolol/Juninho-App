'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Dumbbell, LayoutGrid, BarChart3, MessageCircle, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { isActiveRoute } from '@/lib/app-path'

const items = [
  { href: '/app/dashboard', label: 'Início', icon: Home },
  { href: '/app/treino', label: 'Treino', icon: Dumbbell },
  { href: '/app/planilhas', label: 'Planilhas', icon: LayoutGrid },
  { href: '/app/progresso', label: 'Progresso', icon: BarChart3 },
  { href: '/app/mensagens', label: 'Chat', icon: MessageCircle },
  { href: '/app/perfil', label: 'Perfil', icon: User },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-navy-light border-t border-white/10 flex justify-around py-3 px-1 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]">
      {items.map((item) => {
        const active = isActiveRoute(pathname, item.href)
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn('flex flex-col items-center gap-1 text-[10px] min-w-0 flex-1', active ? 'text-gold-light' : 'text-white/40')}
          >
            <Icon size={20} strokeWidth={active ? 2.5 : 2} />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
