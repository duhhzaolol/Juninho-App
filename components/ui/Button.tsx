import { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  icon?: ReactNode
  iconPosition?: 'left' | 'right'
  loading?: boolean
  fullWidth?: boolean
}

const variantStyles: Record<string, string> = {
  primary: 'bg-gradient-to-br from-gold-light to-gold text-navy shadow-[0_0_24px_-4px_rgba(245,179,0,0.55)] hover:shadow-[0_0_32px_-2px_rgba(245,179,0,0.7)]',
  secondary: 'bg-gradient-to-br from-purple-light to-purple text-white shadow-[0_0_20px_-4px_rgba(124,58,237,0.5)]',
  ghost: 'bg-transparent border border-white/10 text-white',
  danger: 'bg-red-500 text-white',
}

const sizeStyles: Record<string, string> = {
  sm: 'px-4 py-2 text-xs',
  md: 'px-7 py-3.5 text-sm',
  lg: 'px-9 py-4 text-base',
}

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading,
  fullWidth,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'font-display font-semibold rounded-control inline-flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-50',
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && 'w-full',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {icon && iconPosition === 'left' && icon}
      {loading ? 'Carregando...' : children}
      {icon && iconPosition === 'right' && icon}
    </button>
  )
}
