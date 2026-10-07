import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { matchesProduct, parseTicto, tictoWebhookKey } from '@/lib/ticto'
import { grantProduct, revokeProduct } from '@/lib/grant'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

// Endereço que vai na Ticto (Tictools → Webhooks): https://SEU-APP/api/webhooks/ticto?key=CHAVE
// A chave aparece pronta no painel do professor, na tela Planilhas.
async function readBody(req: Request): Promise<{ raw: string; data: unknown }> {
  const raw = await req.text()
  try {
    return { raw, data: JSON.parse(raw) }
  } catch {
    // formato de formulário (x-www-form-urlencoded)
    const params = new URLSearchParams(raw)
    const obj: Record<string, string> = {}
    params.forEach((v, k) => (obj[k] = v))
    return { raw, data: obj }
  }
}

async function log(result: string, message: string, payload: unknown) {
  try {
    await prisma.webhookLog.create({
      data: { source: 'ticto', result, message: message.slice(0, 500), payload: (payload ?? {}) as object },
    })
  } catch (err) {
    console.error('[ticto] não consegui guardar o aviso', err)
  }
}

export async function POST(req: Request) {
  const url = new URL(req.url)
  const { raw, data } = await readBody(req)

  const tokenInBody =
    data && typeof data === 'object' ? String((data as Record<string, unknown>).token ?? '') : ''
  const validKey = url.searchParams.get('key') === tictoWebhookKey()
  const validToken = Boolean(process.env.TICTO_TOKEN) && tokenInBody === process.env.TICTO_TOKEN
  if (!validKey && !validToken) {
    return NextResponse.json({ error: 'chave inválida' }, { status: 401 })
  }

  const event = parseTicto(data)
  const products = (await prisma.product.findMany()).filter((p) => matchesProduct(raw, p.tictoCodes))

  if (products.length === 0) {
    await log('ignored', `nenhuma planilha com código que bata com o aviso (status: ${event.statusText || '?'})`, data)
    return NextResponse.json({ ok: true, result: 'ignored', reason: 'produto não cadastrado' })
  }
  if (!event.email) {
    await log('error', 'aviso sem e-mail do comprador', data)
    return NextResponse.json({ ok: true, result: 'error', reason: 'sem e-mail' })
  }

  try {
    if (event.kind === 'approved') {
      const done: string[] = []
      for (const product of products) {
        const r = await grantProduct({
          productId: product.id,
          email: event.email,
          name: event.name,
          phone: event.phone,
          source: 'ticto',
          externalId: event.orderId,
          origin: url.origin,
        })
        done.push(`${product.name}${r.alreadyHad ? ' (já tinha)' : ''}${r.createdAccount ? ' · conta criada' : ''}${r.emailSent ? ' · e-mail enviado' : ''}`)
      }
      await log('processed', `liberado para ${event.email}: ${done.join('; ')}`, data)
      return NextResponse.json({ ok: true, result: 'processed' })
    }

    if (event.kind === 'refunded') {
      const revoked: string[] = []
      for (const product of products) if (await revokeProduct(product.id, event.email, event.orderId)) revoked.push(product.name)
      await log('processed', `acesso retirado de ${event.email} (${event.statusText}): ${revoked.join(', ') || 'nada a retirar'}`, data)
      return NextResponse.json({ ok: true, result: 'processed' })
    }

    await log('ignored', `status sem ação (${event.statusText || 'sem status'}) para ${event.email}`, data)
    return NextResponse.json({ ok: true, result: 'ignored' })
  } catch (err) {
    await log('error', `erro: ${(err as Error).message}`, data)
    return NextResponse.json({ ok: false, result: 'error' }, { status: 500 })
  }
}
