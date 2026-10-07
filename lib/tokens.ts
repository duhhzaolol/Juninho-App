// Códigos de confirmação de e-mail (6 dígitos) e links para criar senha.
// Guardamos só o "hash" do código/link no banco, nunca o valor em si.
import { createHash, randomBytes, randomInt } from 'crypto'
import { prisma } from '@/lib/prisma'

const sha = (value: string) => createHash('sha256').update(value).digest('hex')

export const normalizeEmail = (email: string) => email.trim().toLowerCase()

// ---------- link para criar senha (convite, compra, esqueci a senha) ----------
export async function createPasswordLink(userId: string, origin: string, days = 7) {
  const token = randomBytes(24).toString('base64url')
  await prisma.authToken.create({
    data: {
      userId,
      purpose: 'SET_PASSWORD',
      tokenHash: sha(`pw:${token}`),
      expiresAt: new Date(Date.now() + days * 86400000),
    },
  })
  return `${origin}/definir-senha?token=${token}`
}

export async function findPasswordToken(token: string) {
  if (!token) return null
  const row = await prisma.authToken.findUnique({ where: { tokenHash: sha(`pw:${token}`) }, include: { user: true } })
  if (!row || row.purpose !== 'SET_PASSWORD' || row.usedAt || row.expiresAt < new Date()) return null
  return row
}

// ---------- código de 6 dígitos para confirmar o e-mail ----------
export async function createEmailCode(userId: string) {
  const code = String(randomInt(0, 1_000_000)).padStart(6, '0')
  // invalida códigos anteriores ainda não usados
  await prisma.authToken.updateMany({
    where: { userId, purpose: 'VERIFY_EMAIL', usedAt: null },
    data: { usedAt: new Date() },
  })
  // o hash leva o id da própria linha, para dois usuários com o mesmo código não colidirem
  const row = await prisma.authToken.create({
    data: {
      userId,
      purpose: 'VERIFY_EMAIL',
      tokenHash: `pending:${randomBytes(16).toString('hex')}`,
      expiresAt: new Date(Date.now() + 30 * 60000),
    },
  })
  await prisma.authToken.update({ where: { id: row.id }, data: { tokenHash: sha(`code:${row.id}:${code}`) } })
  return code
}

export async function checkEmailCode(userId: string, code: string): Promise<'ok' | 'wrong' | 'expired' | 'blocked'> {
  const latest = await prisma.authToken.findFirst({
    where: { userId, purpose: 'VERIFY_EMAIL', usedAt: null },
    orderBy: { createdAt: 'desc' },
  })
  if (!latest || latest.expiresAt < new Date()) return 'expired'
  if (latest.attempts >= 5) return 'blocked'
  if (latest.tokenHash !== sha(`code:${latest.id}:${code.trim()}`)) {
    await prisma.authToken.update({ where: { id: latest.id }, data: { attempts: { increment: 1 } } })
    return 'wrong'
  }
  await prisma.authToken.update({ where: { id: latest.id }, data: { usedAt: new Date() } })
  return 'ok'
}

// Senha aleatória para contas criadas pelo professor ou pela compra (a pessoa define a dela pelo link)
export const randomPassword = () => randomBytes(18).toString('base64url')
