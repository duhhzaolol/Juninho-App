import Link from 'next/link'
import { ReactNode } from 'react'
import { ChevronRight } from 'lucide-react'

interface ActivityRowProps {
  icon: ReactNode
  iconBg: string
  title: string
  subtitle: string
  href?: string
  comingSoon?: boolean
}

export function ActivityRow({ icon, iconBg, title, subtitle, href, comingSoon }: ActivityRowProps) {
  const content = (
    <>
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white">{title}</p>
        <p className="text-xs text-white/40">{subtitle}</p>
      </div>
      {comingSoon ? (
        <span className="text-[9px] uppercase tracking-wide text-white/30 shrink-0">Em breve</span>
      ) : (
        <ChevronRight size={16} className="text-white/30 shrink-0" />
      )}
    </>
  )

  const className = 'flex items-center gap-3 bg-navy-light border border-white/10 rounded-control px-4 py-3 mb-2'

  if (!href) return <div className={className}>{content}</div>

  return (
    <Link href={href} className={className}>
      {content}
    </Link>
  )
}
