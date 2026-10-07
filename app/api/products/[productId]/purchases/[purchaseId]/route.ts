import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { currentTrainer } from '@/lib/trainer'

export const dynamic = 'force-dynamic'

// Retirar ou devolver o acesso de uma compradora (ex: reembolso feito fora da Ticto)
export async function PATCH(req: Request, { params }: { params: Promise<{ productId: string; purchaseId: string }> }) {
  const trainer = await currentTrainer()
  if (!trainer) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { productId, purchaseId } = await params

  const purchase = await prisma.purchase.findFirst({
    where: { id: purchaseId, productId, product: { trainerId: trainer.id } },
  })
  if (!purchase) return NextResponse.json({ error: 'not found' }, { status: 404 })

  const { status } = await req.json().catch(() => ({}))
  if (!['active', 'refunded'].includes(status)) return NextResponse.json({ error: 'invalid status' }, { status: 400 })

  const updated = await prisma.purchase.update({ where: { id: purchase.id }, data: { status } })
  return NextResponse.json(updated)
}
