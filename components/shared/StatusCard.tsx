import { ReactNode } from 'react'

interface StatusCardProps {
  variant: 'info' | 'warning'
  icon: ReactNode
  title: string
  subtitle: string
  className?: string
}

const variantStyles = {
  info: 'bg-gradient-to-br from-purple-900 via-purple-950 to-[#151933] border-white/10',
  warning: 'bg-gradient-to-br from-red-950 via-[#2a1220] to-[#151933] border-red-500/20',
}

const iconBg = {
  info: 'bg-purple-700/40 text-purple-200',
  warning: 'bg-red-500/20 text-red-300',
}

export function StatusCard({ variant, icon, title, subtitle, className }: StatusCardProps) {
  return (
    <div className={`rounded-card p-5 border flex items-start gap-3 ${variantStyles[variant]} ${className ?? ''}`}>
      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${iconBg[variant]}`}>
        {icon}
      </div>
      <div>
        <p className="font-display font-semibold text-sm text-white mb-0.5">{title}</p>
        <p className="text-xs text-white/50">{subtitle}</p>
      </div>
    </div>
  )
}
