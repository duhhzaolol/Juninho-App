import { prisma } from '@/lib/prisma'
import { LoginForm } from '@/components/shared/LoginForm'

// Busca o WhatsApp do professor quando a página é aberta, e não durante o build.
// Assim o deploy na Vercel não depende do banco de dados estar acessível naquele momento.
export const dynamic = 'force-dynamic'

export default async function LoginPage() {
  // Como hoje é um único professor usando o sistema, pega o WhatsApp dele
  // pra mostrar como atalho de ajuda na tela de login
  const trainer = await prisma.trainerProfile.findFirst({ select: { whatsapp: true } })

  return <LoginForm trainerWhatsapp={trainer?.whatsapp ?? null} />
}
