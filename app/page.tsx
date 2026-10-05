import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export default async function RootPage() {
  const session = await auth()

  if (!session?.user) redirect('/login')
  if (session.user.role === 'TRAINER') redirect('/trainer/dashboard')

  const student = await prisma.studentProfile.findUnique({ where: { userId: session.user.id } })
  if (student?.status === 'pending') redirect('/aguardando-aprovacao')

  redirect('/dashboard')
}
