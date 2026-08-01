import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { BottomNav } from '@/components/student/BottomNav'

function greeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Bom dia'
  if (hour < 18) return 'Boa tarde'
  return 'Boa noite'
}

export default async function DashboardPage() {
  const session = await auth()

  const student = await prisma.studentProfile.findUnique({
    where: { userId: session?.user?.id },
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
        <div className="w-11 h-11 rounded-full bg-purple/40 border border-gold/40" />
        <div>
          <p className="font-display font-bold text-lg text-white">
            {greeting()}, {session?.user?.name?.split(' ')[0] ?? 'Atleta'}
          </p>
          <p className="text-xs text-white/50">{student?.goal ?? 'Defina seu objetivo no perfil'}</p>
        </div>
      </header>

      {activeWorkout && (
        <Card
          variant="workout"
          eyebrow="Seu plano atual"
          title={activeWorkout.workout.name}
          subtitle={`Semana ${activeWorkout.currentWeek} · Dia ${activeWorkout.currentDay}`}
          className="mb-4"
        >
          <Button size="sm">Iniciar treino</Button>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Card variant="glass" title="Treino do dia" subtitle="Acesse seu treino de hoje" />
        <Card variant="glass" title="Evolução" subtitle="Acompanhe seu progresso" />
        <Card variant="glass" title="Calendário" subtitle="Registre seu uso diário" />
        <Card variant="glass" title="Biblioteca" subtitle="Aulas, dicas e conteúdos" />
      </div>

      <BottomNav />
    </main>
  )
}
