import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { currentTrainer, whatsappLink } from '@/lib/trainer'
import { grantProduct } from '@/lib/grant'

export const dynamic = 'force-dynamic'

// "Liberar manualmente": dá acesso à planilha para um e-mail (ex: quem comprou o PDF antes do app)
export async function POST(req: Request, { params }: { params: Promise<{ productId: string }> }) {
  const trainer = await currentTrainer()
  if (!trainer) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { productId } = await params

  const product = await prisma.product.findFirst({ where: { id: productId, trainerId: trainer.id } })
  if (!product) return NextResponse.json({ error: 'not found' }, { status: 404 })

  const { email, name, phone } = await req.json().catch(() => ({}))
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim())) {
    return NextResponse.json({ error: 'invalid email' }, { status: 400 })
  }

  try {
    const r = await grantProduct({
      productId: product.id,
      email: String(email),
      name: name ? String(name) : null,
      phone: phone ? String(phone).replace(/\D/g, '') : null,
      source: 'manual',
      origin: new URL(req.url).origin,
    })
    const text = r.accessLink
      ? `Oi! Seu acesso à planilha ${product.name} está liberado no app. Crie sua senha por este link: ${r.accessLink}`
      : `Oi! A planilha ${product.name} já está liberada no seu app: ${new URL(req.url).origin}/app`
    return NextResponse.json({
      ok: true,
      alreadyHad: r.alreadyHad,
      createdAccount: r.createdAccount,
      emailSent: r.emailSent,
      accessLink: r.accessLink,
      whatsapp: whatsappLink(phone ?? r.user.studentProfile?.whatsapp, text),
    })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 })
  }
}
