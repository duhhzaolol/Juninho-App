// Libera uma planilha para um e-mail (usado pela Ticto e pelo botão "Liberar manualmente" do painel).
import { hash } from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { createPasswordLink, normalizeEmail, randomPassword } from '@/lib/tokens'
import { emailTemplates, sendEmail } from '@/lib/email'

export async function grantProduct(opts: {
  productId: string
  email: string
  name?: string | null
  phone?: string | null
  source: 'ticto' | 'manual'
  externalId?: string | null
  origin: string
}) {
  const email = normalizeEmail(opts.email)
  const product = await prisma.product.findUnique({ where: { id: opts.productId } })
  if (!product) throw new Error('planilha não encontrada')

  // 1. Conta da aluna: usa a existente (mesmo e-mail) ou cria uma nova
  let user = await prisma.user.findFirst({
    where: { email: { equals: email, mode: 'insensitive' } },
    include: { studentProfile: true },
  })
  let createdAccount = false
  if (!user) {
    user = await prisma.user.create({
      data: {
        name: opts.name?.trim() || email.split('@')[0],
        email,
        passwordHash: await hash(randomPassword(), 10),
        role: 'STUDENT',
        emailVerifiedAt: null, // confirma quando criar a senha pelo link
        studentProfile: { create: { trainerId: product.trainerId, status: 'active', whatsapp: opts.phone || null } },
      },
      include: { studentProfile: true },
    })
    createdAccount = true
  } else if (!user.studentProfile && user.role === 'STUDENT') {
    await prisma.studentProfile.create({ data: { userId: user.id, trainerId: product.trainerId, status: 'active' } })
    user = await prisma.user.findUniqueOrThrow({ where: { id: user.id }, include: { studentProfile: true } })
  }
  if (!user.studentProfile) throw new Error('este e-mail é de um professor')

  // quem comprou entra direto, mesmo se o cadastro estava aguardando aprovação
  if (user.studentProfile.status === 'pending') {
    await prisma.studentProfile.update({ where: { id: user.studentProfile.id }, data: { status: 'active' } })
  }
  if (opts.phone && !user.studentProfile.whatsapp) {
    await prisma.studentProfile.update({ where: { id: user.studentProfile.id }, data: { whatsapp: opts.phone } })
  }

  // 2. Compra (uma por planilha e e-mail). Recompra depois de reembolso recomeça a contagem das semanas.
  const existing = await prisma.purchase.findUnique({ where: { productId_email: { productId: product.id, email } } })
  let purchase
  if (existing && existing.status === 'active') {
    purchase = await prisma.purchase.update({
      where: { id: existing.id },
      data: { studentId: user.studentProfile.id, externalId: existing.externalId ?? opts.externalId ?? null },
    })
  } else if (existing) {
    purchase = await prisma.purchase.update({
      where: { id: existing.id },
      data: { status: 'active', studentId: user.studentProfile.id, purchasedAt: new Date(), source: opts.source, externalId: opts.externalId ?? null },
    })
  } else {
    purchase = await prisma.purchase.create({
      data: { productId: product.id, email, studentId: user.studentProfile.id, source: opts.source, externalId: opts.externalId ?? null },
    })
  }
  const alreadyHad = existing?.status === 'active'

  // 3. Aviso para a aluna: quem ainda não tem senha recebe o link para criar
  const needsPassword = !user.emailVerifiedAt
  let accessLink: string | null = null
  let emailSent = false
  if (!alreadyHad) {
    if (needsPassword) {
      accessLink = await createPasswordLink(user.id, opts.origin)
      const t = emailTemplates.purchaseNewAccount(user.name, product.name, accessLink)
      emailSent = await sendEmail(email, t.subject, t.html)
    } else {
      const t = emailTemplates.purchaseExisting(user.name, product.name, `${opts.origin}/app`)
      emailSent = await sendEmail(email, t.subject, t.html)
    }
  }

  return { purchase, user, createdAccount, alreadyHad, accessLink, emailSent, needsPassword }
}

export async function revokeProduct(productId: string, email: string, orderId?: string | null) {
  const row = await prisma.purchase.findUnique({ where: { productId_email: { productId, email: normalizeEmail(email) } } })
  if (!row || row.status !== 'active') return false
  // cancelamento de OUTRO pedido (ex: um Pix que expirou) não tira o acesso de quem já pagou
  if (orderId && row.externalId && orderId !== row.externalId) return false
  await prisma.purchase.update({ where: { id: row.id }, data: { status: 'refunded' } })
  return true
}

// Libera sem mandar aviso (quando o aviso já vai junto com outro, ex: o convite da consultoria)
export async function attachPurchase(productId: string, studentId: string, email: string) {
  const e = normalizeEmail(email)
  const existing = await prisma.purchase.findUnique({ where: { productId_email: { productId, email: e } } })
  if (existing?.status === 'active') {
    if (existing.studentId !== studentId) await prisma.purchase.update({ where: { id: existing.id }, data: { studentId } })
    return
  }
  if (existing) {
    await prisma.purchase.update({
      where: { id: existing.id },
      data: { status: 'active', studentId, purchasedAt: new Date(), source: 'manual' },
    })
  } else {
    await prisma.purchase.create({ data: { productId, email: e, studentId, source: 'manual' } })
  }
}
