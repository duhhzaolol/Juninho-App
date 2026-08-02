import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Avatar } from '@/components/ui/Avatar'
import { WorkoutHeroCard } from '@/components/student/WorkoutHeroCard'
import { ActivityRow } from '@/components/student/ActivityRow'
import { BottomNav } from '@/components/student/BottomNav'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Dumbbell, BarChart3, Calendar, PlayCircle } from 'lucide-react'

function greeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Bom dia'
  if (hour < 18) return 'Boa tarde'
  return 'Boa noite'
}

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const student = await prisma.studentProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      assignments: {
        where: { status: 'active' },
        include: { workout: true },
        take: 1,
      },
    },
  })

  const activeWorkout = student?.assignments[0]

  return (
    <main className="min-h-screen bg-navy pb-28 px-5 pt-8">
      <header className="flex items-center gap-3 mb-6">
        <Link href="/perfil">
          <Avatar src={student?.avatarUrl} size="md" ring />
        </Link>
        <div>
          <p className="font-display font-bold text-lg text-white">
            {greeting()}, {session?.user?.name?.split(' ')[0] ?? 'Atleta'}
          </p>
          <p className="text-xs text-white/50">{student?.goal ?? 'Defina seu objetivo no perfil'}</p>
        </div>
      </header>

      {activeWorkout && (
        <WorkoutHeroCard
          workoutId={activeWorkout.workoutId}
          name={activeWorkout.workout.name}
          goal={activeWorkout.workout.goal}
          subtitle={`Semana ${activeWorkout.currentWeek} · Dia ${activeWorkout.currentDay}`}
        />
      )}

      <p className="text-[11px] uppercase tracking-wider text-white/40 mb-2">Atividades</p>

      <ActivityRow
        icon={<Dumbbell size={20} className="text-navy" />}
        iconBg="bg-gold"
        title="Treino do Dia"
        subtitle="Acesse seu treino de hoje"
        href="/treino"
      />
      <ActivityRow
        icon={<BarChart3 size={20} className="text-white" />}
        iconBg="bg-purple"
        title="Progressão"
        subtitle="Acompanhe sua evolução"
        href="/progresso"
      />
      <ActivityRow
        icon={<Calendar size={20} className="text-white" />}
        iconBg="bg-purple"
        title="Ficha 30 Dias"
        subtitle="Registre seu uso diário"
        comingSoon
      />
      <ActivityRow
        icon={<PlayCircle size={20} className="text-white" />}
        iconBg="bg-purple"
        title="Materiais"
        subtitle="Aulas, dicas e conteúdos"
        href="/biblioteca"
      />

      <BottomNav />
    </main>
  )
}
