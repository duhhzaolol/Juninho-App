import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { currentTrainer, slugify } from '@/lib/trainer'

export const dynamic = 'force-dynamic'

const STATUSES = ['draft', 'soon', 'published']
const MODES = ['WEEKLY', 'ALL_AFTER']

// Salva os dados da planilha e a lista de semanas
export async function PATCH(req: Request, { params }: { params: Promise<{ productId: string }> }) {
  const trainer = await currentTrainer()
  if (!trainer) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { productId } = await params

  const product = await prisma.product.findFirst({ where: { id: productId, trainerId: trainer.id } })
  if (!product) return NextResponse.json({ error: 'not found' }, { status: 404 })

  const b = await req.json().catch(() => ({}))
  const toCents = (v: unknown) => {
    const n = Math.round(Number(String(v ?? '').replace(',', '.')) * 100)
    return Number.isFinite(n) && n >= 0 ? n : null
  }

  let slug = b.slug ? slugify(String(b.slug)) : product.slug
  if (slug !== product.slug && (await prisma.product.findUnique({ where: { slug } }))) {
    return NextResponse.json({ error: 'slug_in_use' }, { status: 409 })
  }

  const weeks: { week: number; programId: string }[] = Array.isArray(b.weeks)
    ? b.weeks.filter((w: any) => w && w.programId).map((w: any, i: number) => ({ week: i + 1, programId: String(w.programId) }))
    : []
  if (weeks.length > 0) {
    const owned = await prisma.weeklyProgram.count({ where: { trainerId: trainer.id, id: { in: weeks.map((w) => w.programId) } } })
    if (owned !== new Set(weeks.map((w) => w.programId)).size) return NextResponse.json({ error: 'invalid program' }, { status: 400 })
  }

  const status = STATUSES.includes(b.status) ? b.status : product.status
  if (status === 'published' && (weeks.length === 0 || !String(b.checkoutUrl ?? '').trim())) {
    return NextResponse.json({ error: 'publish_requirements' }, { status: 400 })
  }

  const updated = await prisma.$transaction(async (tx) => {
    const p = await tx.product.update({
      where: { id: product.id },
      data: {
        name: String(b.name ?? product.name).trim() || product.name,
        slug,
        category: String(b.category ?? '').trim() || null,
        tagline: String(b.tagline ?? '').trim() || null,
        description: String(b.description ?? '').trim() || null,
        priceCents: toCents(b.price) ?? product.priceCents,
        oldPriceCents: String(b.oldPrice ?? '').trim() ? toCents(b.oldPrice) : null,
        checkoutUrl: String(b.checkoutUrl ?? '').trim() || null,
        tictoCodes: String(b.tictoCodes ?? '').trim() || null,
        unlockMode: MODES.includes(b.unlockMode) ? b.unlockMode : product.unlockMode,
        unlockDays: Math.min(60, Math.max(0, Number(b.unlockDays) || product.unlockDays)),
        status,
        sortOrder: Number.isFinite(Number(b.sortOrder)) ? Number(b.sortOrder) : product.sortOrder,
      },
    })
    await tx.productWeek.deleteMany({ where: { productId: product.id } })
    if (weeks.length > 0) await tx.productWeek.createMany({ data: weeks.map((w) => ({ ...w, productId: product.id })) })
    return p
  })

  return NextResponse.json(updated)
}
