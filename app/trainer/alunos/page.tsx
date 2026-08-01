import Link from 'next/link'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Sidebar } from '@/components/trainer/Sidebar'

export default async function StudentsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams
  const session = await auth()
  const trainer = await prisma.trainerProfile.findUnique({ where: { userId: session?.user?.id } })
  if (!trainer) return null

  const students = await prisma.studentProfile.findMany({
    where: {
      trainerId: trainer.id,
      ...(q ? { user: { name: { contains: q, mode: 'insensitive' } } } : {}),
    },
    include: {
      user: true,
      calendarEntries: { orderBy: { date: 'desc' }, take: 1 },
    },
  })

  return (
    <div className="min-h-screen bg-navy flex flex-col md:flex-row">
      <Sidebar />

      <main className="flex-1 px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <p className="font-display font-bold text-xl text-white">Alunos</p>
          <Link href="/trainer/alunos/novo" className="text-gold-light text-sm">+ Novo aluno</Link>
        </div>

        <form className="mb-4">
          <input
            name="q"
            defaultValue={q}
            placeholder="Buscar aluno..."
            className="w-full bg-navy-light border border-white/10 rounded-control px-4 py-2.5 text-white placeholder:text-white/30 text-sm"
          />
        </form>

        <div className="flex flex-col gap-2">
          {students.map((student) => {
            const lastAccess = student.calendarEntries[0]?.date
            const daysSince = lastAccess ? Math.floor((Date.now() - lastAccess.getTime()) / 86400000) : null

            return (
              <Link
                key={student.id}
                href={`/trainer/alunos/${student.id}`}
                className="flex items-center justify-between bg-navy-light border border-white/10 rounded-control px-4 py-3"
              >
                <div>
                  <p className="text-sm text-white">{student.user.name}</p>
                  <p className="text-xs text-white/40">
                    {student.level ?? 'Nível não definido'} · {daysSince !== null ? `${daysSince} dias sem treinar` : 'sem registros'}
                  </p>
                </div>
                <span className="text-[10px] uppercase tracking-wide text-gold-light">Ativo</span>
              </Link>
            )
          })}
        </div>
      </main>
    </div>
  )
}
