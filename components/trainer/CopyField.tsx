'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

export function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      window.prompt('Copie:', value)
    }
  }

  return (
    <div>
      <p className="text-[11px] uppercase tracking-wider text-white/40 mb-1">{label}</p>
      <div className="flex items-center gap-2">
        <code className="flex-1 min-w-0 text-xs text-white/80 bg-navy border border-white/10 rounded-control px-3 py-2.5 break-all select-all">
          {value}
        </code>
        <button type="button" onClick={copy} className="shrink-0 flex items-center gap-1 border border-white/15 text-white/80 rounded-control px-3 py-2.5 text-xs">
          {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copiado' : 'Copiar'}
        </button>
      </div>
    </div>
  )
}
