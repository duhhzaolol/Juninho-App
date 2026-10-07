import { NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { findPasswordToken } from '@/lib/tokens'

export const dynamic = 'force-dynamic'

// Cria a senha a partir do link (convite da consultoria, compra na Ticto ou "esqueci minha senha")
export async function POST(req: Request) {
  const { token, password } = await req.json().catch(() => ({}))
  if (typeof password !== 'string' || password.length < 6) {
    return NextResponse.json({ error: 'short' }, { status: 400 })
  }

  const row = await findPasswordToken(String(token ?? ''))
  if (!row) return NextResponse.json({ error: 'invalid' }, { status: 400 })

  await prisma.user.update({
    where: { id: row.userId },
    data: { passwordHash: await hash(password, 10), emailVerifiedAt: row.user.emailVerifiedAt ?? new Date() },
  })
  // o link só vale uma vez; links antigos da mesma pessoa também deixam de valer
  await prisma.authToken.updateMany({
    where: { userId: row.userId, purpose: 'SET_PASSWORD', usedAt: null },
    data: { usedAt: new Date() },
  })

  return NextResponse.json({ ok: true, email: row.user.email })
}
