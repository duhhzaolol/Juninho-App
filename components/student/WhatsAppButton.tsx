import { MessageCircle } from 'lucide-react'

export function WhatsAppButton({ number }: { number?: string | null }) {
  if (!number) return null

  const message = encodeURIComponent('Olá! Vim pelo app JM Team.')

  return (
    <a
      href={`https://wa.me/${number}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-center gap-2 bg-[#25D366]/15 border border-[#25D366]/30 text-[#25D366] rounded-control py-3 text-sm font-display font-semibold mb-4"
    >
      <MessageCircle size={16} />
      Falar com o professor
    </a>
  )
}
