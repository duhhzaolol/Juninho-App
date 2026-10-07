import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hash } from 'bcryptjs'
import { createEmailCode, normalizeEmail } from '@/lib/tokens'
import { emailEnabled, emailTemplates, sendEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'

// Cadastro pelo app: a pessoa entra direto na loja de planilhas depois de confirmar o e-mail com um código.
// (A consultoria é por convite do professor, pela área do professor.)
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const name = String(body.name ?? '').trim()
  const email = normalizeEmail(String(body.email ?? ''))
  const password = String(body.password ?? '')
  const whatsapp = String(body.whatsapp ?? '').replace(/\D/g, '')

  if (!name || !email || password.length < 6) {
    return NextResponse.json({ error: 'missing fields' }, { status: 400 })
  }

  const trainer = await prisma.trainerProfile.findFirst()
  if (!trainer) return NextResponse.json({ error: 'no trainer available' }, { status: 500 })

  const passwordHash = await hash(password, 10)
  const useCode = emailEnabled()

  let user = await prisma.user.findFirst({
    where: { email: { equals: email, mode: 'insensitive' } },
    include: { studentProfile: true },
  })

  if (user) {
    // Conta que ainda não foi ativada (ex: criada pela compra na Ticto): quem provar o e-mail assume a conta
    if (user.role !== 'STUDENT' || user.emailVerifiedAt) {
      return NextResponse.json({ error: 'email_in_use' }, { status: 409 })
    }
    user = await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, emailVerifiedAt: useCode ? null : new Date() },
      include: { studentProfile: true },
    })
    if (user.studentProfile && whatsapp && !user.studentProfile.whatsapp) {
      await prisma.studentProfile.update({ where: { id: user.studentProfile.id }, data: { whatsapp } })
    }
  } else {
    user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: 'STUDENT',
        emailVerifiedAt: useCode ? null : new Date(),
        studentProfile: { create: { trainerId: trainer.id, whatsapp: whatsapp || null, status: 'active' } },
      },
      include: { studentProfile: true },
    })
  }

  if (!useCode) return NextResponse.json({ ok: true, needsCode: false })

  const code = await createEmailCode(user.id)
  const t = emailTemplates.code(user.name, code)
  const sent = await sendEmail(email, t.subject, t.html)
  if (!sent) {
    // não deu para enviar o e-mail: libera sem código para a pessoa não ficar presa
    await prisma.user.update({ where: { id: user.id }, data: { emailVerifiedAt: new Date() } })
    return NextResponse.json({ ok: true, needsCode: false })
  }
  return NextResponse.json({ ok: true, needsCode: true })
}
