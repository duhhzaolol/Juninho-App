import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { createEmailCode, normalizeEmail } from '@/lib/tokens'
import { emailEnabled, emailTemplates, sendEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'

// Reenvia o código (no máximo um a cada 60 segundos)
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const session = await auth()
  const user = session?.user?.id
    ? await prisma.user.findUnique({ where: { id: session.user.id } })
    : body.email
      ? await prisma.user.findFirst({ where: { email: { equals: normalizeEmail(String(body.email)), mode: 'insensitive' } } })
      : null

  if (!user || user.emailVerifiedAt) return NextResponse.json({ ok: true })

  if (!emailEnabled()) {
    await prisma.user.update({ where: { id: user.id }, data: { emailVerifiedAt: new Date() } })
    return NextResponse.json({ ok: true, verified: true })
  }

  const last = await prisma.authToken.findFirst({
    where: { userId: user.id, purpose: 'VERIFY_EMAIL' },
    orderBy: { createdAt: 'desc' },
  })
  if (last && Date.now() - last.createdAt.getTime() < 60000) {
    return NextResponse.json({ error: 'wait' }, { status: 429 })
  }

  const code = await createEmailCode(user.id)
  const t = emailTemplates.code(user.name, code)
  await sendEmail(user.email, t.subject, t.html)
  return NextResponse.json({ ok: true })
}
