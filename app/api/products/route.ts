import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { currentTrainer, slugify } from '@/lib/trainer'

export const dynamic = 'force-dynamic'

// Cria uma planilha nova (começa como rascunho, sem aparecer na loja)
export async function POST(req: Request) {
  const trainer = await currentTrainer()
  if (!trainer) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const name = String(body.name ?? 'Nova planilha').trim() || 'Nova planilha'

  let slug = slugify(name)
  for (let i = 2; await prisma.product.findUnique({ where: { slug } }); i++) slug = `${slugify(name)}-${i}`

  const product = await prisma.product.create({
    data: { trainerId: trainer.id, name, slug, status: 'draft' },
  })
  return NextResponse.json(product)
}
