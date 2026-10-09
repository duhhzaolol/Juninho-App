import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { currentTrainer } from '@/lib/trainer'
import { Sidebar } from '@/components/trainer/Sidebar'
import { PlanEditor } from '@/components/trainer/PlanEditor'

export const dynamic = 'force-dynamic'

export default async function NewPlanPage() {
  const trainer = await currentTrainer()
  if (!trainer) redirect('/app/login')

  const products = await prisma.product.findMany({
    where: { trainerId: trainer.id },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  })

  return (
    <div className="min-h-screen bg-navy flex flex-col md:flex-row">
      <Sidebar />

      <main className="flex-1 px-6 py-8 max-w-md">
        <Link href="/app/trainer/planos" className="text-white/50 flex items-center gap-1 text-sm mb-4">
          <ChevronLeft size={18} /> Planos
        </Link>
        <p className="font-display font-bold text-xl text-white mb-6">Novo plano</p>
        <PlanEditor
          plan={{
            id: null,
            name: '',
            type: 'PLANILHA',
            billingType: '',
            price: '',
            promoPrice: '',
            promoStartsAt: '',
            promoEndsAt: '',
            productId: '',
            subscribers: 0,
          }}
          products={products}
        />
      </main>
    </div>
  )
}
