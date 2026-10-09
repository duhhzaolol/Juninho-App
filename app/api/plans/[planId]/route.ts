import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { currentTrainer } from '@/lib/trainer'
import { dayToDate, grantPlanProduct, parsePriceCents } from '@/lib/plans'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

// Editar o plano. Se a planilha ligada mudou, quem já tem este plano ativo recebe a planilha.
export async function PATCH(req: Request, { params }: { params: Promise<{ planId: string }> }) {
  const trainer = await currentTrainer()
  if (!trainer) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { planId } = await params

  const plan = await prisma.plan.findFirst({ where: { id: planId, trainerId: trainer.id } })
  if (!plan) return NextResponse.json({ error: 'not found' }, { status: 404 })

  const b = await req.json().catch(() => ({}))
  const name = String(b.name ?? '').trim()
  const priceCents = parsePriceCents(b.priceCents ?? b.price)
  if (!name || priceCents == null) return NextResponse.json({ error: 'missing fields' }, { status: 400 })

  const productId = b.productId ? String(b.productId) : null
  if (productId && !(await prisma.product.findFirst({ where: { id: productId, trainerId: trainer.id } }))) {
    return NextResponse.json({ error: 'product not found' }, { status: 400 })
  }

  const updated = await prisma.plan.update({
    where: { id: plan.id },
    data: {
      name,
      type: String(b.type || plan.type),
      billingType: String(b.billingType || plan.billingType),
      priceCents,
      promoPriceCents: parsePriceCents(b.promoPrice),
      promoStartsAt: dayToDate(b.promoStartsAt),
      promoEndsAt: dayToDate(b.promoEndsAt, true),
      productId,
    },
  })

  let grantedTo = 0
  if (productId && productId !== plan.productId) {
    const subs = await prisma.subscription.findMany({ where: { planId: plan.id, status: 'active' }, select: { studentId: true } })
    if (subs.length > 0) {
      grantedTo = await grantPlanProduct(productId, Array.from(new Set(subs.map((s) => s.studentId))), new URL(req.url).origin)
    }
  }

  return NextResponse.json({ ok: true, plan: updated, grantedTo })
}

// Excluir: sem nenhum aluno registrado, apaga de vez. Com alunos no histórico, o plano só some das listas.
export async function DELETE(req: Request, { params }: { params: Promise<{ planId: string }> }) {
  const trainer = await currentTrainer()
  if (!trainer) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { planId } = await params

  const plan = await prisma.plan.findFirst({
    where: { id: planId, trainerId: trainer.id },
    include: { _count: { select: { subscriptions: true } } },
  })
  if (!plan) return NextResponse.json({ error: 'not found' }, { status: 404 })

  if (plan._count.subscriptions === 0) {
    await prisma.plan.delete({ where: { id: plan.id } })
    return NextResponse.json({ ok: true, deleted: true })
  }
  await prisma.plan.update({ where: { id: plan.id }, data: { archivedAt: new Date() } })
  return NextResponse.json({ ok: true, archived: true })
}
