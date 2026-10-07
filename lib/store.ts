// Regras da loja de planilhas: quando cada semana libera, qual o treino de hoje, quem pode abrir cada treino.
import { prisma } from '@/lib/prisma'

const DAY = 86400000

type UnlockRule = { unlockMode: string; unlockDays: number }

export function startOfDay(d: Date) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

// Data em que a semana N libera para quem comprou em `purchasedAt`
export function weekUnlockDate(rule: UnlockRule, purchasedAt: Date, week: number) {
  const base = startOfDay(purchasedAt).getTime()
  if (week <= 1) return new Date(purchasedAt)
  if (rule.unlockMode === 'ALL_AFTER') return new Date(base + rule.unlockDays * DAY)
  return new Date(base + (week - 1) * rule.unlockDays * DAY)
}

export function isWeekUnlocked(rule: UnlockRule, purchasedAt: Date, week: number, now = new Date()) {
  return weekUnlockDate(rule, purchasedAt, week) <= now
}

export function unlockedWeeks(rule: UnlockRule, purchasedAt: Date, totalWeeks: number, now = new Date()) {
  let n = 0
  for (let w = 1; w <= totalWeeks; w++) if (isWeekUnlocked(rule, purchasedAt, w, now)) n = w
  return n
}

// Semana em que a aluna "deveria" estar, no ritmo de uma semana a cada 7 dias
export function currentWeek(rule: UnlockRule, purchasedAt: Date, totalWeeks: number, now = new Date()) {
  const elapsed = Math.floor((startOfDay(now).getTime() - startOfDay(purchasedAt).getTime()) / DAY)
  const byTime = Math.min(totalWeeks, Math.max(1, Math.floor(elapsed / 7) + 1))
  return Math.max(1, Math.min(byTime, unlockedWeeks(rule, purchasedAt, totalWeeks, now)))
}

export function daysUntil(date: Date, now = new Date()) {
  return Math.max(0, Math.ceil((startOfDay(date).getTime() - startOfDay(now).getTime()) / DAY))
}

export function formatPrice(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

const productInclude = {
  weeks: {
    orderBy: { week: 'asc' as const },
    include: { program: { include: { days: { include: { workout: true }, orderBy: { weekday: 'asc' as const } } } } },
  },
}

// Compras ativas da aluna, com a planilha e as semanas
export async function activePurchases(studentId: string) {
  return prisma.purchase.findMany({
    where: { studentId, status: 'active' },
    include: { product: { include: productInclude } },
    orderBy: { purchasedAt: 'desc' },
  })
}

export type WeekPlanItem = { weekday: number; workoutId: string; name: string; goal: string | null }

export type StudentPlan =
  | { source: 'consultoria'; items: WeekPlanItem[] }
  | {
      source: 'planilha'
      items: WeekPlanItem[]
      product: { name: string; slug: string }
      week: number
      totalWeeks: number
      nextUnlock: Date | null
    }
  | { source: 'none'; items: [] }

// O que a aluna treina nesta semana: consultoria (treino montado pelo professor) tem prioridade;
// senão, a semana atual da planilha comprada mais recente.
export async function getStudentPlan(studentId: string, now = new Date()): Promise<StudentPlan> {
  const assignments = await prisma.workoutAssignment.findMany({
    where: { studentId, status: 'active', weekday: { not: null } },
    include: { workout: true },
  })
  if (assignments.length > 0) {
    return {
      source: 'consultoria',
      items: assignments.map((a) => ({ weekday: a.weekday!, workoutId: a.workoutId, name: a.workout.name, goal: a.workout.goal })),
    }
  }

  const purchases = await activePurchases(studentId)
  const p = purchases.find((x) => x.product.weeks.length > 0)
  if (!p) return { source: 'none', items: [] }

  const total = p.product.weeks.length
  const week = currentWeek(p.product, p.purchasedAt, total, now)
  const pw = p.product.weeks.find((w) => w.week === week) ?? p.product.weeks[0]
  const next = week < total && !isWeekUnlocked(p.product, p.purchasedAt, week + 1, now)
    ? weekUnlockDate(p.product, p.purchasedAt, week + 1)
    : null

  return {
    source: 'planilha',
    items: pw.program.days
      .filter((d) => d.workout)
      .map((d) => ({ weekday: d.weekday, workoutId: d.workoutId!, name: d.workout!.name, goal: d.workout!.goal })),
    product: { name: p.product.name, slug: p.product.slug },
    week,
    totalWeeks: total,
    nextUnlock: next,
  }
}

// A aluna pode abrir este treino? (treino dela na consultoria, ou de uma semana já liberada de planilha comprada)
export async function canAccessWorkout(userId: string, workoutId: string, now = new Date()) {
  const user = await prisma.user.findUnique({ where: { id: userId }, include: { studentProfile: true, trainerProfile: true } })
  if (!user) return false
  if (user.trainerProfile) return true
  const student = user.studentProfile
  if (!student) return false

  const assigned = await prisma.workoutAssignment.findFirst({ where: { studentId: student.id, workoutId } })
  if (assigned) return true

  const inProducts = await prisma.productWeek.findMany({
    where: { program: { days: { some: { workoutId } } } },
    select: { productId: true, week: true },
  })
  if (inProducts.length === 0) {
    // treino que não pertence a nenhuma planilha: libera se já aparece no histórico da aluna
    const history = await prisma.calendarEntry.findFirst({ where: { studentId: student.id, workoutId } })
    return Boolean(history)
  }

  const purchases = await prisma.purchase.findMany({
    where: { studentId: student.id, status: 'active', productId: { in: inProducts.map((x) => x.productId) } },
    include: { product: true },
  })
  return purchases.some((p) =>
    inProducts.some((x) => x.productId === p.productId && isWeekUnlocked(p.product, p.purchasedAt, x.week, now))
  )
}

// Planilhas para mostrar na loja da aluna
export async function storeProducts(studentId: string | null) {
  const products = await prisma.product.findMany({
    where: { status: { in: ['published', 'soon'] } },
    include: { weeks: { select: { week: true } } },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
  })
  const owned = studentId
    ? await prisma.purchase.findMany({ where: { studentId, status: 'active' } })
    : []
  return products.map((p) => {
    const purchase = owned.find((o) => o.productId === p.id) ?? null
    const total = p.weeks.length
    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      category: p.category,
      tagline: p.tagline,
      priceCents: p.priceCents,
      oldPriceCents: p.oldPriceCents,
      status: p.status,
      totalWeeks: total,
      purchase: purchase
        ? {
            purchasedAt: purchase.purchasedAt,
            week: currentWeek(p, purchase.purchasedAt, Math.max(total, 1)),
            unlocked: unlockedWeeks(p, purchase.purchasedAt, total),
          }
        : null,
    }
  })
}
