'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Avatar } from '@/components/ui/Avatar'

export function AvatarUpload({ currentSrc }: { currentSrc?: string | null }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(currentSrc ?? null)
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = async () => {
        const size = 256 // pequeno de propósito: é assim que aparece no app
        const canvas = document.createElement('canvas')
        canvas.width = size
        canvas.height = size
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // recorta em quadrado (crop central) antes de redimensionar
        const min = Math.min(img.width, img.height)
        const sx = (img.width - min) / 2
        const sy = (img.height - min) / 2
        ctx.drawImage(img, sx, sy, min, min, 0, 0, size, size)

        const dataUrl = canvas.toDataURL('image/jpeg', 0.7)
        setPreview(dataUrl)
        setSaving(true)
        await fetch('/api/profile/avatar', {
          method: 'POST',
          body: JSON.stringify({ avatarUrl: dataUrl }),
        })
        setSaving(false)
        router.refresh()
      }
      img.src = reader.result as string
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button onClick={() => inputRef.current?.click()} className="relative" type="button">
        <Avatar src={preview} size="lg" ring />
        <span className="absolute -bottom-1 -right-1 bg-gold text-navy text-[10px] font-semibold px-2 py-0.5 rounded-full">
          {saving ? '...' : 'Editar'}
        </span>
      </button>
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
    </div>
  )
}
