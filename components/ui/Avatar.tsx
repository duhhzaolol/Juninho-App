import { User } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AvatarProps {
  src?: string | null
  size?: 'sm' | 'md' | 'lg'
  ring?: boolean
  className?: string
}

const sizeMap = { sm: 32, md: 44, lg: 80 }

export function Avatar({ src, size = 'md', ring, className }: AvatarProps) {
  const px = sizeMap[size]
  return (
    <div
      className={cn(
        'rounded-full overflow-hidden shrink-0 flex items-center justify-center bg-navy-light',
        ring && 'border-2 border-gold/40',
        className
      )}
      style={{ width: px, height: px }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full bg-gradient-to-b from-navy-light to-navy flex items-center justify-center">
          <User size={px * 0.55} className="text-white/25" strokeWidth={1.5} />
        </div>
      )}
    </div>
  )
}
