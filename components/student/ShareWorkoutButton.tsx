'use client'

import { useState } from 'react'
import { Share2, Download } from 'lucide-react'

export function ShareWorkoutButton() {
  const [loading, setLoading] = useState(false)

  async function captureCard(): Promise<Blob | null> {
    const html2canvas = (await import('html2canvas')).default
    const node = document.getElementById('share-card')
    if (!node) return null

    const canvas = await html2canvas(node, {
      backgroundColor: null,
      scale: 3, // resolução boa pra Stories
      useCORS: true,
    })

    return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob), 'image/png'))
  }

  async function handleShare() {
    setLoading(true)
    try {
      const blob = await captureCard()
      if (!blob) return

      const file = new File([blob], 'treino-jm-team.png', { type: 'image/png' })

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Treino concluído — JM Team',
        })
      } else {
        // Sem suporte a compartilhar arquivo (ex: computador) — baixa a imagem
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'treino-jm-team.png'
        a.click()
        URL.revokeObjectURL(url)
      }
    } catch {
      // usuário cancelou o compartilhamento — não faz nada
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleShare}
      disabled={loading}
      className="w-full flex items-center justify-center gap-2 font-display font-semibold text-sm bg-white/10 border border-white/15 text-white py-3 rounded-control mb-3"
    >
      {loading ? (
        'Gerando imagem...'
      ) : (
        <>
          <Share2 size={16} /> Compartilhar treino
        </>
      )}
    </button>
  )
}
