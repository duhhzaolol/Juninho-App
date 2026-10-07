import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Archivo } from 'next/font/google'
import { ChevronRight, Dumbbell, MessageCircle, Bell, LifeBuoy, Instagram, Sparkles } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { whatsappLink } from '@/lib/trainer'
import { formatPrice } from '@/lib/store'
import { LINKS_CONFIG as C } from '@/lib/links'

const display = Archivo({ subsets: ['latin'], axes: ['wdth'], variable: '--font-jm-display', display: 'swap' })

export const linksMetadata: Metadata = {
  title: 'Juninho Moro · Personal trainer',
  description: 'Consultoria individual, planilhas de treino e o app JM Team. Método Juninho Moro.',
  openGraph: {
    title: 'Juninho Moro · Personal trainer',
    description: 'Consultoria individual, planilhas de treino e o app JM Team.',
    type: 'website',
  },
}

const DISPLAY = 'font-[family-name:var(--font-jm-display),Arial,sans-serif] [font-stretch:118%]'
// títulos dos cards: mesma fonte, mais estreita, para caber numa linha no celular
const CARD_TITLE = 'font-[family-name:var(--font-jm-display),Arial,sans-serif] [font-stretch:100%]'

async function loadData() {
  // A página continua no ar mesmo se o banco não responder
  try {
    const [trainer, soon] = await Promise.all([
      prisma.trainerProfile.findFirst({ select: { whatsapp: true } }),
      prisma.product.findMany({
        where: { status: 'soon' },
        select: { id: true, name: true, tagline: true },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      }),
    ])
    return { whatsapp: trainer?.whatsapp ?? null, soon }
  } catch (err) {
    console.error('[links] banco indisponível', err)
    return { whatsapp: null, soon: [] as { id: string; name: string; tagline: string | null }[] }
  }
}

export async function LinksPage() {
  const { whatsapp, soon } = await loadData()
  const dm = `https://ig.me/m/${C.instagram}`
  const wa = (text: string) => (whatsapp ? whatsappLink(whatsapp, text) : dm)
  const supportHref = whatsapp ? whatsappLink(whatsapp, C.messages.suporte) : `mailto:${C.supportEmail}`

  return (
    <main className={`${display.variable} relative min-h-screen bg-navy text-white overflow-hidden`}>
      {/* brilho roxo e riscos diagonais, como no PDF do método */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(ellipse_at_50%_20%,rgba(124,58,237,0.45),transparent_65%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] opacity-[0.07] bg-[repeating-linear-gradient(115deg,#fff_0_2px,transparent_2px_46px)] [mask-image:linear-gradient(to_bottom,black,transparent)]" />

      <div className="relative mx-auto w-full max-w-[440px] px-5 pb-10 pt-6">
        {/* ---------- topo ---------- */}
        <header className="flex flex-col items-center text-center">
          <div className="relative w-[230px] h-[250px] -mb-6">
            <Image
              src="/gluteos3d/juninho.webp"
              alt="Juninho Moro"
              fill
              priority
              sizes="230px"
              className="object-cover object-top [mask-image:linear-gradient(to_bottom,black_70%,transparent)]"
            />
          </div>
          <h1 className={`${DISPLAY} relative font-black uppercase text-[3.1rem] leading-[0.9] tracking-tight`}>
            Juninho
            <br />
            <span className="text-gold">Moro</span>
          </h1>
          <p className="mt-2 text-sm text-white/60">Personal trainer com CREF · criador do JM Team</p>
          <p className={`${DISPLAY} mt-3 text-lg font-extrabold leading-tight`}>
            Força só é ruim
            <br />
            <span className="text-gold-light">pra quem não tem.</span>
          </p>
          <div className="mt-4 flex gap-2 text-xs">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
              <b className="text-gold-light">+500</b> evoluções reais
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
              <b className="text-gold-light">6 anos</b> de método
            </span>
          </div>
        </header>

        {/* ---------- links ---------- */}
        <nav className="mt-8 flex flex-col gap-3" aria-label="Links">
          <a
            href={wa(C.messages.consultoria)}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-4 rounded-card bg-gradient-to-br from-gold-light to-gold p-4 text-navy shadow-[0_14px_36px_-14px_rgba(245,179,0,0.7)]"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-navy/10">
              <MessageCircle size={24} strokeWidth={2.2} />
            </span>
            <span className="min-w-0 flex-1">
              <span className={`${CARD_TITLE} block text-lg font-extrabold leading-tight`}>Consultoria individual</span>
              <span className="block text-[13px] leading-snug text-navy/75">
                Treino montado só pra você, com acompanhamento direto comigo no app.
              </span>
            </span>
            <ChevronRight size={20} className="shrink-0 transition-transform group-hover:translate-x-0.5" />
          </a>

          <Link
            href={C.featured.href}
            className="group relative flex items-center gap-4 overflow-hidden rounded-card border border-white/10 bg-gradient-to-br from-purple-dark via-purple to-navy-light p-4"
          >
            <span className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/5" />
            <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-gold-light">
              <Sparkles size={22} />
            </span>
            <span className="relative min-w-0 flex-1">
              <span className="block whitespace-nowrap text-[10px] uppercase tracking-[0.1em] text-gold-light">{C.featured.eyebrow}</span>
              <span className={`${CARD_TITLE} block text-lg font-extrabold leading-tight`}>{C.featured.name}</span>
              <span className="block text-[13px] leading-snug text-white/65">{C.featured.text}</span>
            </span>
            <span className="relative shrink-0 text-right">
              <span className="block text-[11px] text-white/40 line-through">{formatPrice(C.featured.oldPriceCents)}</span>
              <span className={`${DISPLAY} block text-lg font-black leading-none text-gold-light`}>{formatPrice(C.featured.priceCents)}</span>
            </span>
          </Link>

          <Link
            href="/app"
            className="group flex items-center gap-4 rounded-card border border-white/10 bg-navy-light p-4"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-purple/30 text-purple-light">
              <Dumbbell size={22} />
            </span>
            <span className="min-w-0 flex-1">
              <span className={`${CARD_TITLE} block text-lg font-extrabold leading-tight`}>Entrar no app</span>
              <span className="block text-[13px] text-white/50">Para quem já treina comigo: treinos, cargas e evolução.</span>
            </span>
            <ChevronRight size={20} className="shrink-0 text-white/30" />
          </Link>

          {soon.map((p) => (
            <a
              key={p.id}
              href={wa(C.messages.emBreve(p.name))}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 rounded-card border border-dashed border-white/15 p-4"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/5 text-white/50">
                <Bell size={20} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[10px] font-semibold uppercase tracking-[0.1em] text-white/45">Em breve</span>
                <span className={`${CARD_TITLE} block text-lg font-extrabold leading-tight text-white/85`}>{p.name}</span>
                <span className="block text-[13px] text-white/45">{p.tagline ?? 'Nova planilha do Juninho.'}</span>
              </span>
              <span className="shrink-0 text-xs font-semibold text-gold-light">Me avisa</span>
            </a>
          ))}
        </nav>

        {/* ---------- resultados ---------- */}
        <section className="mt-10" aria-labelledby="resultados">
          <h2 id="resultados" className={`${DISPLAY} text-xl font-black`}>
            Quem treina, <span className="text-gold">transforma.</span>
          </h2>
          <div className="-mx-5 mt-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none]">
            {C.results.map((r) => (
              <figure
                key={r.name}
                className="w-[78%] shrink-0 snap-start rounded-card border border-white/10 bg-navy-light p-5"
              >
                <p className={`${DISPLAY} text-3xl font-black leading-none text-gold`}>{r.metric}</p>
                <p className="mt-1 text-[11px] uppercase tracking-wider text-white/45">{r.context}</p>
                <blockquote className="mt-3 text-sm leading-relaxed text-white/80">“{r.quote}”</blockquote>
                <figcaption className="mt-3 text-xs font-semibold text-white/60">{r.name}</figcaption>
              </figure>
            ))}
          </div>
        </section>

        {/* ---------- ajuda e redes ---------- */}
        <div className="mt-8 grid grid-cols-2 gap-3">
          <a
            href={supportHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-control border border-white/10 px-3 py-3 text-xs text-white/70"
          >
            <LifeBuoy size={16} className="shrink-0 text-white/50" />
            Comprei e preciso de ajuda
          </a>
          <a
            href={`https://instagram.com/${C.instagram}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-control border border-white/10 px-3 py-3 text-xs text-white/70"
          >
            <Instagram size={16} className="shrink-0 text-white/50" />@{C.instagram}
          </a>
        </div>

        <footer className="mt-10 text-center text-[11px] text-white/30">
          © {new Date().getFullYear()} Juninho Moro · Site e app por Instaby
        </footer>
      </div>
    </main>
  )
}
