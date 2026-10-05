import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Badge } from '@/components/ui/Badge'
import { BottomNav } from '@/components/student/BottomNav'
import { SignOutButton } from '@/components/shared/SignOutButton'
import { AvatarUpload } from '@/components/student/AvatarUpload'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function ProfilePage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const student = await prisma.studentProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      user: true,
      subscriptions: { where: { status: 'active' }, include: { plan: true } },
    },
  })
  if (!student) redirect('/login')

  return (
    <main className="min-h-screen bg-navy pb-28 px-5 pt-8">
      <div className="flex flex-col items-center mb-8">
        <AvatarUpload currentSrc={student.avatarUrl} />
        <p className="font-display font-bold text-lg text-white mt-3">{student.user.name}</p>
        <p className="text-xs text-white/40">{student.goal ?? 'Objetivo não definido'}</p>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-navy-light rounded-control p-3 text-center">
          <p className="font-display font-bold text-white">{student.weightKg ?? '—'}</p>
          <p className="text-[10px] text-white/40">Peso (kg)</p>
        </div>
        <div className="bg-navy-light rounded-control p-3 text-center">
          <p className="font-display font-bold text-white">{student.heightCm ?? '—'}</p>
          <p className="text-[10px] text-white/40">Altura (cm)</p>
        </div>
        <div className="bg-navy-light rounded-control p-3 text-center">
          <p className="font-display font-bold text-white">{student.age ?? '—'}</p>
          <p className="text-[10px] text-white/40">Idade</p>
        </div>
      </div>

      <div className="mb-6">
        <p className="text-[11px] uppercase tracking-wider text-white/40 mb-2">Plano contratado</p>
        {student.subscriptions.length > 0 ? (
          <div className="flex flex-col gap-2">
            {student.subscriptions.map((sub) => (
              <div key={sub.id} className="flex items-center justify-between bg-navy-light rounded-control px-4 py-3">
                <span className="text-sm text-white">{sub.plan.name}</span>
                <Badge color="gold" label="Ativo" />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-white/40">Nenhum plano ativo no momento.</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Link href="/perfil/editar" className="text-left bg-navy-light rounded-control px-4 py-3 text-sm text-white">Editar informações</Link>
        <Link href="/perfil/senha" className="text-left bg-navy-light rounded-control px-4 py-3 text-sm text-white">Trocar senha</Link>
        <SignOutButton />
      </div>

      <BottomNav />
    </main>
  )
}
