import { prisma } from '@/lib/prisma'
import { LoginForm } from '@/components/shared/LoginForm'

export default async function LoginPage() {
  // Como hoje é um único professor usando o sistema, pega o WhatsApp dele
  // pra mostrar como atalho de ajuda na tela de login
  const trainer = await prisma.trainerProfile.findFirst({ select: { whatsapp: true } })

  return <LoginForm trainerWhatsapp={trainer?.whatsapp ?? null} />
}
