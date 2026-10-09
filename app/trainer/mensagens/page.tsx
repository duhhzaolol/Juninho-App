import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ChevronLeft, MessageCircle } from 'lucide-react'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Sidebar } from '@/components/trainer/Sidebar'
import { ChatThread } from '@/components/shared/ChatThread'
import { ConversationList, PersonAvatar, type Conversation } from '@/components/trainer/ConversationList'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'

// Mensagens do painel, no jeito do WhatsApp: lista de conversas e a conversa aberta.
// No celular aparece uma coisa de cada vez (lista -> conversa, com voltar). No computador, as duas lado a lado.
export default async function TrainerMessagesPage({ searchParams }: { searchParams: Promise<{ to?: string }> }) {
  const { to } = await searchParams
  const session = await auth()
  if (!session?.user?.id) redirect('/app/login')
  const me = session.user.id
  const trainer = await prisma.trainerProfile.findUnique({ where: { userId: me } })
  if (!trainer) redirect('/app/login')

  const [students, lastMessages, unread] = await Promise.all([
    prisma.studentProfile.findMany({
      where: { trainerId: trainer.id },
      select: { id: true, userId: true, status: true, avatarUrl: true, user: { select: { name: true } } },
    }),
    // última mensagem de cada conversa
    prisma.$queryRaw<{ peer: string; content: string; createdAt: Date; senderId: string }[]>`
      SELECT DISTINCT ON (peer) peer, content, "createdAt", "senderId"
      FROM (
        SELECT CASE WHEN "senderId" = ${me} THEN "receiverId" ELSE "senderId" END AS peer, content, "createdAt", "senderId"
        FROM "Message"
        WHERE "senderId" = ${me} OR "receiverId" = ${me}
      ) t
      ORDER BY peer, "createdAt" DESC`,
    prisma.message.groupBy({ by: ['senderId'], where: { receiverId: me, readAt: null }, _count: { _all: true } }),
  ])

  const lastByPeer = new Map(lastMessages.map((m) => [m.peer, m]))
  const unreadByPeer = new Map(unread.map((u) => [u.senderId, u._count._all]))

  const conversations: Conversation[] = students
    .map((s) => {
      const last = lastByPeer.get(s.userId)
      return {
        userId: s.userId,
        studentId: s.id,
        name: s.user.name,
        avatarUrl: s.avatarUrl,
        pending: s.status === 'pending',
        last: last ? { text: last.content, at: new Date(last.createdAt).toISOString(), own: last.senderId === me } : null,
        unread: unreadByPeer.get(s.userId) ?? 0,
      }
    })
    .sort((a, b) => {
      // 1) quem conversou por último primeiro; 2) sem conversa: ativos antes, depois por nome
      if (a.last && b.last) return b.last.at.localeCompare(a.last.at)
      if (a.last) return -1
      if (b.last) return 1
      if (a.pending !== b.pending) return a.pending ? 1 : -1
      return a.name.localeCompare(b.name, 'pt-BR')
    })

  const selected = to ? conversations.find((c) => c.userId === to) ?? null : null

  return (
    <div className="h-[100dvh] bg-navy flex flex-col md:flex-row overflow-hidden">
      <div className="shrink-0 md:overflow-y-auto">
        <Sidebar />
      </div>

      <div className="flex flex-1 min-h-0 min-w-0">
        <aside className={cn('w-full md:w-80 md:shrink-0 md:border-r border-white/10 min-h-0', selected ? 'hidden md:block' : 'block')}>
          <ConversationList conversations={conversations} selectedUserId={selected?.userId} />
        </aside>

        <main className={cn('flex-1 min-w-0 min-h-0 px-4 pb-4', selected ? 'flex flex-col' : 'hidden md:flex md:flex-col')}>
          {selected ? (
            <ChatThread
              key={selected.userId}
              className="h-full"
              currentUserId={me}
              counterpartId={selected.userId}
              counterpartName={selected.name}
              header={
                <div className="flex items-center gap-3 py-3 mb-2 border-b border-white/10 shrink-0">
                  <Link href="/app/trainer/mensagens" className="md:hidden text-white/60 -ml-1 p-1" aria-label="Voltar para as conversas">
                    <ChevronLeft size={22} />
                  </Link>
                  <PersonAvatar name={selected.name} src={selected.avatarUrl} size={40} />
                  <div className="min-w-0 flex-1">
                    <p className="text-white font-semibold truncate">{selected.name}</p>
                    <Link href={`/app/trainer/alunos/${selected.studentId}`} className="text-xs text-gold-light">
                      Ver perfil do aluno
                    </Link>
                  </div>
                </div>
              }
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-white/40">
              <MessageCircle size={40} className="mb-3 text-white/20" />
              <p className="text-sm">Escolha uma conversa ao lado.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
