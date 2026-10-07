import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createPasswordLink, normalizeEmail } from '@/lib/tokens'
import { emailEnabled, emailTemplates, sendEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const { email } = await req.json().catch(() => ({}))
  if (!email) return NextResponse.json({ error: 'missing' }, { status: 400 })

  if (!emailEnabled()) {
    const trainer = await prisma.trainerProfile.findFirst({ select: { whatsapp: true } })
    return NextResponse.json({ ok: false, reason: 'no-email', whatsapp: trainer?.whatsapp ?? null })
  }

  const user = await prisma.user.findFirst({ where: { email: { equals: normalizeEmail(String(email)), mode: 'insensitive' } } })
  if (user) {
    const recent = await prisma.authToken.findFirst({
      where: { userId: user.id, purpose: 'SET_PASSWORD', createdAt: { gt: new Date(Date.now() - 60000) } },
    })
    if (!recent) {
      const link = await createPasswordLink(user.id, new URL(req.url).origin, 1)
      const t = emailTemplates.reset(user.name, link)
      await sendEmail(user.email, t.subject, t.html)
    }
  }
  // sempre a mesma resposta, para não revelar quais e-mails têm conta
  return NextResponse.json({ ok: true })
}
