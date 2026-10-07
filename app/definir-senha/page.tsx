import Link from 'next/link'
import { AuthShell } from '@/components/shared/AuthShell'
import { findPasswordToken } from '@/lib/tokens'
import { SetPasswordForm } from './SetPasswordForm'

export const dynamic = 'force-dynamic'

export default async function SetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams
  const row = await findPasswordToken(token ?? '')

  if (!row) {
    return (
      <AuthShell title="Link expirado" subtitle="Este link já foi usado ou passou da validade.">
        <Link href="/app/esqueci-senha" className="text-center font-display font-semibold text-sm bg-gold text-navy py-3.5 rounded-control">
          Receber um link novo
        </Link>
        <Link href="/app/login" className="text-center text-white/40 text-sm mt-6">
          Voltar para o login
        </Link>
      </AuthShell>
    )
  }

  return (
    <AuthShell
      title={`Oi, ${row.user.name.split(' ')[0]}! Crie sua senha`}
      subtitle={
        <>
          Você vai entrar com <span className="text-white">{row.user.email}</span>.
        </>
      }
    >
      <SetPasswordForm token={token!} email={row.user.email} />
    </AuthShell>
  )
}
