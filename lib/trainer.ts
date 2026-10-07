import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Professor logado (ou null) — usado nas rotas da área do professor
export async function currentTrainer() {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== 'TRAINER') return null
  return prisma.trainerProfile.findUnique({ where: { userId: session.user.id } })
}

export function slugify(text: string) {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50) || 'planilha'
}

// Mensagem pronta para o WhatsApp com o link de acesso
export function whatsappLink(phone: string | null | undefined, text: string) {
  const digits = (phone ?? '').replace(/\D/g, '')
  const number = digits && digits.length <= 11 ? `55${digits}` : digits
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`
}
