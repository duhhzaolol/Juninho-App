import Link from 'next/link'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/trainer/Sidebar'
import { Badge } from '@/components/ui/Badge'

export default async function TrainerWorkoutsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const trainer = await prisma.trainerProfile.findUnique({ where: { userId: session.user.id } })
  if (!trainer) return null

  const workouts = await prisma.workout.findMany({
    where: { trainerId: trainer.id },
    include: {
      _count: { select: { assignments: true, blocks: true } },
    },
    orderBy: { name: 'asc' },
  })

  return (
    <div className="min-h-screen bg-navy flex flex-col md:flex-row">
      <Sidebar />

      <main className="flex-1 px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <p className="font-display font-bold text-xl text-white">Treinos</p>
          <Link href="/trainer/treinos/criador" className="text-gold-light text-sm">+ Novo treino</Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {workouts.map((workout) => (
            <Link
              key={workout.id}
              href={`/trainer/treinos/${workout.id}/editar`}
              className="block bg-navy-light border border-white/10 rounded-control p-4"
            >
              <div className="flex items-center justify-between mb-2">
                {workout.isTemplate && <Badge color="purple" label="Modelo" />}
                <span className="text-xs text-white/40 ml-auto">{workout._count.blocks} exercícios</span>
              </div>
              <p className="text-sm text-white mb-1">{workout.name}</p>
              <p className="text-xs text-white/40">
                {workout.goal ?? 'Sem objetivo definido'} · {workout._count.assignments} aluno(s) usando
              </p>
            </Link>
          ))}
        </div>

        {workouts.length === 0 && (
          <p className="text-white/40 text-sm">Nenhum treino criado ainda. Clique em "+ Novo treino" pra começar.</p>
        )}
      </main>
    </div>
  )
}
