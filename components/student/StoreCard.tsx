import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatPrice } from '@/lib/store'

export interface StoreItem {
  slug: string
  name: string
  category: string | null
  tagline: string | null
  priceCents: number
  oldPriceCents: number | null
  status: string
  totalWeeks: number
  purchase: { week: number; unlocked: number } | null
}

// Card de planilha na loja (à venda, liberada ou em breve)
export function StoreCard({ item }: { item: StoreItem }) {
  const soon = item.status === 'soon' && !item.purchase
  const meta = [item.category, item.totalWeeks ? `${item.totalWeeks} semanas` : null].filter(Boolean).join(' · ')

  const content = (
    <>
      <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full bg-white/5" />
      <div className="relative">
        <div className="flex items-center justify-between mb-2 gap-2">
          <p className="text-[11px] uppercase tracking-wider text-gold-light">{meta}</p>
          {item.purchase && (
            <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide bg-green-500/15 text-green-400 shrink-0">Liberada</span>
          )}
          {soon && (
            <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide bg-white/10 text-white/60 shrink-0">Em breve</span>
          )}
        </div>
        <p className={cn('font-display font-bold text-xl mb-1', soon ? 'text-white/70' : 'text-white')}>{item.name}</p>
        {item.tagline && <p className="text-xs text-white/60 mb-4">{item.tagline}</p>}

        {item.purchase ? (
          <div>
            <div className="flex justify-between text-[11px] text-white/60 mb-1.5">
              <span>Semana {item.purchase.week} de {item.totalWeeks}</span>
              <span>{item.purchase.unlocked} liberada{item.purchase.unlocked === 1 ? '' : 's'}</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-light to-gold"
                style={{ width: `${Math.round((item.purchase.week / Math.max(item.totalWeeks, 1)) * 100)}%` }}
              />
            </div>
          </div>
        ) : soon ? (
          <p className="text-[11px] text-white/40">Avisamos no app quando lançar.</p>
        ) : (
          <div className="flex items-end justify-between gap-3">
            <div>
              {item.oldPriceCents ? <p className="text-[11px] text-white/40 line-through">{formatPrice(item.oldPriceCents)}</p> : null}
              <p className="font-display font-bold text-2xl text-gold-light leading-none">{formatPrice(item.priceCents)}</p>
            </div>
            <span className="inline-flex items-center gap-1 font-display font-semibold text-xs bg-gold text-navy px-4 py-2.5 rounded-control shadow-[0_0_20px_-4px_rgba(245,179,0,0.6)]">
              Ver planilha <ChevronRight size={14} />
            </span>
          </div>
        )}
      </div>
    </>
  )

  const className = cn(
    'block relative overflow-hidden rounded-card p-5 mb-3 border border-white/10',
    soon ? 'bg-navy-light' : 'bg-gradient-to-br from-purple-dark via-purple to-navy-light'
  )

  if (soon) return <div className={className}>{content}</div>
  return (
    <Link href={`/app/planilhas/${item.slug}`} className={className}>
      {content}
    </Link>
  )
}
