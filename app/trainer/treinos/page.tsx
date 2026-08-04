import Link from 'next/link'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/trainer/Sidebar'
import { Dumbbell, ChevronRight } from 'lucide-react'

const weekdayLetters = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

export default async function TrainerWorkoutsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const trainer = await prisma.trainerProfile.findUnique({ where: { userId: session.user.id } })
  if (!trainer) return null

  const programs = await prisma.weeklyProgram.findMany({
    where: { trainerId: trainer.id },
    include: { days: true },
    orderBy: { createdAt: 'desc' },
  })

  const workouts = await prisma.workout.findMany({
    where: { trainerId: trainer.id },
    include: { _count: { select: { assignments: true, blocks: true } } },
    orderBy: { name: 'asc' },
  })

  const usedInProgram = new Set(programs.flatMap((p) => p.days.map((d) => d.workoutId).filter(Boolean)))
  const standaloneWorkouts = workouts.filter((w) => !usedInProgram.has(w.id))

  return (
    <div className="min-h-screen bg-navy flex flex-col md:flex-row">
      <Sidebar />

      <main className="flex-1 px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <p className="font-display font-bold text-xl text-white">Treinos</p>
          <div className="flex gap-4">
            <Link href="/trainer/treinos/programas" className="text-white/50 text-sm">Ver programas</Link>
            <Link href="/trainer/treinos/programas/novo" className="text-gold-light text-sm">+ Novo programa</Link>
          </div>
        </div>

        {programs.length > 0 && (
          <div className="mb-8">
            <p className="text-[11px] uppercase tracking-wider text-white/40 mb-3">Programas</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {programs.map((program) => {
                const daysWithWorkout = new Set(program.days.filter((d) => d.workoutId).map((d) => d.weekday))
                return (
                  <Link
                    key={program.id}
                    href={`/trainer/treinos/programas/${program.id}`}
                    className="bg-navy-light border border-white/10 rounded-card p-5 flex flex-col"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-11 h-11 rounded-control bg-gold/15 flex items-center justify-center">
                        <Dumbbell size={20} className="text-gold-light" />
                      </div>
                      <ChevronRight size={18} className="text-white/30" />
                    </div>

                    <p className="font-display font-semibold text-white mb-1">{program.name}</p>
                    <p className="text-xs text-white/40 mb-4">
                      {daysWithWorkout.size} dia(s) com treino definido
                    </p>

                    <div className="flex gap-1.5 mt-auto">
                      {weekdayLetters.map((letter, i) => (
                        <div
                          key={i}
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-display font-bold ${
                            daysWithWorkout.has(i) ? 'bg-gold/20 text-gold-light' : 'bg-white/5 text-white/20'
                          }`}
                        >
                          {letter}
                        </div>
                      ))}
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        <div>
          <p className="text-[11px] uppercase tracking-wider text-white/40 mb-3">
            {programs.length > 0 ? 'Treinos avulsos' : 'Treinos'}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {standaloneWorkouts.map((workout) => (
              <Link
                key={workout.id}
                href={`/trainer/treinos/${workout.id}/editar`}
                className="bg-navy-light border border-white/10 rounded-card p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-11 h-11 rounded-control bg-purple/20 flex items-center justify-center">
                    <Dumbbell size={20} className="text-purple-200" />
                  </div>
                  <span className="text-xs text-white/40">{workout._count.blocks} exercícios</span>
                </div>
                <p className="font-display font-semibold text-white mb-1">{workout.name}</p>
                <p className="text-xs text-white/40">
                  {workout.goal ?? 'Sem objetivo definido'} · {workout._count.assignments} aluno(s) usando
                </p>
              </Link>
            ))}
          </div>

          {standaloneWorkouts.length === 0 && workouts.length > 0 && (
            <p className="text-white/30 text-sm">Todos os treinos já estão organizados em programas.</p>
          )}

          {workouts.length === 0 && (
            <p className="text-white/40 text-sm">Nenhum treino avulso. Clique em "+ Novo programa" pra começar.</p>
          )}
        </div>
      </main>
    </div>
  )
}
