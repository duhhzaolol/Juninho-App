import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Avatar } from '@/components/ui/Avatar'
import { WorkoutHeroCard } from '@/components/student/WorkoutHeroCard'
import { ActivityRow } from '@/components/student/ActivityRow'
import { StatusCard } from '@/components/shared/StatusCard'
import { BottomNav } from '@/components/student/BottomNav'
import { FadeIn } from '@/components/shared/FadeIn'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Dumbbell, BarChart3, Calendar, PlayCircle, Clock3, AlertTriangle, Coffee, CheckCircle2, Bell, MessageCircle } from 'lucide-react'

function greeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Bom dia'
  if (hour < 18) return 'Boa tarde'
  return 'Boa noite'
}

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const now = new Date()
  const weekday = now.getDay() // 0=domingo ... 6=sábado
  const isRestDay = weekday === 0 || weekday === 6

  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)

  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - weekday)
  weekStart.setHours(0, 0, 0, 0)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 7)

  const student = await prisma.studentProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      assignments: {
        where: { status: 'active' },
        include: { workout: true },
      },
      subscriptions: { where: { status: 'active' }, take: 1 },
      calendarEntries: { where: { date: { gte: weekStart, lt: weekEnd } } },
      trainer: true,
    },
  })
  if (!student) redirect('/login')

  const unreadCount = await prisma.message.count({
    where: { senderId: student.trainer.userId, receiverId: session.user.id, readAt: null },
  })
  if (student.status === 'pending') redirect('/aguardando-aprovacao')

  const todaysWorkout = student.assignments.find((a) => a.weekday === weekday)
  const weekdayHasWorkout = new Set(student.assignments.map((a) => a.weekday))
  const trainedThisWeek = new Set(
    student.calendarEntries.filter((e) => e.status === 'TRAINED').map((e) => new Date(e.date).getDay())
  )
  const alreadyTrainedToday = student.calendarEntries.some(
    (e) => e.status === 'TRAINED' && new Date(e.date).toDateString() === now.toDateString()
  )
  const activeSub = student.subscriptions[0]
  const overdueDays = activeSub?.renewsAt
    ? Math.ceil((Date.now() - activeSub.renewsAt.getTime()) / 86400000)
    : null
  const isOverdue = overdueDays !== null && overdueDays > 0

  const activities = [
    { icon: <Dumbbell size={20} className="text-navy" />, iconBg: 'bg-gold', title: 'Treino do Dia', subtitle: 'Acesse seu treino de hoje', href: '/treino' },
    { icon: <BarChart3 size={20} className="text-white" />, iconBg: 'bg-purple', title: 'Progressão', subtitle: 'Acompanhe sua evolução', href: '/progresso' },
    { icon: <Calendar size={20} className="text-white" />, iconBg: 'bg-purple', title: 'Constância', subtitle: 'Frequência e sequência de treinos', href: '/calendario' },
    { icon: <PlayCircle size={20} className="text-white" />, iconBg: 'bg-purple', title: 'Materiais', subtitle: 'Aulas, dicas e conteúdos', href: '/biblioteca' },
  ]

  return (
    <main className="min-h-screen bg-navy pb-28 px-5 pt-8">
      <FadeIn>
        <header className="flex items-center gap-3 mb-6">
          <Link href="/perfil">
            <Avatar src={student.avatarUrl} size="md" ring />
          </Link>
          <div className="flex-1">
            <p className="font-display font-bold text-lg text-white">
              {greeting()}, {session.user.name?.split(' ')[0] ?? 'Atleta'}
            </p>
            <p className="text-xs text-white/50">{student.goal ?? 'Defina seu objetivo no perfil'}</p>
          </div>
          <Link href="/notificacoes" className="relative p-2">
            <Bell size={20} className="text-white/60" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
            )}
          </Link>
        </header>
      </FadeIn>

      {isOverdue && (
        <FadeIn delay={0.05}>
          <StatusCard
            variant="warning"
            icon={<AlertTriangle size={18} />}
            title="Mensalidade vencida"
            subtitle={`Venceu há ${overdueDays} dia${overdueDays === 1 ? '' : 's'} — fale com seu professor para renovar.`}
            className="mb-4"
          />
        </FadeIn>
      )}

      <FadeIn delay={0.1}>
        {isRestDay ? (
          <StatusCard
            variant="info"
            icon={<Coffee size={18} />}
            title="Hoje é dia de descanso"
            subtitle="Aproveite para recuperar — amanhã tem treino de novo."
            className="mb-4"
          />
        ) : todaysWorkout ? (
          alreadyTrainedToday ? (
            <StatusCard
              variant="info"
              icon={<CheckCircle2 size={18} />}
              title={`Treino de hoje concluído: ${todaysWorkout.workout.name}`}
              subtitle="Mandou bem! Amanhã tem mais."
              className="mb-4"
            />
          ) : (
            <WorkoutHeroCard
              workoutId={todaysWorkout.workoutId}
              name={todaysWorkout.workout.name}
              goal={todaysWorkout.workout.goal}
              subtitle="Treino de hoje"
            />
          )
        ) : (
          <StatusCard
            variant="info"
            icon={<Clock3 size={18} />}
            title="Seu treino está sendo montado"
            subtitle="Assim que o professor publicar, ele aparece aqui automaticamente."
            className="mb-4"
          />
        )}
      </FadeIn>

      <FadeIn delay={0.12}>
        <div className="bg-navy-light border border-white/10 rounded-card p-3 mb-4">
          <p className="text-[10px] uppercase tracking-wider text-white/40 mb-2 px-1">Resumo semanal</p>
          <div className="grid grid-cols-7 gap-1">
            {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((label, i) => {
              const isToday = i === weekday
              const isPast = i < weekday
              const hasWorkout = weekdayHasWorkout.has(i)
              const trained = trainedThisWeek.has(i)

              return (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-display font-bold
                      ${trained ? 'bg-gold text-navy' : ''}
                      ${!trained && hasWorkout && isPast ? 'bg-white/10 text-white/30' : ''}
                      ${!trained && hasWorkout && !isPast ? 'border border-white/15 text-white/40' : ''}
                      ${!hasWorkout ? 'text-white/20' : ''}
                      ${isToday ? 'ring-2 ring-purple-light' : ''}
                    `}
                  >
                    {trained ? '✓' : !hasWorkout ? '·' : ''}
                  </div>
                  <span className="text-[9px] text-white/30">{label}</span>
                </div>
              )
            })}
          </div>
        </div>
      </FadeIn>

      <p className="text-[11px] uppercase tracking-wider text-white/40 mb-2 mt-2">Atividades</p>

      {activities.map((a, i) => (
        <FadeIn key={a.title} delay={0.15 + i * 0.05}>
          <ActivityRow icon={a.icon} iconBg={a.iconBg} title={a.title} subtitle={a.subtitle} href={a.href} />
        </FadeIn>
      ))}

      <FadeIn delay={0.35}>
        <Link
          href="/mensagens"
          className="flex items-center justify-center gap-2 bg-purple/15 border border-purple-light/30 text-purple-light rounded-control py-3 text-sm font-display font-semibold mb-4"
        >
          <MessageCircle size={16} />
          Falar com o professor
        </Link>
      </FadeIn>

      <BottomNav />
    </main>
  )
}
