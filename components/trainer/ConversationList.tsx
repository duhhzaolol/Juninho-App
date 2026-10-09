'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'

export type Conversation = {
  userId: string
  studentId: string
  name: string
  avatarUrl: string | null
  pending: boolean
  last: { text: string; at: string; own: boolean } | null
  unread: number
}

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

export function initials(name: string) {
  const parts = name.trim().split(/\s+/)
  return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase()
}

export function PersonAvatar({ name, src, size = 48 }: { name: string; src: string | null; size?: number }) {
  return (
    <span
      className="rounded-full overflow-hidden shrink-0 flex items-center justify-center bg-gradient-to-br from-purple to-purple-dark text-white font-display font-semibold"
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="w-full h-full object-cover" />
      ) : (
        initials(name)
      )}
    </span>
  )
}

// Hora da última mensagem como no WhatsApp: hoje = 14:32, ontem, dia da semana, ou a data
function timeLabel(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const startOfDay = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime()
  const days = Math.round((startOfDay(now) - startOfDay(d)) / 86400000)
  if (days <= 0) return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  if (days === 1) return 'Ontem'
  if (days < 7) return d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })
}

// Lista de conversas: quem mandou mensagem por último fica em cima, quem nunca conversou fica embaixo
export function ConversationList({ conversations, selectedUserId }: { conversations: Conversation[]; selectedUserId?: string }) {
  const [q, setQ] = useState('')
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const list = useMemo(() => {
    const term = norm(q.trim())
    return term ? conversations.filter((c) => norm(c.name).includes(term)) : conversations
  }, [q, conversations])
  const firstWithout = list.findIndex((c) => !c.last)

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="px-4 pt-5 pb-3 shrink-0">
        <p className="font-display font-bold text-xl text-white mb-3">Mensagens</p>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar aluno"
            className="w-full bg-navy-light border border-white/10 rounded-full pl-9 pr-4 py-2.5 text-white placeholder:text-white/30 text-sm"
          />
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto pb-6">
        {list.map((c, i) => (
          <div key={c.userId}>
            {i === firstWithout && (
              <p className="px-4 pt-4 pb-1 text-[11px] uppercase tracking-wider text-white/30">Ainda sem conversa</p>
            )}
            <Link
              href={`/app/trainer/mensagens?to=${c.userId}`}
              className={cn(
                'flex items-center gap-3 px-4 py-3 border-b border-white/5',
                selectedUserId === c.userId ? 'bg-gold/10' : ''
              )}
            >
              <PersonAvatar name={c.name} src={c.avatarUrl} />
              <span className="min-w-0 flex-1">
                <span className="flex items-baseline justify-between gap-2">
                  <span className={cn('truncate text-[15px]', c.unread > 0 ? 'text-white font-semibold' : 'text-white')}>
                    {c.name}
                  </span>
                  {c.last && mounted && (
                    <span className={cn('text-[11px] shrink-0', c.unread > 0 ? 'text-gold-light' : 'text-white/35')}>
                      {timeLabel(c.last.at)}
                    </span>
                  )}
                </span>
                <span className="flex items-center justify-between gap-2 mt-0.5">
                  <span className={cn('truncate text-[13px]', c.unread > 0 ? 'text-white/80' : 'text-white/45')}>
                    {c.last ? `${c.last.own ? 'Você: ' : ''}${c.last.text}` : c.pending ? 'Aguardando aprovação' : 'Toque para mandar a primeira mensagem'}
                  </span>
                  {c.unread > 0 && (
                    <span className="shrink-0 min-w-[20px] h-5 px-1.5 rounded-full bg-gold text-navy text-[11px] font-bold flex items-center justify-center">
                      {c.unread > 99 ? '99+' : c.unread}
                    </span>
                  )}
                </span>
              </span>
            </Link>
          </div>
        ))}
        {list.length === 0 && (
          <p className="px-4 py-6 text-sm text-white/40">{q ? `Ninguém encontrado com “${q}”.` : 'Nenhum aluno para conversar ainda.'}</p>
        )}
      </div>
    </div>
  )
}
