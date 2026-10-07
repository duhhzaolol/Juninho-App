import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// Proteção de toda a área do professor: só entra quem tem conta de professor.
export default async function TrainerLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')
  if (session.user.role !== 'TRAINER') redirect('/dashboard')
  return <>{children}</>
}
