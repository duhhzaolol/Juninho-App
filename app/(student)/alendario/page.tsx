import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Flame, Check } from 'lucide-react'
import { BottomNav } from '@/components/student/BottomNav'
import { cn } from '@/lib/utils'

const monthNames = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]
const weekDays = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB']

function toKey(d: Date) {
  return d.toISOString().slice(0, 10)
}

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const { month } = await searchParams
  const now = new Date()
  const [year, monthNum] = month ? month.split('-').map(Number) : [now.getFullYear(), now.getMonth() + 1]
  const displayMonth = monthNum - 1

  const student = await prisma.studentProfile.findUnique({
    where: { userId: session.user.id },
    include: { calendarEntries: true },
  })
  if (!student) return null

  const entryMap = new Map<string, string>()
  for (const e of student.calendarEntries) entryMap.set(toKey(e.date), e.status)

  // Grade do mês, completando com dias do mês anterior/seguinte pra fechar as semanas
  const firstDay = new Date(year, displayMonth, 1)
  const startWeekday = firstDay.getDay()
  const daysInMonth = new Date(year, displayMonth + 1, 0).getDate()

  const cells: { date: Date; inMonth: boolean }[] = []
  for (let i = 0; i < startWeekday; i++) {
    cells.push({ date: new Date(year, displayMonth, 1 - (startWeekday - i)), inMonth: false })
  }
  for (let d = 1; d <= daysInMonth; d++) cells.push({ date: new Date(year, displayMonth, d), inMonth: true })
  while (cells.length % 7 !== 0) {
    const last = cells[cells.length - 1].date
    cells.push({ date: new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1), inMonth: false })
  }

  const todayKey = toKey(now)

  // Frequência e sequência: janela corrida dos últimos 30 dias (a "ficha de 30 dias")
  const last30Keys: string[] = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    last30Keys.push(toKey(d))
  }
  const trainedLast30 = last30Keys.filter((k) => entryMap.get(k) === 'TRAINED').length

  let streak = 0
  for (let i = last30Keys.length - 1; i >= 0; i--) {
    if (entryMap.get(last30Keys[i]) === 'TRAINED') streak++
    else break
  }

  let bestStreak = 0
  let run = 0
  for (const k of last30Keys) {
    if (entryMap.get(k) === 'TRAINED') {
      run++
      bestStreak = Math.max(bestStreak, run)
    } else {
      run = 0
    }
  }

  const prevMonth = displayMonth === 0 ? `${year - 1}-12` : `${year}-${String(displayMonth).padStart(2, '0')}`
  const nextMonth = displayMonth === 11 ? `${year + 1}-01` : `${year}-${String(displayMonth + 2).padStart(2, '0')}`

  return (
    <main className="min-h-screen bg-navy pb-28 px-5 pt-8">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/dashboard" className="text-white/50">
          <ChevronLeft size={20} />
        </Link>
        <p className="font-display font-bold text-lg text-white">Ficha 30 Dias</p>
      </div>

      <div className="bg-navy-light border border-white/10 rounded-card p-4 mb-4">
        <div className="flex items-center justify-between mb-4">
          <Link href={`/calendario?month=${prevMonth}`} className="text-white/40 p-1">
            <ChevronLeft size={18} />
          </Link>
          <p className="font-display font-semibold text-sm text-white">
            {monthNames[displayMonth]} {year}
          </p>
          <Link href={`/calendario?month=${nextMonth}`} className="text-white/40 p-1">
            <ChevronRight size={18} />
          </Link>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((d) => (
            <p key={d} className="text-center text-[9px] text-white/30 font-semibold">{d}</p>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {cells.map(({ date, inMonth }, i) => {
            const key = toKey(date)
            const status = entryMap.get(key)
            const isToday = key === todayKey

            return (
              <div key={i} className="flex items-center justify-center aspect-square">
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-xs font-display font-semibold',
                    !inMonth && 'text-white/15',
                    inMonth && !status && 'text-white/40',
                    status === 'TRAINED' && 'bg-gold text-navy',
                    status === 'MISSED' && 'bg-red-500/20 text-red-300',
                    status === 'CARDIO' && 'bg-purple-600/50 text-white',
                    status === 'REST' && 'bg-white/10 text-white/40',
                    isToday && 'ring-2 ring-purple-light ring-offset-2 ring-offset-navy-light'
                  )}
                >
                  {status === 'TRAINED' ? <Check size={14} /> : date.getDate()}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="bg-navy-light border border-white/10 rounded-card p-4 mb-4">
        <p className="text-[10px] uppercase tracking-wider text-white/40 mb-1">Frequência</p>
        <p className="font-display font-bold text-2xl text-white mb-2">
          {trainedLast30}<span className="text-sm text-white/40">/30 dias</span>
        </p>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-gold rounded-full" style={{ width: `${(trainedLast30 / 30) * 100}%` }} />
        </div>
      </div>

      <div className="bg-navy-light border border-white/10 rounded-card p-4 mb-4">
        <p className="text-[10px] uppercase tracking-wider text-white/40 mb-2">Sequência atual</p>
        <div className="flex items-center gap-2">
          <Flame size={20} className="text-gold-light" />
          <p className="font-display font-bold text-2xl text-white">{streak} <span className="text-sm text-white/40 font-normal">dias</span></p>
        </div>
        <p className="text-xs text-white/40 mt-1">Melhor sequência: {bestStreak} dias</p>
      </div>

      <div className="bg-purple-dark border border-purple-light/30 rounded-card p-4 text-center">
        <p className="text-sm text-white font-medium mb-1">"Disciplina hoje, resultado amanhã!"</p>
        <p className="text-xs text-white/50">Você está no caminho certo.</p>
      </div>

      <BottomNav />
    </main>
  )
}
