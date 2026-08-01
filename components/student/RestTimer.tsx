'use client'

import { useEffect, useState } from 'react'

interface RestTimerProps {
  seconds: number
  onFinish: () => void
}

export function RestTimer({ seconds, onFinish }: RestTimerProps) {
  const [remaining, setRemaining] = useState(seconds)

  useEffect(() => {
    if (remaining <= 0) {
      onFinish()
      return
    }
    const id = setTimeout(() => setRemaining((r) => r - 1), 1000)
    return () => clearTimeout(id)
  }, [remaining, onFinish])

  const nextSetTime = new Date(Date.now() + remaining * 1000).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })

  const mm = String(Math.floor(remaining / 60)).padStart(2, '0')
  const ss = String(remaining % 60).padStart(2, '0')

  return (
    <div className="fixed bottom-24 left-5 right-5 bg-purple-dark border border-purple-light/40 rounded-card p-5 text-center">
      <p className="text-[11px] uppercase tracking-wider text-white/50 mb-1">Descanso</p>
      <p className="font-display font-extrabold text-3xl text-gold-light mb-1">{mm}:{ss}</p>
      <p className="text-xs text-white/40">Próxima série às {nextSetTime}</p>
    </div>
  )
}
