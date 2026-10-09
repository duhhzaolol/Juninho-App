import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { currentTrainer } from '@/lib/trainer'
import { Sidebar } from '@/components/trainer/Sidebar'
import { Badge } from '@/components/ui/Badge'
import { ProductEditor } from '@/components/trainer/ProductEditor'
import { GrantAccess } from '@/components/trainer/GrantAccess'
import { PurchaseStatusButton } from '@/components/trainer/PurchaseStatusButton'
import { currentWeek } from '@/lib/store'

export const dynamic = 'force-dynamic'

export default async function TrainerProductPage({ params }: { params: Promise<{ productId: string }> }) {
  const trainer = await currentTrainer()
  if (!trainer) redirect('/app/login')
  const { productId } = await params

  const product = await prisma.product.findFirst({
    where: { id: productId, trainerId: trainer.id },
    include: {
      weeks: { orderBy: { week: 'asc' } },
      purchases: { include: { student: { include: { user: true } } }, orderBy: { purchasedAt: 'desc' } },
    },
  })
  if (!product) notFound()

  const [programs, students] = await Promise.all([
    prisma.weeklyProgram.findMany({
      where: { trainerId: trainer.id },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
    prisma.studentProfile.findMany({
      where: { trainerId: trainer.id },
      select: { id: true, status: true, user: { select: { name: true, email: true } } },
      orderBy: { user: { name: 'asc' } },
    }),
  ])

  const total = product.weeks.length
  const active = product.purchases.filter((p) => p.status === 'active')
  const owners = new Set(active.map((p) => p.studentId).filter(Boolean))

  return (
    <div className="min-h-screen bg-navy flex flex-col md:flex-row">
      <Sidebar />

      <main className="flex-1 px-6 py-8 max-w-3xl">
        <Link href="/app/trainer/planilhas" className="text-white/50 flex items-center gap-1 text-sm mb-4">
          <ChevronLeft size={18} /> Planilhas
        </Link>

        <ProductEditor
          product={{
            id: product.id,
            name: product.name,
            slug: product.slug,
            category: product.category ?? '',
            tagline: product.tagline ?? '',
            description: product.description ?? '',
            price: (product.priceCents / 100).toFixed(2).replace('.', ','),
            oldPrice: product.oldPriceCents ? (product.oldPriceCents / 100).toFixed(2).replace('.', ',') : '',
            checkoutUrl: product.checkoutUrl ?? '',
            tictoCodes: product.tictoCodes ?? '',
            unlockMode: product.unlockMode,
            unlockDays: product.unlockDays,
            status: product.status,
            sortOrder: product.sortOrder,
            weeks: product.weeks.map((w) => w.programId),
          }}
          programs={programs}
        />

        <div className="bg-navy-light border border-white/10 rounded-card p-5 mt-8 mb-6">
          <p className="font-display font-semibold text-white mb-1">Liberar acesso</p>
          <p className="text-xs text-white/50 mb-4">
            Para sorteio, presente, quem comprou fora do app (ex: o PDF) ou quando um aviso da Ticto não chegou. A semana 1
            libera na hora.
          </p>
          <GrantAccess
            productId={product.id}
            students={students.map((s) => ({
              id: s.id,
              name: s.user.name,
              email: s.user.email,
              pending: s.status === 'pending',
              has: owners.has(s.id),
            }))}
          />
        </div>

        <p className="text-[11px] uppercase tracking-wider text-white/40 mb-2">
          Quem tem acesso · {active.length} ativa(s)
        </p>
        <div className="flex flex-col gap-2">
          {product.purchases.map((p) => (
            <div key={p.id} className="flex items-center justify-between gap-3 bg-navy-light border border-white/10 rounded-control px-4 py-3">
              <div className="min-w-0">
                {p.student ? (
                  <Link href={`/app/trainer/alunos/${p.student.id}`} className="text-sm text-white">{p.student.user.name}</Link>
                ) : (
                  <p className="text-sm text-white">{p.email}</p>
                )}
                <p className="text-xs text-white/40 break-all">
                  {p.email} · {p.source === 'manual' ? 'liberada no painel' : 'Ticto'} em {p.purchasedAt.toLocaleDateString('pt-BR')}
                  {p.status === 'active' && total > 0 && ` · semana ${currentWeek(product, p.purchasedAt, total)} de ${total}`}
                  {p.student && !p.student.user.emailVerifiedAt && ' · ainda não criou a senha'}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <Badge color={p.status === 'active' ? 'green' : 'red'} label={p.status === 'active' ? 'Ativa' : 'Sem acesso'} />
                <PurchaseStatusButton productId={product.id} purchaseId={p.id} status={p.status} />
              </div>
            </div>
          ))}
          {product.purchases.length === 0 && <p className="text-sm text-white/40">Ninguém comprou ainda.</p>}
        </div>
      </main>
    </div>
  )
}
