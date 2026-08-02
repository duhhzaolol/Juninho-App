import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { BottomNav } from '@/components/student/BottomNav'
import { ChevronRight, Coffee } from 'lucide-react'
import { cn } from '@/lib/utils'

const weekdayLabels = [
  { value: 1, label: 'Segunda-feira' },
  { value: 2, label: 'Terça-feira' },
  { value: 3, label: 'Quarta-feira' },
  { value: 4, label: 'Quinta-feira' },
  { value: 5, label: 'Sexta-feira' },
  { value: 6, label: 'Sábado' },
  { value: 0, label: 'Domingo' },
]

export default async function TreinoIndexPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const today = new Date().getDay()

  const student = await prisma.studentProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      assignments: {
        where: { status: 'active' },
        include: { workout: true },
      },
    },
  })
  if (!student) redirect('/login')

  const byWeekday = new Map(student.assignments.map((a) => [a.weekday, a]))

  return (
    <main className="min-h-screen bg-navy pb-28 px-5 pt-8">
      <p className="font-display font-bold text-xl text-white mb-1">Sua semana</p>
      <p className="text-xs text-white/40 mb-6">
        Perdeu um dia? Sem problema — pode fazer qualquer treino, em qualquer dia.
      </p>

      <div className="flex flex-col gap-2">
        {weekdayLabels.map(({ value, label }) => {
          const assignment = byWeekday.get(value)
          const isToday = value === today

          if (!assignment) {
            return (
              <div
                key={value}
                className={cn(
                  'flex items-center justify-between rounded-control px-4 py-3 border',
                  isToday ? 'bg-white/5 border-purple-light/40' : 'bg-white/5 border-white/10'
                )}
              >
                <div className="flex items-center gap-2">
                  <Coffee size={16} className="text-white/30" />
                  <div>
                    <p className="text-sm text-white/50">{label}{isToday && ' · hoje'}</p>
                    <p className="text-xs text-white/30">Descanso</p>
                  </div>
                </div>
              </div>
            )
          }

          return (
            <Link
              key={value}
              href={`/treino/${assignment.workoutId}`}
              className={cn(
                'flex items-center justify-between rounded-control px-4 py-3 border',
                isToday ? 'bg-gold/10 border-gold/30' : 'bg-navy-light border-white/10'
              )}
            >
              <div>
                <p className="text-xs text-white/40">{label}{isToday && ' · hoje'}</p>
                <p className="text-sm text-white font-medium">{assignment.workout.name}</p>
              </div>
              <ChevronRight size={16} className="text-white/30" />
            </Link>
          )
        })}
      </div>

      <BottomNav />
    </main>
  )
}
