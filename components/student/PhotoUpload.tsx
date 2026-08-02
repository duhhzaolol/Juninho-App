'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Photo {
  url: string
  date: string
}

export function PhotoUpload({ first, latest }: { first: Photo | null; latest: Photo | null }) {
  const router = useRouter()
  const beforeInputRef = useRef<HTMLInputElement>(null)
  const currentInputRef = useRef<HTMLInputElement>(null)
  const [savingSlot, setSavingSlot] = useState<'inicio' | 'atual' | null>(null)
  const [preview, setPreview] = useState<{ inicio?: string; atual?: string }>({})

  function handleFile(slot: 'inicio' | 'atual', e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = async () => {
        const w = 300
        const h = 400
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const scale = Math.max(w / img.width, h / img.height)
        const sw = w / scale
        const sh = h / scale
        const sx = (img.width - sw) / 2
        const sy = (img.height - sh) / 2
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h)

        const dataUrl = canvas.toDataURL('image/jpeg', 0.7)
        setPreview((prev) => ({ ...prev, [slot]: dataUrl }))
        setSavingSlot(slot)

        await fetch('/api/progress/photo', {
          method: 'POST',
          body: JSON.stringify({ tag: slot, url: dataUrl }),
        })

        setSavingSlot(null)
        router.refresh()
      }
      img.src = reader.result as string
    }
    reader.readAsDataURL(file)
  }

  const beforeSrc = preview.inicio ?? first?.url
  const currentSrc = preview.atual ?? latest?.url

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="flex flex-col items-center gap-1.5">
        <button
          type="button"
          onClick={() => !beforeSrc && beforeInputRef.current?.click()}
          className="w-full aspect-[3/4] rounded-control bg-navy-light border border-white/10 flex items-center justify-center overflow-hidden relative"
        >
          {beforeSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={beforeSrc} alt="Foto antes" className="w-full h-full object-cover" />
          ) : (
            <span className="text-white/20 text-xs">+</span>
          )}
          {savingSlot === 'inicio' && (
            <span className="absolute inset-0 bg-navy/60 flex items-center justify-center text-[10px] text-white">...</span>
          )}
        </button>
        <input ref={beforeInputRef} type="file" accept="image/*" onChange={(e) => handleFile('inicio', e)} className="hidden" />
        <span className="text-[10px] text-white/40">Antes{first ? ` · ${new Date(first.date).toLocaleDateString('pt-BR')}` : ''}</span>
      </div>

      <div className="flex flex-col items-center gap-1.5">
        <button
          type="button"
          onClick={() => currentInputRef.current?.click()}
          className="w-full aspect-[3/4] rounded-control bg-navy-light border border-white/10 flex items-center justify-center overflow-hidden relative"
        >
          {currentSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={currentSrc} alt="Foto atual" className="w-full h-full object-cover" />
          ) : (
            <span className="text-white/20 text-xs">+</span>
          )}
          {savingSlot === 'atual' && (
            <span className="absolute inset-0 bg-navy/60 flex items-center justify-center text-[10px] text-white">...</span>
          )}
        </button>
        <input ref={currentInputRef} type="file" accept="image/*" onChange={(e) => handleFile('atual', e)} className="hidden" />
        <span className="text-[10px] text-white/40">Atual{latest ? ` · ${new Date(latest.date).toLocaleDateString('pt-BR')}` : ' · toque pra atualizar'}</span>
      </div>
    </div>
  )
}
