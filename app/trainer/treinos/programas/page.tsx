import Link from 'next/link'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/trainer/Sidebar'

export default async function WeeklyProgramsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const trainer = await prisma.trainerProfile.findUnique({ where: { userId: session.user.id } })
  if (!trainer) return null

  const programs = await prisma.weeklyProgram.findMany({
    where: { trainerId: trainer.id },
    include: { days: { include: { workout: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="min-h-screen bg-navy flex flex-col md:flex-row">
      <Sidebar />

      <main className="flex-1 px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <p className="font-display font-bold text-xl text-white">Programas semanais</p>
          <Link href="/trainer/treinos/programas/novo" className="text-gold-light text-sm">+ Novo programa</Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {programs.map((program) => (
            <Link
              key={program.id}
              href={`/trainer/treinos/programas/${program.id}/editar`}
              className="block bg-navy-light border border-white/10 rounded-control p-4"
            >
              <p className="text-sm text-white mb-1">{program.name}</p>
              <p className="text-xs text-white/40">
                {program.days.filter((d) => d.workoutId).length} dia(s) com treino definido
              </p>
            </Link>
          ))}
        </div>

        {programs.length === 0 && (
          <p className="text-white/40 text-sm">Nenhum programa criado ainda. Clique em "+ Novo programa" pra começar.</p>
        )}
      </main>
    </div>
  )
}
