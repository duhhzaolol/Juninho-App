import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { currentTrainer, whatsappLink } from '@/lib/trainer'
import { grantProduct } from '@/lib/grant'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

// Roda várias liberações ao mesmo tempo, poucas por vez
async function mapLimit<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length)
  let next = 0
  async function worker() {
    while (next < items.length) {
      const i = next++
      out[i] = await fn(items[i])
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker))
  return out
}

// "Liberar acesso" do painel. Duas formas:
// - { studentIds: [...] }: alunos que já estão no app (sorteio, presente, comprou por fora)
// - { email, name, phone }: alguém que ainda não tem conta (ex: comprou o PDF antes do app)
export async function POST(req: Request, { params }: { params: Promise<{ productId: string }> }) {
  const trainer = await currentTrainer()
  if (!trainer) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { productId } = await params

  const product = await prisma.product.findFirst({ where: { id: productId, trainerId: trainer.id } })
  if (!product) return NextResponse.json({ error: 'not found' }, { status: 404 })

  const body = await req.json().catch(() => ({}))
  const origin = new URL(req.url).origin

  // ---------- alunos escolhidos na lista ----------
  if (Array.isArray(body.studentIds)) {
    const ids = body.studentIds.map(String).slice(0, 300)
    if (ids.length === 0) return NextResponse.json({ error: 'no students' }, { status: 400 })
    const students = await prisma.studentProfile.findMany({
      where: { id: { in: ids }, trainerId: trainer.id },
      include: { user: true },
    })

    const results = await mapLimit(students, 5, async (s) => {
      const first = s.user.name.split(' ')[0]
      try {
        const r = await grantProduct({
          productId: product.id,
          email: s.user.email,
          name: s.user.name,
          phone: s.whatsapp,
          source: 'manual',
          origin,
        })
        const text = r.accessLink
          ? `Oi, ${first}! Aqui é o Juninho. A planilha ${product.name} foi liberada para você no app. Crie sua senha por este link: ${r.accessLink}`
          : `Oi, ${first}! Aqui é o Juninho. A planilha ${product.name} foi liberada para você no app: ${origin}/app`
        return {
          studentId: s.id,
          name: s.user.name,
          ok: true,
          alreadyHad: r.alreadyHad,
          accessLink: r.accessLink,
          emailSent: r.emailSent,
          whatsapp: whatsappLink(s.whatsapp, text),
        }
      } catch (err) {
        return { studentId: s.id, name: s.user.name, ok: false, error: (err as Error).message }
      }
    })
    return NextResponse.json({ ok: true, results })
  }

  // ---------- por e-mail ----------
  const { email, name, phone } = body
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
      origin,
    })
    const text = r.accessLink
      ? `Oi! Seu acesso à planilha ${product.name} está liberado no app. Crie sua senha por este link: ${r.accessLink}`
      : `Oi! A planilha ${product.name} já está liberada no seu app: ${origin}/app`
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
