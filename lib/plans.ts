// Planos (o que o Juninho vende e registra para cada aluno): preço, promoção e planilha ligada.
import { prisma } from '@/lib/prisma'
import { grantProduct } from '@/lib/grant'

export const PLAN_TYPES: Record<string, string> = {
  PLANILHA: 'Planilha',
  CONSULTORIA: 'Consultoria',
  PROGRAMA: 'Programa',
  CURSO: 'Curso',
}

export const BILLING_LABELS: Record<string, string> = {
  RECORRENTE: 'Recorrente (mensal)',
  UNICA: 'Compra única',
  INFLUENCER: 'Parceria com influencer',
}

type PromoPlan = { priceCents: number; promoPriceCents: number | null; promoStartsAt: Date | null; promoEndsAt: Date | null }

// Promoção valendo agora? Sem datas, vale sempre.
export function promoActive(plan: PromoPlan, now = new Date()) {
  if (plan.promoPriceCents == null) return false
  if (plan.promoStartsAt && plan.promoStartsAt > now) return false
  if (plan.promoEndsAt && plan.promoEndsAt < now) return false
  return true
}

// Preço que vale hoje (o da promoção, se estiver valendo)
export function effectivePriceCents(plan: PromoPlan, now = new Date()) {
  return promoActive(plan, now) ? plan.promoPriceCents! : plan.priceCents
}

// "2026-10-09" -> início ou fim do dia no horário de Brasília
export function dayToDate(day: string | null | undefined, end = false) {
  if (!day || !/^\d{4}-\d{2}-\d{2}$/.test(day)) return null
  return new Date(`${day}T${end ? '23:59:59.999' : '00:00:00'}-03:00`)
}

export function dateToDay(date: Date | null | undefined) {
  if (!date) return ''
  return new Date(date.getTime() - 3 * 3600000).toISOString().slice(0, 10)
}

export function parsePriceCents(value: unknown) {
  if (typeof value === 'number') return Number.isFinite(value) ? Math.round(value) : null
  const s = String(value ?? '').trim().replace(/\s|R\$/g, '').replace(/\.(?=\d{3}(\D|$))/g, '').replace(',', '.')
  if (!s) return null
  const n = Number(s)
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) : null
}

// Libera a planilha do plano para alunos (ao registrar o plano, ou para quem já tinha o plano)
export async function grantPlanProduct(productId: string, studentIds: string[], origin: string) {
  const students = await prisma.studentProfile.findMany({ where: { id: { in: studentIds } }, include: { user: true } })
  let granted = 0
  for (const s of students) {
    try {
      const r = await grantProduct({
        productId,
        email: s.user.email,
        name: s.user.name,
        phone: s.whatsapp,
        source: 'manual',
        origin,
      })
      if (!r.alreadyHad) granted++
    } catch (err) {
      console.error('[planos] não deu para liberar a planilha para', s.user.email, err)
    }
  }
  return granted
}
