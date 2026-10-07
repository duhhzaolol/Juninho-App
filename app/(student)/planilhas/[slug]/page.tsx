import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ChevronLeft, ChevronRight, Check, Lock, ShieldCheck } from 'lucide-react'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { BottomNav } from '@/components/student/BottomNav'
import { currentWeek, daysUntil, formatPrice, isWeekUnlocked, weekUnlockDate } from '@/lib/store'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'

const DAY_LABEL = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB']

// Nome curto do treino dentro da planilha: "Glúteos 3D · S1 · Glúteo e posterior" -> "Glúteo e posterior"
function shortName(name: string) {
  const parts = name.split(' · ')
  return parts.length >= 3 ? parts.slice(2).join(' · ') : name
}

export default async function PlanilhaPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ semana?: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) redirect('/app/login')
  const { slug } = await params
  const { semana } = await searchParams

  const [student, product] = await Promise.all([
    prisma.studentProfile.findUnique({ where: { userId: session.user.id }, include: { user: true } }),
    prisma.product.findUnique({
      where: { slug },
      include: {
        weeks: {
          orderBy: { week: 'asc' },
          include: { program: { include: { days: { include: { workout: true }, orderBy: { weekday: 'asc' } } } } },
        },
      },
    }),
  ])
  if (!student) redirect('/app/login')
  if (!product || product.status === 'draft') notFound()

  const purchase = await prisma.purchase.findFirst({ where: { productId: product.id, studentId: student.id, status: 'active' } })
  const total = product.weeks.length
  const week1 = product.weeks[0]

  // ---------------- ainda não comprou ----------------
  if (!purchase) {
    const checkout = product.checkoutUrl
      ? `${product.checkoutUrl}${product.checkoutUrl.includes('?') ? '&' : '?'}email=${encodeURIComponent(student.user.email)}`
      : null
    return (
      <main className="min-h-screen bg-navy pb-48 px-5 pt-6">
        <Link href="/app/planilhas" className="flex items-center gap-1 text-xs text-white/50 mb-4"><ChevronLeft size={14} /> Planilhas</Link>

        <div className="relative overflow-hidden rounded-card p-5 mb-5 bg-gradient-to-br from-purple-dark via-purple to-navy-light border border-white/10">
          <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full bg-white/5" />
          <p className="relative text-[11px] uppercase tracking-wider text-gold-light mb-1">Método Juninho Moro</p>
          <p className="relative font-display font-extrabold text-3xl text-white leading-none mb-2">{product.name}</p>
          {product.tagline && <p className="relative text-xs text-white/70">{product.tagline}</p>}
        </div>

        {total > 0 && (
          <div className="grid grid-cols-3 gap-2 mb-5">
            {[
              [String(total), 'semanas'],
              [String(product.weeks.reduce((n, w) => n + w.program.days.filter((d) => d.workoutId).length, 0)), 'treinos'],
              [`${week1?.program.days.filter((d) => d.workoutId).length ?? 0}x`, 'por semana'],
            ].map(([n, l]) => (
              <div key={l} className="bg-navy-light border border-white/10 rounded-control py-3 text-center">
                <p className="font-display font-bold text-lg text-white leading-none">{n}</p>
                <p className="text-[10px] text-white/40 mt-1">{l}</p>
              </div>
            ))}
          </div>
        )}

        {product.description && <p className="text-sm text-white/70 mb-5 whitespace-pre-line">{product.description}</p>}

        {week1 && (
          <>
            <p className="text-[11px] uppercase tracking-wider text-white/40 mb-2">Prévia da semana 1</p>
            <div className="bg-navy-light border border-white/10 rounded-control px-4 py-1 mb-5">
              {week1.program.days.filter((d) => d.workout).map((d) => (
                <div key={d.id} className="flex items-center gap-3 py-2.5 border-b border-white/5 last:border-0">
                  <span className="text-[11px] font-display font-bold text-gold-light w-8">{DAY_LABEL[d.weekday]}</span>
                  <span className="text-sm text-white/80 flex-1">{shortName(d.workout!.name)}</span>
                  <Lock size={13} className="text-white/25" />
                </div>
              ))}
            </div>
          </>
        )}

        <div className="fixed left-0 right-0 bottom-[68px] bg-navy/95 backdrop-blur border-t border-white/10 px-5 py-3">
          {product.status === 'soon' || !checkout ? (
            <p className="text-center text-sm text-white/60 py-2">Em breve no app.</p>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <div>
                  {product.oldPriceCents ? <p className="text-[11px] text-white/40 line-through leading-none">{formatPrice(product.oldPriceCents)}</p> : null}
                  <p className="font-display font-bold text-xl text-gold-light leading-tight">{formatPrice(product.priceCents)}</p>
                </div>
                <a
                  href={checkout}
                  className="flex-1 text-center font-display font-semibold text-sm bg-gradient-to-br from-gold-light to-gold text-navy py-3 rounded-control shadow-[0_0_24px_-4px_rgba(245,179,0,0.55)]"
                >
                  Comprar planilha
                </a>
              </div>
              <p className="flex items-center justify-center gap-1 text-[10px] text-white/40 mt-2">
                <ShieldCheck size={12} /> Use o e-mail {student.user.email} na compra. Libera sozinho no app.
              </p>
            </>
          )}
        </div>

        <BottomNav />
      </main>
    )
  }

  // ---------------- já comprou ----------------
  const now = new Date()
  const current = currentWeek(product, purchase.purchasedAt, total, now)
  const selected = Math.min(Math.max(Number(semana) || current, 1), total)
  const selectedWeek = product.weeks.find((w) => w.week === selected)
  const selectedOpen = isWeekUnlocked(product, purchase.purchasedAt, selected, now)

  const trained = await prisma.calendarEntry.findMany({
    where: {
      studentId: student.id,
      status: 'TRAINED',
      workoutId: { in: product.weeks.flatMap((w) => w.program.days.map((d) => d.workoutId).filter(Boolean) as string[]) },
    },
    select: { workoutId: true },
  })
  const done = new Set(trained.map((t) => t.workoutId))

  return (
    <main className="min-h-screen bg-navy pb-28 px-5 pt-6">
      <Link href="/app/planilhas" className="flex items-center gap-1 text-xs text-white/50 mb-4"><ChevronLeft size={14} /> Planilhas</Link>

      <div className="flex items-center justify-between mb-1 gap-2">
        <p className="font-display font-bold text-2xl text-white">{product.name}</p>
        <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide bg-green-500/15 text-green-400 shrink-0">Liberada</span>
      </div>
      <p className="text-xs text-white/40 mb-4">
        Comprada em {purchase.purchasedAt.toLocaleDateString('pt-BR')} · você está na semana {current} de {total}
      </p>
      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden mb-6">
        <div className="h-full bg-gradient-to-r from-purple-light to-gold" style={{ width: `${Math.round((current / Math.max(total, 1)) * 100)}%` }} />
      </div>

      <p className="text-[11px] uppercase tracking-wider text-white/40 mb-2">Semanas</p>
      <div className="flex flex-col gap-2 mb-6">
        {product.weeks.map((w) => {
          const open = isWeekUnlocked(product, purchase.purchasedAt, w.week, now)
          const workoutIds = w.program.days.map((d) => d.workoutId).filter(Boolean) as string[]
          const doneCount = workoutIds.filter((id) => done.has(id)).length
          const finished = open && workoutIds.length > 0 && doneCount === workoutIds.length
          const unlockAt = weekUnlockDate(product, purchase.purchasedAt, w.week)
          const days = daysUntil(unlockAt, now)
          const isSelected = w.week === selected
          const body = (
            <>
              <div
                className={cn(
                  'w-9 h-9 rounded-full flex items-center justify-center shrink-0 font-display font-bold text-sm',
                  finished ? 'bg-green-500/20 text-green-400' : open ? (isSelected ? 'bg-gold text-navy' : 'bg-white/10 text-white') : 'bg-white/5 text-white/30'
                )}
              >
                {finished ? <Check size={16} /> : open ? w.week : <Lock size={14} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn('text-sm font-semibold', open ? 'text-white' : 'text-white/50')}>Semana {w.week}</p>
                <p className={cn('text-xs', isSelected && open ? 'text-gold-light' : 'text-white/40')}>
                  {open
                    ? `Liberada · ${doneCount} de ${workoutIds.length} treinos feitos`
                    : `Libera em ${days} dia${days === 1 ? '' : 's'} · ${unlockAt.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}`}
                </p>
              </div>
              {open && <ChevronRight size={16} className="text-white/30 shrink-0" />}
            </>
          )
          const cls = cn(
            'flex items-center gap-3 rounded-control px-4 py-3 border',
            isSelected && open ? 'bg-gold/10 border-gold/30' : 'bg-navy-light border-white/10'
          )
          return open ? (
            <Link key={w.id} href={`/app/planilhas/${product.slug}?semana=${w.week}`} className={cls} scroll={false}>{body}</Link>
          ) : (
            <div key={w.id} className={cls}>{body}</div>
          )
        })}
      </div>

      {selectedWeek && selectedOpen && (
        <>
          <p className="text-[11px] uppercase tracking-wider text-white/40 mb-2">Treinos da semana {selected}</p>
          <div className="flex flex-col gap-2">
            {selectedWeek.program.days.filter((d) => d.workout).map((d) => (
              <Link
                key={d.id}
                href={`/app/treino/${d.workoutId}`}
                className="flex items-center gap-3 bg-navy-light border border-white/10 rounded-control px-4 py-3"
              >
                <span className="text-[11px] font-display font-bold text-gold-light w-8">{DAY_LABEL[d.weekday]}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white">{shortName(d.workout!.name)}</p>
                  {d.workout!.goal && <p className="text-[11px] text-white/40">{d.workout!.goal}</p>}
                </div>
                {done.has(d.workoutId) ? <Check size={16} className="text-green-400 shrink-0" /> : <ChevronRight size={16} className="text-white/30 shrink-0" />}
              </Link>
            ))}
          </div>
        </>
      )}

      <BottomNav />
    </main>
  )
}
