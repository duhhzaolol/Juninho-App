'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Photo {
  tag: string
  url: string | null
}

export function PhotoUpload({ photos }: { photos: Photo[] }) {
  const router = useRouter()
  const tags = ['0', '30', '60', '90']
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({})
  const [savingTag, setSavingTag] = useState<string | null>(null)
  const [localPreview, setLocalPreview] = useState<Record<string, string>>({})

  function handleFile(tag: string, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = async () => {
        // formato retrato 3:4, igual o card já mostra
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
        setLocalPreview((prev) => ({ ...prev, [tag]: dataUrl }))
        setSavingTag(tag)

        await fetch('/api/progress/photo', {
          method: 'POST',
          body: JSON.stringify({ tag, url: dataUrl }),
        })

        setSavingTag(null)
        router.refresh()
      }
      img.src = reader.result as string
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="grid grid-cols-4 gap-2">
      {tags.map((tag) => {
        const photo = photos.find((p) => p.tag === tag)
        const src = localPreview[tag] ?? photo?.url

        return (
          <div key={tag} className="flex flex-col items-center gap-1">
            <button
              type="button"
              onClick={() => inputRefs.current[tag]?.click()}
              className="w-full aspect-[3/4] rounded-control bg-navy-light border border-white/10 flex items-center justify-center overflow-hidden relative"
            >
              {src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={src} alt={`Foto dia ${tag}`} className="w-full h-full object-cover" />
              ) : (
                <span className="text-white/20 text-[10px]">+</span>
              )}
              {savingTag === tag && (
                <span className="absolute inset-0 bg-navy/60 flex items-center justify-center text-[10px] text-white">...</span>
              )}
            </button>
            <input
              ref={(el) => { inputRefs.current[tag] = el }}
              type="file"
              accept="image/*"
              onChange={(e) => handleFile(tag, e)}
              className="hidden"
            />
            <span className="text-[10px] text-white/40">{tag === '0' ? 'Antes' : `${tag} dias`}</span>
          </div>
        )
      })}
    </div>
  )
}
