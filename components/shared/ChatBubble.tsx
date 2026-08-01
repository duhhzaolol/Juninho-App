import { cn } from '@/lib/utils'

interface ChatBubbleProps {
  text: string
  timestamp: Date
  isOwn: boolean
}

export function ChatBubble({ text, timestamp, isOwn }: ChatBubbleProps) {
  return (
    <div className={cn('flex', isOwn ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[75%] rounded-control px-4 py-2.5 text-sm',
          isOwn ? 'bg-gold text-navy rounded-br-sm' : 'bg-navy-light text-white rounded-bl-sm'
        )}
      >
        <p>{text}</p>
        <p className={cn('text-[10px] mt-1', isOwn ? 'text-navy/50' : 'text-white/30')}>
          {timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  )
}
