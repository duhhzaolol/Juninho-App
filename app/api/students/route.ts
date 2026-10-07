import { NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { currentTrainer, whatsappLink } from '@/lib/trainer'
import { createPasswordLink, normalizeEmail, randomPassword } from '@/lib/tokens'
import { emailTemplates, sendEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'

// Novo aluno da consultoria: o professor cadastra, registra o plano e manda o link para o aluno criar a senha.
// Se o e-mail já tem conta (ex: comprou uma planilha), a conta vira consultoria sem perder nada.
export async function POST(req: Request) {
  const trainer = await currentTrainer()
  if (!trainer) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const b = await req.json().catch(() => ({}))
  const name = String(b.name ?? '').trim()
  const email = normalizeEmail(String(b.email ?? ''))
  if (!name || !email) return NextResponse.json({ error: 'missing fields' }, { status: 400 })

  const whatsapp = String(b.whatsapp ?? '').replace(/\D/g, '') || null
  const profileData = {
    goal: b.goal || null,
    weightKg: b.weightKg || null,
    heightCm: b.heightCm || null,
    age: b.age || null,
    level: b.level || null,
    workoutDueAt: Number(b.workoutDays) > 0 ? new Date(Date.now() + Number(b.workoutDays) * 86400000) : null,
  }

  let user = await prisma.user.findFirst({
    where: { email: { equals: email, mode: 'insensitive' } },
    include: { studentProfile: true },
  })
  let converted = false

  if (user) {
    if (user.role !== 'STUDENT' || (user.studentProfile && user.studentProfile.trainerId !== trainer.id)) {
      return NextResponse.json({ error: 'email_in_use' }, { status: 409 })
    }
    if (user.studentProfile) {
      await prisma.studentProfile.update({
        where: { id: user.studentProfile.id },
        data: { ...profileData, status: 'active', whatsapp: whatsapp ?? user.studentProfile.whatsapp },
      })
    } else {
      await prisma.studentProfile.create({ data: { userId: user.id, trainerId: trainer.id, whatsapp, status: 'active', ...profileData } })
    }
    converted = true
  } else {
    user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: await hash(randomPassword(), 10),
        role: 'STUDENT',
        emailVerifiedAt: null, // confirma quando o aluno criar a senha pelo link
        studentProfile: { create: { trainerId: trainer.id, whatsapp, status: 'active', ...profileData } },
      },
      include: { studentProfile: true },
    })
  }

  const student = await prisma.studentProfile.findUniqueOrThrow({ where: { userId: user.id } })

  // Plano da consultoria (opcional)
  if (b.planId) {
    const plan = await prisma.plan.findFirst({ where: { id: String(b.planId), trainerId: trainer.id } })
    if (plan) {
      const periodDays = Number(b.periodDays) > 0 ? Number(b.periodDays) : null
      const renewsAt = b.renewsAt ? new Date(b.renewsAt) : periodDays ? new Date(Date.now() + periodDays * 86400000) : null
      await prisma.subscription.updateMany({ where: { studentId: student.id, status: 'active' }, data: { status: 'expired' } })
      await prisma.subscription.create({
        data: {
          studentId: student.id,
          planId: plan.id,
          priceCents: Number.isFinite(Number(b.priceCents)) && Number(b.priceCents) > 0 ? Number(b.priceCents) : plan.priceCents,
          periodDays,
          renewsAt,
          purchaseDate: new Date(),
          status: 'active',
        },
      })
    }
  }

  // Link para criar a senha (quem já tem senha não precisa)
  const origin = new URL(req.url).origin
  const needsPassword = !user.emailVerifiedAt
  const link = needsPassword ? await createPasswordLink(user.id, origin) : null
  let emailSent = false
  if (link && b.sendByEmail) {
    const t = emailTemplates.invite(name, link)
    emailSent = await sendEmail(email, t.subject, t.html)
  }

  const first = name.split(' ')[0]
  const text = link
    ? `Oi, ${first}! Aqui é o Juninho. Bem-vindo à consultoria! Crie sua senha no app por este link (vale 7 dias): ${link}`
    : `Oi, ${first}! Aqui é o Juninho. Sua consultoria já está ativa no app: ${origin}/app`

  return NextResponse.json({
    studentId: student.id,
    converted,
    link,
    emailSent,
    whatsapp: whatsappLink(whatsapp, text),
  })
}
