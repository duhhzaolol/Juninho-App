import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { currentTrainer } from '@/lib/trainer'
import { Sidebar } from '@/components/trainer/Sidebar'
import { PlanEditor } from '@/components/trainer/PlanEditor'
import { dateToDay } from '@/lib/plans'

export const dynamic = 'force-dynamic'

const money = (cents: number) => (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const price = (cents: number | null) => (cents == null ? '' : (cents / 100).toFixed(2).replace('.', ','))

export default async function PlanPage({ params }: { params: Promise<{ planId: string }> }) {
  const trainer = await currentTrainer()
  if (!trainer) redirect('/app/login')
  const { planId } = await params

  const [plan, products] = await Promise.all([
    prisma.plan.findFirst({
      where: { id: planId, trainerId: trainer.id },
      include: {
        subscriptions: {
          include: { student: { include: { user: { select: { name: true } } } } },
          orderBy: { startedAt: 'desc' },
        },
      },
    }),
    prisma.product.findMany({ where: { trainerId: trainer.id }, select: { id: true, name: true }, orderBy: { name: 'asc' } }),
  ])
  if (!plan) notFound()

  const active = plan.subscriptions.filter((s) => s.status === 'active')

  return (
    <div className="min-h-screen bg-navy flex flex-col md:flex-row">
      <Sidebar />

      <main className="flex-1 px-6 py-8 max-w-md">
        <Link href="/app/trainer/planos" className="text-white/50 flex items-center gap-1 text-sm mb-4">
          <ChevronLeft size={18} /> Planos
        </Link>
        <div className="mb-6">
          <p className="font-display font-bold text-xl text-white">{plan.name}</p>
          {plan.archivedAt && <p className="text-xs text-white/40 mt-1">Este plano foi excluído e não aparece mais nas listas.</p>}
        </div>

        <PlanEditor
          plan={{
            id: plan.id,
            name: plan.name,
            type: plan.type,
            billingType: plan.billingType,
            price: price(plan.priceCents),
            promoPrice: price(plan.promoPriceCents),
            promoStartsAt: dateToDay(plan.promoStartsAt),
            promoEndsAt: dateToDay(plan.promoEndsAt),
            productId: plan.productId ?? '',
            subscribers: plan.subscriptions.length,
          }}
          products={products}
        />

        <p className="text-[11px] uppercase tracking-wider text-white/40 mt-10 mb-2">Alunos com este plano · {active.length} ativo(s)</p>
        <div className="flex flex-col gap-2">
          {plan.subscriptions.map((s) => (
            <Link
              key={s.id}
              href={`/app/trainer/alunos/${s.studentId}`}
              className="flex items-center justify-between gap-3 bg-navy-light border border-white/10 rounded-control px-4 py-3"
            >
              <span className="min-w-0">
                <span className="block text-sm text-white truncate">{s.student.user.name}</span>
                <span className="block text-xs text-white/40">
                  {money(s.priceCents ?? plan.priceCents)} · desde {(s.purchaseDate ?? s.startedAt).toLocaleDateString('pt-BR')}
                </span>
              </span>
              <span className={`text-[11px] shrink-0 ${s.status === 'active' ? 'text-green-400' : 'text-white/40'}`}>
                {s.status === 'active' ? 'Ativo' : 'Encerrado'}
              </span>
            </Link>
          ))}
          {plan.subscriptions.length === 0 && <p className="text-sm text-white/40">Nenhum aluno com este plano ainda.</p>}
        </div>
      </main>
    </div>
  )
}
