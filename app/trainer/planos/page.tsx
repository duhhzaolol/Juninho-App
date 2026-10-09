import Link from 'next/link'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Sidebar } from '@/components/trainer/Sidebar'
import { Badge } from '@/components/ui/Badge'
import { ChevronRight } from 'lucide-react'
import { effectivePriceCents, promoActive } from '@/lib/plans'

const typeLabels: Record<string, string> = {
  PLANILHA: 'Planilha',
  CONSULTORIA: 'Consultoria',
  PROGRAMA: 'Programa',
  CURSO: 'Curso',
}

const billingLabels: Record<string, string> = {
  RECORRENTE: 'Recorrente',
  UNICA: 'Única',
  INFLUENCER: 'Influencer',
}

const billingColors: Record<string, 'gold' | 'purple'> = {
  RECORRENTE: 'gold',
  UNICA: 'purple',
  INFLUENCER: 'purple',
}

export default async function PlansPage() {
  const session = await auth()
  const trainer = await prisma.trainerProfile.findUnique({ where: { userId: session?.user?.id } })
  if (!trainer) return null

  const plans = await prisma.plan.findMany({
    where: { trainerId: trainer.id, archivedAt: null },
    include: {
      _count: { select: { subscriptions: { where: { status: 'active' } } } },
      product: { select: { name: true } },
    },
    orderBy: { name: 'asc' },
  })

  const activeSubs = await prisma.subscription.findMany({
    where: { status: 'active', student: { trainerId: trainer.id } },
    include: { student: { include: { user: true } }, plan: true },
  })

  const sortedSubs = [...activeSubs].sort((a, b) => {
    const dateA = a.renewsAt ?? a.purchaseDate ?? a.startedAt
    const dateB = b.renewsAt ?? b.purchaseDate ?? b.startedAt
    return dateA.getTime() - dateB.getTime()
  })

  const totalMonthly = activeSubs
    .filter((s) => s.plan.billingType === 'RECORRENTE')
    .reduce((sum, s) => sum + (s.priceCents ?? s.plan.priceCents), 0)

  return (
    <div className="min-h-screen bg-navy flex flex-col md:flex-row">
      <Sidebar />

      <main className="flex-1 px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <p className="font-display font-bold text-xl text-white">Planos</p>
          <Link href="/app/trainer/planos/novo" className="text-gold-light text-sm">+ Novo plano</Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {plans.map((plan) => {
            const promo = promoActive(plan)
            return (
              <Link
                key={plan.id}
                href={`/app/trainer/planos/${plan.id}`}
                className="block bg-navy-light border border-white/10 rounded-control p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <Badge color="purple" label={typeLabels[plan.type] ?? plan.type} />
                  <span className="flex items-center gap-1 text-xs text-white/40">
                    {plan._count.subscriptions} ativo(s) <ChevronRight size={14} />
                  </span>
                </div>
                <p className="text-sm text-white mb-1">{plan.name}</p>
                <p className="mb-2">
                  {promo && (
                    <span className="text-xs text-white/40 line-through mr-2">
                      {(plan.priceCents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  )}
                  <span className="font-display font-bold text-gold-light">
                    {(effectivePriceCents(plan) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                  {promo && <span className="text-[11px] text-green-400 ml-2">promoção</span>}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge color={billingColors[plan.billingType] ?? 'purple'} label={billingLabels[plan.billingType] ?? plan.billingType} />
                  {plan.product && <span className="text-[11px] text-white/50">Libera: {plan.product.name}</span>}
                </div>
              </Link>
            )
          })}
        </div>

        {plans.length === 0 && <p className="text-white/40 text-sm mb-8">Nenhum plano cadastrado ainda.</p>}

        <p className="font-display font-bold text-lg text-white mb-1">Financeiro</p>
        <p className="text-xs text-white/40 mb-4">
          Receita recorrente mensal: <span className="text-gold-light font-semibold">
            {(totalMonthly / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </span>
        </p>

        <div className="flex flex-col gap-2">
          {sortedSubs.map((sub) => {
            const relevantDate = sub.renewsAt ?? sub.purchaseDate
            const isRecorrente = sub.plan.billingType === 'RECORRENTE'
            const overdue = isRecorrente && sub.renewsAt && sub.renewsAt.getTime() < Date.now()
            const dateLabel = isRecorrente ? 'Vence' : sub.plan.billingType === 'INFLUENCER' ? 'Acordo' : 'Comprado'

            return (
              <Link
                key={sub.id}
                href={`/app/trainer/alunos/${sub.studentId}`}
                className="flex items-center justify-between bg-navy-light border border-white/10 rounded-control px-4 py-3"
              >
                <div>
                  <p className="text-sm text-white">{sub.student.user.name}</p>
                  <p className="text-xs text-white/40">
                    {sub.plan.name} · {((sub.priceCents ?? sub.plan.priceCents) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                </div>
                <div className="text-right">
                  <Badge color={billingColors[sub.plan.billingType] ?? 'purple'} label={billingLabels[sub.plan.billingType] ?? sub.plan.billingType} />
                  {relevantDate && (
                    <p className={`text-[11px] mt-1 ${overdue ? 'text-red-400' : 'text-white/40'}`}>
                      {dateLabel} {relevantDate.toLocaleDateString('pt-BR')}
                    </p>
                  )}
                </div>
              </Link>
            )
          })}
        </div>

        {sortedSubs.length === 0 && <p className="text-white/40 text-sm">Nenhuma assinatura ativa ainda.</p>}
      </main>
    </div>
  )
}
