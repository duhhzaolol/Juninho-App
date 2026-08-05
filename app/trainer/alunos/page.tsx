import Link from 'next/link'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/trainer/Sidebar'
import { Avatar } from '@/components/ui/Avatar'
import { ApproveStudentButton } from '@/components/trainer/ApproveStudentButton'
import { AlertTriangle, Dumbbell, CreditCard, Clock3 } from 'lucide-react'

const INACTIVE_DAYS = 7
const STALE_WORKOUT_DAYS = 45

export default async function StudentsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const { q } = await searchParams

  const trainer = await prisma.trainerProfile.findUnique({ where: { userId: session.user.id } })
  if (!trainer) redirect('/login')

  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000)

  const pendingStudents = await prisma.studentProfile.findMany({
    where: { trainerId: trainer.id, status: 'pending' },
    include: { user: true },
    orderBy: { id: 'desc' },
  })

  const students = await prisma.studentProfile.findMany({
    where: {
      trainerId: trainer.id,
      status: 'active',
      ...(q ? { user: { name: { contains: q, mode: 'insensitive' } } } : {}),
    },
    include: {
      user: true,
      calendarEntries: { where: { date: { gte: thirtyDaysAgo } } },
      assignments: { where: { status: 'active' } },
      subscriptions: { where: { status: 'active' }, include: { plan: true } },
    },
  })

  const enriched = students.map((student) => {
    let mostRecent: Date | null = null
    for (const entry of student.calendarEntries) {
      if (!mostRecent || entry.date > mostRecent) mostRecent = entry.date
    }
    const daysSince = mostRecent ? Math.floor((Date.now() - mostRecent.getTime()) / 86400000) : null
    const trainedDays = student.calendarEntries.filter((e) => e.status === 'TRAINED').length
    const adherence = Math.round((trainedDays / 30) * 100)

    const hasWorkout = student.assignments.length > 0
    const oldestAssignment = student.assignments.reduce<Date | null>((oldest, a) => {
      if (!oldest || a.startedAt < oldest) return a.startedAt
      return oldest
    }, null)
    const workoutDays = oldestAssignment ? Math.floor((Date.now() - oldestAssignment.getTime()) / 86400000) : null

    const activeSub = student.subscriptions[0]
    const hasPlan = Boolean(activeSub)
    const overdueDays = activeSub?.renewsAt && activeSub.renewsAt.getTime() < Date.now()
      ? Math.ceil((Date.now() - activeSub.renewsAt.getTime()) / 86400000)
      : null

    return {
      student,
      daysSince,
      adherence,
      hasWorkout,
      workoutDays,
      hasPlan,
      activeSub,
      overdueDays,
      isInactive: daysSince === null || daysSince > INACTIVE_DAYS,
      isStale: hasWorkout && workoutDays !== null && workoutDays > STALE_WORKOUT_DAYS,
    }
  })

  const inactiveList = enriched.filter((e) => e.isInactive)
  const noWorkoutList = enriched.filter((e) => !e.hasWorkout)
  const noPlanList = enriched.filter((e) => !e.hasPlan)
  const staleList = enriched.filter((e) => e.isStale)

  function vencimentoBadge(e: (typeof enriched)[0]) {
    if (!e.hasPlan) return <span className="text-[11px] text-white/30">sem plano</span>
    if (e.overdueDays !== null) {
      return <span className="text-[11px] font-semibold text-red-400">vencido há {e.overdueDays}d</span>
    }
    if (e.activeSub?.renewsAt) {
      const daysLeft = Math.ceil((e.activeSub.renewsAt.getTime() - Date.now()) / 86400000)
      const color = daysLeft <= 5 ? 'text-gold-light' : 'text-green-400'
      return <span className={`text-[11px] font-semibold ${color}`}>vence em {daysLeft}d</span>
    }
    return null
  }

  return (
    <div className="min-h-screen bg-navy flex flex-col md:flex-row">
      <Sidebar />

      <main className="flex-1 px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <p className="font-display font-bold text-xl text-white">Alunos</p>
          <Link href="/trainer/alunos/novo" className="text-gold-light text-sm">
            + Novo aluno
          </Link>
        </div>

        {pendingStudents.length > 0 && (
          <div className="mb-6">
            <p className="text-[11px] uppercase tracking-wider text-gold-light mb-3">
              Pendentes de aprovação ({pendingStudents.length})
            </p>
            <div className="flex flex-col gap-2">
              {pendingStudents.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between gap-3 bg-gold/5 border border-gold/20 rounded-control px-4 py-3"
                >
                  <div>
                    <p className="text-sm text-white">{student.user.name}</p>
                    <p className="text-xs text-white/40">{student.user.email}</p>
                  </div>
                  <ApproveStudentButton studentId={student.id} name={student.user.name} whatsapp={student.whatsapp} />
                </div>
              ))}
            </div>
          </div>
        )}

        {(inactiveList.length > 0 || noWorkoutList.length > 0 || noPlanList.length > 0 || staleList.length > 0) && (
          <div className="mb-6">
            <p className="text-[11px] uppercase tracking-wider text-white/40 mb-3">Precisa de atenção</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {inactiveList.length > 0 && (
                <div className="bg-red-500/5 border border-red-500/20 rounded-control p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle size={14} className="text-red-400" />
                    <p className="text-xs font-semibold text-red-400">Inativos ({inactiveList.length})</p>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {inactiveList.map((e) => (
                      <Link key={e.student.id} href={`/trainer/alunos/${e.student.id}`} className="text-xs text-white/70">
                        {e.student.user.name} · {e.daysSince === null ? 'nunca treinou' : `${e.daysSince}d sem treinar`}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {noWorkoutList.length > 0 && (
                <div className="bg-purple/5 border border-purple-light/20 rounded-control p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Dumbbell size={14} className="text-purple-light" />
                    <p className="text-xs font-semibold text-purple-light">Sem treino cadastrado ({noWorkoutList.length})</p>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {noWorkoutList.map((e) => (
                      <Link key={e.student.id} href={`/trainer/alunos/${e.student.id}/programa`} className="text-xs text-white/70">
                        {e.student.user.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {noPlanList.length > 0 && (
                <div className="bg-gold/5 border border-gold/20 rounded-control p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard size={14} className="text-gold-light" />
                    <p className="text-xs font-semibold text-gold-light">Sem plano cadastrado ({noPlanList.length})</p>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {noPlanList.map((e) => (
                      <Link key={e.student.id} href={`/trainer/alunos/${e.student.id}/plano`} className="text-xs text-white/70">
                        {e.student.user.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {staleList.length > 0 && (
                <div className="bg-white/5 border border-white/10 rounded-control p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock3 size={14} className="text-white/60" />
                    <p className="text-xs font-semibold text-white/60">Treino desatualizado ({staleList.length})</p>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {staleList.map((e) => (
                      <Link key={e.student.id} href={`/trainer/alunos/${e.student.id}/programa`} className="text-xs text-white/70">
                        {e.student.user.name} · mesmo treino há {e.workoutDays}d
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <form className="mb-4">
          <input
            name="q"
            defaultValue={q ?? ''}
            placeholder="Buscar aluno..."
            className="w-full bg-navy-light border border-white/10 rounded-control px-4 py-2.5 text-white placeholder:text-white/30 text-sm"
          />
        </form>

        <p className="text-[11px] uppercase tracking-wider text-white/40 mb-2">Todos os ativos ({enriched.length})</p>

        <div className="flex flex-col gap-2">
          {enriched.map((e) => {
            const adherenceColor =
              e.adherence >= 75 ? 'text-green-400' : e.adherence >= 40 ? 'text-gold-light' : 'text-red-400'

            return (
              <Link
                key={e.student.id}
                href={`/trainer/alunos/${e.student.id}`}
                className="flex items-center gap-3 bg-navy-light border border-white/10 rounded-control px-4 py-3"
              >
                <Avatar src={e.student.avatarUrl} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white">{e.student.user.name}</p>
                  <p className="text-xs text-white/40">
                    {e.student.level ?? 'Nível não definido'}
                    {e.daysSince !== null ? ` · ${e.daysSince} dias sem treinar` : ' · sem registros'}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-xs font-display font-bold ${adherenceColor}`}>{e.adherence}%</p>
                  {vencimentoBadge(e)}
                </div>
              </Link>
            )
          })}
        </div>

        {students.length === 0 && <p className="text-white/40 text-sm">Nenhum aluno encontrado.</p>}
      </main>
    </div>
  )
}
