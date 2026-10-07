import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { checkEmailCode, normalizeEmail } from '@/lib/tokens'

export const dynamic = 'force-dynamic'

// Confere o código de 6 dígitos. Aceita o e-mail no corpo (logo após o cadastro) ou a sessão (tela "Confirmar e-mail").
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const code = String(body.code ?? '').replace(/\D/g, '')
  const session = await auth()

  const user = session?.user?.id
    ? await prisma.user.findUnique({ where: { id: session.user.id } })
    : body.email
      ? await prisma.user.findFirst({ where: { email: { equals: normalizeEmail(String(body.email)), mode: 'insensitive' } } })
      : null

  if (!user) return NextResponse.json({ error: 'not_found' }, { status: 404 })
  if (user.emailVerifiedAt) return NextResponse.json({ ok: true })
  if (code.length !== 6) return NextResponse.json({ error: 'wrong' }, { status: 400 })

  const result = await checkEmailCode(user.id, code)
  if (result !== 'ok') return NextResponse.json({ error: result }, { status: 400 })

  await prisma.user.update({ where: { id: user.id }, data: { emailVerifiedAt: new Date() } })
  return NextResponse.json({ ok: true })
}
