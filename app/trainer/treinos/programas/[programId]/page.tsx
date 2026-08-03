import Link from 'next/link'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/trainer/Sidebar'
import { ChevronLeft, ChevronRight, Coffee, Dumbbell } from 'lucide-react'

const weekdays = [
  { value: 1, label: 'Segunda-feira' },
  { value: 2, label: 'Terça-feira' },
  { value: 3, label: 'Quarta-feira' },
  { value: 4, label: 'Quinta-feira' },
  { value: 5, label: 'Sexta-feira' },
  { value: 6, label: 'Sábado' },
  { value: 0, label: 'Domingo' },
]

export default async function ProgramDetailPage({ params }: { params: Promise<{ programId: string }> }) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const { programId } = await params

  const program = await prisma.weeklyProgram.findUnique({
    where: { id: programId },
    include: { days: { include: { workout: true } } },
  })
  if (!program) return null

  const byWeekday = new Map(program.days.map((d) => [d.weekday, d]))

  return (
    <div className="min-h-screen bg-navy flex flex-col md:flex-row">
      <Sidebar />

      <main className="flex-1 px-6 py-8 max-w-lg">
        <Link href="/trainer/treinos" className="text-white/50 flex items-center gap-1 text-sm mb-4">
          <ChevronLeft size={18} /> Treinos
        </Link>

        <div className="flex items-center justify-between mb-6">
          <p className="font-display font-bold text-xl text-white">{program.name}</p>
          <Link href={`/trainer/treinos/programas/${program.id}/editar`} className="text-gold-light text-sm">
            Editar dias
          </Link>
        </div>

        <div className="flex flex-col gap-2">
          {weekdays.map(({ value, label }) => {
            const day = byWeekday.get(value)

            if (!day || !day.workoutId || !day.workout) {
              return (
                <div
                  key={value}
                  className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-control px-4 py-3.5"
                >
                  <Coffee size={16} className="text-white/30" />
                  <div>
                    <p className="text-sm text-white/50">{label}</p>
                    <p className="text-xs text-white/30">Descanso</p>
                  </div>
                </div>
              )
            }

            return (
              <Link
                key={value}
                href={`/trainer/treinos/${day.workout.id}/editar`}
                className="flex items-center justify-between bg-navy-light border border-white/10 rounded-control px-4 py-3.5"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-control bg-gold/15 flex items-center justify-center shrink-0">
                    <Dumbbell size={16} className="text-gold-light" />
                  </div>
                  <div>
                    <p className="text-xs text-white/40">{label}</p>
                    <p className="text-sm text-white font-medium">{day.workout.name}</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-white/30" />
              </Link>
            )
          })}
        </div>
      </main>
    </div>
  )
}
