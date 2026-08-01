import Link from 'next/link'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Sidebar } from '@/components/trainer/Sidebar'
import { Badge } from '@/components/ui/Badge'

const typeLabels: Record<string, string> = {
  PLANILHA: 'Planilha',
  CONSULTORIA: 'Consultoria',
  PROGRAMA: 'Programa',
  CURSO: 'Curso',
}

export default async function PlansPage() {
  const session = await auth()
  const trainer = await prisma.trainerProfile.findUnique({ where: { userId: session?.user?.id } })
  if (!trainer) return null

  const plans = await prisma.plan.findMany({
    where: { trainerId: trainer.id },
    include: { _count: { select: { subscriptions: true } } },
  })

  return (
    <div className="min-h-screen bg-navy flex flex-col md:flex-row">
      <Sidebar />

      <main className="flex-1 px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <p className="font-display font-bold text-xl text-white">Planos</p>
          <Link href="/trainer/planos/novo" className="text-gold-light text-sm">+ Novo plano</Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {plans.map((plan) => (
            <div key={plan.id} className="bg-navy-light border border-white/10 rounded-control p-4">
              <div className="flex items-center justify-between mb-2">
                <Badge color="purple" label={typeLabels[plan.type] ?? plan.type} />
                <span className="text-xs text-white/40">{plan._count.subscriptions} alunos</span>
              </div>
              <p className="text-sm text-white mb-1">{plan.name}</p>
              <p className="font-display font-bold text-gold-light">
                {(plan.priceCents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            </div>
          ))}
        </div>

        {plans.length === 0 && <p className="text-white/40 text-sm">Nenhum plano cadastrado ainda.</p>}
      </main>
    </div>
  )
}
