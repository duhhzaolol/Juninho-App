import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Domínios onde a página inicial ("/") mostra a página de links em vez de abrir o app.
// No app.juninhomoro.com.br (e nos endereços da Vercel) a página inicial continua abrindo o app.
const LINKS_HOSTS = ['juninhomoro.com.br', 'www.juninhomoro.com.br']

export function isLinksHost(host: string | null) {
  const h = (host ?? '').split(':')[0].toLowerCase()
  return LINKS_HOSTS.includes(h)
}

// Para onde mandar quem abre o app: login, área do professor, confirmar e-mail, aguardando aprovação ou Início
export async function redirectToAppHome(): Promise<never> {
  const session = await auth()

  if (!session?.user) redirect('/login')
  if (session.user.role === 'TRAINER') redirect('/trainer/dashboard')

  const user = await prisma.user.findUnique({ where: { id: session.user.id }, include: { studentProfile: true } })
  if (!user) redirect('/login')
  if (!user.emailVerifiedAt) redirect('/confirmar-email')
  if (user.studentProfile?.status === 'pending') redirect('/aguardando-aprovacao')

  redirect('/dashboard')
}
