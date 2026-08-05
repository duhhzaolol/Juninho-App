'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Bell, MessageCircle, AlertTriangle, X } from 'lucide-react'

interface NotificationData {
  trainerName: string
  messages: { id: string; content: string; createdAt: string }[]
  overdueDays: number | null
}

export function NotificationBell({ initialHasUnread }: { initialHasUnread: boolean }) {
  const [open, setOpen] = useState(false)
  const [data, setData] = useState<NotificationData | null>(null)
  const [hasUnread, setHasUnread] = useState(initialHasUnread)

  function handleOpen() {
    setOpen(true)
    fetch('/api/notifications')
      .then((r) => r.json())
      .then((d) => {
        setData(d)
        setHasUnread(d.messages.length > 0 || d.overdueDays !== null)
      })
  }

  const hasAny = data ? data.messages.length > 0 || data.overdueDays !== null : hasUnread

  return (
    <>
      <button onClick={handleOpen} className="relative p-2">
        <Bell size={20} className="text-white/60" />
        {hasAny && <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />}
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center" onClick={() => setOpen(false)}>
          <div
            className="bg-navy-light border border-white/10 rounded-b-card w-full max-w-md mt-0 p-4 max-h-[70vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <p className="font-display font-semibold text-white">Notificações</p>
              <button onClick={() => setOpen(false)} className="text-white/40 p-1">
                <X size={18} />
              </button>
            </div>

            {!data && <p className="text-white/30 text-sm text-center py-8">Carregando...</p>}

            {data && (
              <div className="flex flex-col gap-2">
                {data.overdueDays !== null && (
                  <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-control px-4 py-3">
                    <AlertTriangle size={18} className="text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-white">Mensalidade vencida</p>
                      <p className="text-xs text-white/50">
                        Venceu há {data.overdueDays} dia{data.overdueDays === 1 ? '' : 's'} — fale com seu professor.
                      </p>
                    </div>
                  </div>
                )}

                {data.messages.map((msg) => (
                  <Link
                    key={msg.id}
                    href="/mensagens"
                    onClick={() => setOpen(false)}
                    className="flex items-start gap-3 bg-navy border border-white/10 rounded-control px-4 py-3"
                  >
                    <MessageCircle size={18} className="text-purple-light shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white">{data.trainerName}</p>
                      <p className="text-xs text-white/50 truncate">{msg.content}</p>
                    </div>
                  </Link>
                ))}

                {data.messages.length === 0 && data.overdueDays === null && (
                  <p className="text-white/30 text-sm text-center py-8">Nenhuma notificação por enquanto.</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
