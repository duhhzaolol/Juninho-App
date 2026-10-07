'use client'

import { useState } from 'react'
import { MessageCircle, Copy, Check } from 'lucide-react'

// Mostra o link de acesso com os botões "Enviar no WhatsApp" e "Copiar"
export function AccessLinkCard({ link, whatsapp, emailSent }: { link: string | null; whatsapp: string; emailSent?: boolean }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    if (!link) return
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      window.prompt('Copie o link:', link)
    }
  }

  return (
    <div className="bg-gold/10 border border-gold/30 rounded-control p-4 flex flex-col gap-3">
      {link && (
        <div>
          <p className="text-[11px] uppercase tracking-wider text-white/40 mb-1">Link para criar a senha (vale 7 dias)</p>
          <p className="text-xs text-white/80 break-all select-all">{link}</p>
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        <a
          href={whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-[#25D366]/15 border border-[#25D366]/30 text-[#25D366] rounded-control px-4 py-2.5 text-sm font-display font-semibold"
        >
          <MessageCircle size={16} /> Enviar no WhatsApp
        </a>
        {link && (
          <button type="button" onClick={copy} className="flex items-center gap-2 border border-white/15 text-white/80 rounded-control px-4 py-2.5 text-sm">
            {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? 'Copiado' : 'Copiar link'}
          </button>
        )}
      </div>
      {emailSent && <p className="text-xs text-green-400">O link também foi enviado por e-mail.</p>}
    </div>
  )
}
