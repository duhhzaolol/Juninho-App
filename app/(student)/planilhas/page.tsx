import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { storeProducts } from '@/lib/store'
import { StoreCard } from '@/components/student/StoreCard'
import { BottomNav } from '@/components/student/BottomNav'

export const dynamic = 'force-dynamic'

export default async function PlanilhasPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')
  const student = await prisma.studentProfile.findUnique({ where: { userId: session.user.id } })
  if (!student) redirect('/login')

  const items = await storeProducts(student.id)
  const mine = items.filter((i) => i.purchase)
  const forSale = items.filter((i) => !i.purchase && i.status === 'published')
  const soon = items.filter((i) => !i.purchase && i.status === 'soon')

  return (
    <main className="min-h-screen bg-navy pb-28 px-5 pt-8">
      <p className="font-display font-bold text-xl text-white mb-1">Planilhas</p>
      <p className="text-xs text-white/40 mb-6">Seus treinos e os novos lançamentos do Juninho.</p>

      {mine.length > 0 && (
        <section className="mb-6">
          <p className="text-[11px] uppercase tracking-wider text-gold-light mb-2">Seus treinos</p>
          {mine.map((item) => <StoreCard key={item.slug} item={item} />)}
        </section>
      )}

      {forSale.length > 0 && (
        <section className="mb-6">
          <p className="text-[11px] uppercase tracking-wider text-white/40 mb-2">{mine.length > 0 ? 'Para treinar depois' : 'Escolha sua planilha'}</p>
          {forSale.map((item) => <StoreCard key={item.slug} item={item} />)}
        </section>
      )}

      {soon.length > 0 && (
        <section className="mb-6">
          <p className="text-[11px] uppercase tracking-wider text-white/40 mb-2">Próximos lançamentos</p>
          {soon.map((item) => <StoreCard key={item.slug} item={item} />)}
        </section>
      )}

      {items.length === 0 && <p className="text-sm text-white/40">Nenhuma planilha disponível no momento.</p>}

      <BottomNav />
    </main>
  )
}
