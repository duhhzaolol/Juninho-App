import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// Proteção de todas as telas da aluna: precisa estar logada, com e-mail confirmado e cadastro aprovado.
export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')
  if (session.user.role === 'TRAINER') redirect('/trainer/dashboard')

  const user = await prisma.user.findUnique({ where: { id: session.user.id }, include: { studentProfile: true } })
  if (!user || !user.studentProfile) redirect('/login')
  if (!user.emailVerifiedAt) redirect('/confirmar-email')
  if (user.studentProfile.status === 'pending') redirect('/aguardando-aprovacao')

  return <>{children}</>
}
