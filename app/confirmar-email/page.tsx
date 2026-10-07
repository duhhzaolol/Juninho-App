import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { AuthShell } from '@/components/shared/AuthShell'
import { ConfirmEmailClient } from './ConfirmEmailClient'

export const dynamic = 'force-dynamic'

// Para quem fechou o app antes de digitar o código
export default async function ConfirmEmailPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')
  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user) redirect('/login')
  if (user.emailVerifiedAt) redirect('/app')

  return (
    <AuthShell
      title="Confirme seu e-mail"
      subtitle={
        <>
          Toque em &quot;Reenviar código&quot; para receber o código em <span className="text-white">{user.email}</span>.
        </>
      }
    >
      <ConfirmEmailClient />
    </AuthShell>
  )
}
