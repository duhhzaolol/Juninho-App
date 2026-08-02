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
import { Dumbbell, BarChart3, Calendar, PlayCircle, Clock3, AlertTriangle, Coffee, CheckCircle2 } from 'lucide-react'

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

  const student = await prisma.studentProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      assignments: {
        where: { status: 'active', weekday },
        include: { workout: true },
        take: 1,
      },
      subscriptions: { where: { status: 'active' }, take: 1 },
      calendarEntries: { where: { date: { gte: startOfToday } }, take: 1 },
    },
  })
  if (!student) redirect('/login')

  const todaysWorkout = student.assignments[0]
  const alreadyTrainedToday = student.calendarEntries[0]?.status === 'TRAINED'
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
          <div>
            <p className="font-display font-bold text-lg text-white">
              {greeting()}, {session.user.name?.split(' ')[0] ?? 'Atleta'}
            </p>
            <p className="text-xs text-white/50">{student.goal ?? 'Defina seu objetivo no perfil'}</p>
          </div>
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

      <p className="text-[11px] uppercase tracking-wider text-white/40 mb-2 mt-2">Atividades</p>

      {activities.map((a, i) => (
        <FadeIn key={a.title} delay={0.15 + i * 0.05}>
          <ActivityRow icon={a.icon} iconBg={a.iconBg} title={a.title} subtitle={a.subtitle} href={a.href} />
        </FadeIn>
      ))}

      <BottomNav />
    </main>
  )
}
