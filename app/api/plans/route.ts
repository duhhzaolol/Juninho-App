import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { dayToDate, effectivePriceCents, parsePriceCents, promoActive } from '@/lib/plans'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const trainer = await prisma.trainerProfile.findUnique({ where: { userId: session.user.id } })
  if (!trainer) return NextResponse.json({ error: 'not a trainer' }, { status: 403 })

  const plans = await prisma.plan.findMany({
    where: { trainerId: trainer.id, archivedAt: null },
    include: { _count: { select: { subscriptions: true } }, product: { select: { id: true, name: true } } },
    orderBy: { name: 'asc' },
  })

  return NextResponse.json(
    plans.map((p) => ({ ...p, promoActive: promoActive(p), effectivePriceCents: effectivePriceCents(p) }))
  )
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const trainer = await prisma.trainerProfile.findUnique({ where: { userId: session.user.id } })
  if (!trainer) return NextResponse.json({ error: 'not a trainer' }, { status: 403 })

  const b = await req.json().catch(() => ({}))
  const name = String(b.name ?? '').trim()
  const priceCents = parsePriceCents(b.priceCents ?? b.price)
  if (!name || priceCents == null) return NextResponse.json({ error: 'missing fields' }, { status: 400 })

  const productId = b.productId ? String(b.productId) : null
  if (productId && !(await prisma.product.findFirst({ where: { id: productId, trainerId: trainer.id } }))) {
    return NextResponse.json({ error: 'product not found' }, { status: 400 })
  }

  const plan = await prisma.plan.create({
    data: {
      trainerId: trainer.id,
      type: String(b.type || 'PLANILHA'),
      billingType: String(b.billingType || 'UNICA'),
      name,
      priceCents,
      promoPriceCents: parsePriceCents(b.promoPrice),
      promoStartsAt: dayToDate(b.promoStartsAt),
      promoEndsAt: dayToDate(b.promoEndsAt, true),
      productId,
    },
  })

  return NextResponse.json(plan)
}
