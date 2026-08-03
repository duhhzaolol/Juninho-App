import Link from 'next/link'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/trainer/Sidebar'
import { Avatar } from '@/components/ui/Avatar'

export default async function StudentsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const { q } = await searchParams

  const trainer = await prisma.trainerProfile.findUnique({ where: { userId: session.user.id } })
  if (!trainer) redirect('/login')

  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000)

  const students = await prisma.studentProfile.findMany({
    where: {
      trainerId: trainer.id,
      ...(q ? { user: { name: { contains: q, mode: 'insensitive' } } } : {}),
    },
    include: {
      user: true,
      calendarEntries: { where: { date: { gte: thirtyDaysAgo } } },
    },
  })

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

        <form className="mb-4">
          <input
            name="q"
            defaultValue={q ?? ''}
            placeholder="Buscar aluno..."
            className="w-full bg-navy-light border border-white/10 rounded-control px-4 py-2.5 text-white placeholder:text-white/30 text-sm"
          />
        </form>

        <div className="flex flex-col gap-2">
          {students.map((student) => {
            let daysSince: number | null = null
            let mostRecent: Date | null = null
            for (const entry of student.calendarEntries) {
              if (!mostRecent || entry.date > mostRecent) mostRecent = entry.date
            }
            if (mostRecent) daysSince = Math.floor((Date.now() - mostRecent.getTime()) / 86400000)

            const trainedDays = student.calendarEntries.filter((e) => e.status === 'TRAINED').length
            const adherence = Math.round((trainedDays / 30) * 100)
            const adherenceColor =
              adherence >= 75 ? 'text-green-400' : adherence >= 40 ? 'text-gold-light' : 'text-red-400'

            return (
              <Link
                key={student.id}
                href={`/trainer/alunos/${student.id}`}
                className="flex items-center gap-3 bg-navy-light border border-white/10 rounded-control px-4 py-3"
              >
                <Avatar src={student.avatarUrl} size="sm" />
                <div className="flex-1">
                  <p className="text-sm text-white">{student.user.name}</p>
                  <p className="text-xs text-white/40">
                    {student.level ?? 'Nível não definido'}
                    {daysSince !== null ? ` · ${daysSince} dias sem treinar` : ' · sem registros'}
                  </p>
                </div>
                <span className={`text-xs font-display font-bold ${adherenceColor}`}>{adherence}%</span>
              </Link>
            )
          })}
        </div>

        {students.length === 0 && <p className="text-white/40 text-sm">Nenhum aluno encontrado.</p>}
      </main>
    </div>
  )
}
