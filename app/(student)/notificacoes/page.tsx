import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, MessageCircle, AlertTriangle, Dumbbell } from 'lucide-react'
import { BottomNav } from '@/components/student/BottomNav'

export default async function NotificationsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const student = await prisma.studentProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      trainer: { include: { user: true } },
      subscriptions: { where: { status: 'active' }, take: 1 },
    },
  })
  if (!student) redirect('/login')

  // Mensagens não lidas enviadas PELO professor PRA esse aluno
  const messagesFromTrainer = await prisma.message.findMany({
    where: { senderId: student.trainer.userId, receiverId: session.user.id, readAt: null },
    orderBy: { createdAt: 'desc' },
  })

  const activeSub = student.subscriptions[0]
  const overdueDays = activeSub?.renewsAt && activeSub.renewsAt.getTime() < Date.now()
    ? Math.ceil((Date.now() - activeSub.renewsAt.getTime()) / 86400000)
    : null

  const hasNotifications = messagesFromTrainer.length > 0 || overdueDays !== null

  return (
    <main className="min-h-screen bg-navy pb-28 px-5 pt-8">
      <Link href="/dashboard" className="text-white/50 flex items-center gap-1 text-sm mb-6">
        <ChevronLeft size={18} /> Início
      </Link>

      <p className="font-display font-bold text-xl text-white mb-6">Notificações</p>

      <div className="flex flex-col gap-2">
        {overdueDays !== null && (
          <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-control px-4 py-3">
            <AlertTriangle size={18} className="text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-white">Mensalidade vencida</p>
              <p className="text-xs text-white/50">Venceu há {overdueDays} dia{overdueDays === 1 ? '' : 's'} — fale com seu professor.</p>
            </div>
          </div>
        )}

        {messagesFromTrainer.map((msg) => (
          <Link
            key={msg.id}
            href="/mensagens"
            className="flex items-start gap-3 bg-navy-light border border-white/10 rounded-control px-4 py-3"
          >
            <MessageCircle size={18} className="text-purple-light shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white">{student.trainer.user.name}</p>
              <p className="text-xs text-white/50 truncate">{msg.content}</p>
            </div>
          </Link>
        ))}
      </div>

      {!hasNotifications && (
        <div className="flex flex-col items-center text-center mt-16">
          <Dumbbell size={32} className="text-white/20 mb-3" />
          <p className="text-white/40 text-sm">Nenhuma notificação por enquanto.</p>
        </div>
      )}

      <BottomNav />
    </main>
  )
}
