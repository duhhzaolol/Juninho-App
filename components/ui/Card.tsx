import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface CardProps {
  variant?: 'workout' | 'metric' | 'glass' | 'listItem'
  eyebrow?: string
  title: string
  subtitle?: string
  onPress?: () => void
  children?: ReactNode
  className?: string
}

const variantStyles: Record<string, string> = {
  workout: 'bg-gradient-to-br from-purple-dark to-navy-light relative overflow-hidden',
  metric: 'bg-navy-light',
  glass: 'bg-white/5 backdrop-blur-glass',
  listItem: 'bg-navy-light flex items-center justify-between',
}

export function Card({ variant = 'metric', eyebrow, title, subtitle, onPress, children, className }: CardProps) {
  const Wrapper = onPress ? 'button' : 'div'

  return (
    <Wrapper
      onClick={onPress}
      className={cn(
        'rounded-card border border-white/10 p-5 text-left w-full',
        variantStyles[variant],
        onPress && 'cursor-pointer active:scale-[0.98] transition-transform',
        className
      )}
    >
      {eyebrow && (
        <p className="text-[11px] uppercase tracking-wider text-white/50 mb-2">{eyebrow}</p>
      )}
      <p className="font-display font-bold text-lg text-white mb-1">{title}</p>
      {subtitle && <p className="text-sm text-white/50 mb-4">{subtitle}</p>}
      {children}
    </Wrapper>
  )
}
