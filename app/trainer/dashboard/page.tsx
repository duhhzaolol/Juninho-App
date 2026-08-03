import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Sidebar } from '@/components/trainer/Sidebar'
import { Avatar } from '@/components/ui/Avatar'
import { ActivityRow } from '@/components/student/ActivityRow'
import { Badge } from '@/components/ui/Badge'
import { Users, Dumbbell, MessageCircle, ClipboardList, CreditCard, ListChecks, BookOpen } from 'lucide-react'

export default async function TrainerDashboardPage() {
  const session = await auth()
  const trainer = await prisma.trainerProfile.findUnique({
    where: { userId: session?.user?.id },
    include: {
      user: true,
      students: {
        include: {
          calendarEntries: { orderBy: { date: 'desc' }, take: 1 },
          assignments: { where: { status: 'active' } },
        },
      },
    },
  })

  if (!trainer) return null

  const totalStudents = trainer.students.length
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000)

  const active = trainer.students.filter((s) => s.calendarEntries[0]?.date && s.calendarEntries[0].date > sevenDaysAgo).length
  const inactive = totalStudents - active
  const withoutActiveWorkout = trainer.students.filter((s) => s.assignments.length === 0).length

  return (
    <div className="min-h-screen bg-navy flex flex-col md:flex-row">
      <Sidebar />

      <main className="flex-1 px-6 py-8 max-w-lg">
        <div className="bg-navy-light border border-white/10 rounded-card p-4 mb-6 flex items-center gap-3">
          <Avatar src={trainer.avatarUrl} size="lg" ring />
          <div className="flex-1">
            <p className="font-display font-bold text-lg text-white">{trainer.user.name}</p>
            <p className="text-xs text-white/40 mb-2">
              @{trainer.user.name.toLowerCase().replace(/\s+/g, '')}
            </p>
            <Badge color="gold" label="Professor" />
          </div>
          <Link href="/trainer/perfil" className="text-white/40 text-xs">Editar</Link>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white/5 border border-white/10 rounded-control p-3 text-center">
            <p className="font-display font-bold text-lg text-white">{active}</p>
            <p className="text-[10px] text-white/40">Ativos</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-control p-3 text-center">
            <p className="font-display font-bold text-lg text-white">{inactive}</p>
            <p className="text-[10px] text-white/40">Inativos</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-control p-3 text-center">
            <p className="font-display font-bold text-lg text-white">{withoutActiveWorkout}</p>
            <p className="text-[10px] text-white/40">Sem treino</p>
          </div>
        </div>

        <p className="text-[11px] uppercase tracking-wider text-white/40 mb-2">Menu</p>

        <ActivityRow
          icon={<Users size={20} className="text-white" />}
          iconBg="bg-purple"
          title="Alunos"
          subtitle="Gerencie seus alunos"
          href="/trainer/alunos"
        />
        <ActivityRow
          icon={<Dumbbell size={20} className="text-navy" />}
          iconBg="bg-gold"
          title="Treinos"
          subtitle="Crie e edite treinos"
          href="/trainer/treinos"
        />
        <ActivityRow
          icon={<ListChecks size={20} className="text-white" />}
          iconBg="bg-purple"
          title="Exercícios"
          subtitle="Biblioteca de exercícios"
          href="/trainer/exercicios"
        />
        <ActivityRow
          icon={<BookOpen size={20} className="text-white" />}
          iconBg="bg-purple"
          title="Biblioteca"
          subtitle="Vídeos, PDFs e conteúdos"
          href="/trainer/biblioteca"
        />
        <ActivityRow
          icon={<MessageCircle size={20} className="text-white" />}
          iconBg="bg-purple"
          title="Mensagens"
          subtitle="Comunique-se com alunos"
          href="/trainer/mensagens"
        />
        <ActivityRow
          icon={<ClipboardList size={20} className="text-white" />}
          iconBg="bg-purple"
          title="Relatórios"
          subtitle="Acompanhe resultados"
          href="/trainer/relatorios"
        />
        <ActivityRow
          icon={<CreditCard size={20} className="text-white" />}
          iconBg="bg-purple"
          title="Planos"
          subtitle="Produtos e financeiro"
          href="/trainer/planos"
        />
      </main>
    </div>
  )
}
