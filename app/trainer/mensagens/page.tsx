import Link from 'next/link'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Sidebar } from '@/components/trainer/Sidebar'
import { ChatThread } from '@/components/shared/ChatThread'

export default async function TrainerMessagesPage({ searchParams }: { searchParams: Promise<{ to?: string }> }) {
  const { to } = await searchParams
  const session = await auth()
  const trainer = await prisma.trainerProfile.findUnique({
    where: { userId: session?.user?.id },
    include: { students: { include: { user: true } } },
  })
  if (!trainer) return null

  const selected = to ? trainer.students.find((s) => s.userId === to) : trainer.students[0]

  return (
    <div className="min-h-screen bg-navy flex flex-col md:flex-row">
      <Sidebar />

      <div className="flex flex-1">
        <aside className="w-64 border-r border-white/10 px-3 py-6 hidden md:block">
          <p className="font-display font-bold text-white px-2 mb-3">Conversas</p>
          {trainer.students.map((s) => (
            <Link
              key={s.id}
              href={`/trainer/mensagens?to=${s.userId}`}
              className={`block px-3 py-2.5 rounded-control text-sm ${selected?.id === s.id ? 'bg-gold/10 text-gold-light' : 'text-white/60'}`}
            >
              {s.user.name}
            </Link>
          ))}
        </aside>

        <main className="flex-1 px-6 py-6">
          {selected ? (
            <ChatThread
              currentUserId={session!.user!.id as string}
              counterpartId={selected.userId}
              counterpartName={selected.user.name}
            />
          ) : (
            <p className="text-white/40 text-sm">Nenhum aluno para conversar ainda.</p>
          )}
        </main>
      </div>
    </div>
  )
}
