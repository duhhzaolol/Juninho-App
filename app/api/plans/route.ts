import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const trainer = await prisma.trainerProfile.findUnique({ where: { userId: session.user.id } })
  if (!trainer) return NextResponse.json({ error: 'not a trainer' }, { status: 403 })

  const plans = await prisma.plan.findMany({
    where: { trainerId: trainer.id },
    include: { _count: { select: { subscriptions: true } } },
  })

  return NextResponse.json(plans)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const trainer = await prisma.trainerProfile.findUnique({ where: { userId: session.user.id } })
  if (!trainer) return NextResponse.json({ error: 'not a trainer' }, { status: 403 })

  const { type, billingType, name, priceCents } = await req.json()

  const plan = await prisma.plan.create({
    data: { trainerId: trainer.id, type, billingType, name, priceCents },
  })

  return NextResponse.json(plan)
}
