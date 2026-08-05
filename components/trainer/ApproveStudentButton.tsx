'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MessageCircle } from 'lucide-react'

export function ApproveStudentButton({ studentId, name, whatsapp }: { studentId: string; name: string; whatsapp: string | null }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [approved, setApproved] = useState(false)

  async function handleApprove() {
    setLoading(true)
    const res = await fetch(`/api/students/${studentId}/approve`, { method: 'POST' })
    setLoading(false)
    if (res.ok) {
      setApproved(true)
      router.refresh()
    }
  }

  if (approved) {
    const message = encodeURIComponent(
      `Oi ${name.split(' ')[0]}! Seu cadastro no JM Team foi aprovado 🎉 Já pode entrar no app com o e-mail e senha que você cadastrou.`
    )
    return whatsapp ? (
      <a
        href={`https://wa.me/${whatsapp}?text=${message}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 text-xs font-display font-semibold px-3 py-1.5 rounded-control bg-[#25D366]/15 text-[#25D366]"
      >
        <MessageCircle size={13} /> Avisar no WhatsApp
      </a>
    ) : (
      <span className="text-xs text-gold-light">Aprovado ✓</span>
    )
  }

  return (
    <button
      onClick={handleApprove}
      disabled={loading}
      className="text-xs font-display font-semibold px-3 py-1.5 rounded-control bg-gold text-navy"
    >
      {loading ? 'Aprovando...' : 'Aprovar'}
    </button>
  )
}
