import type { Metadata } from 'next'
import Image from 'next/image'
import { Archivo, Inter } from 'next/font/google'
import './gluteos3d.css'

// Página de vendas pública: juninhomoro.com.br/gluteos3d
// Não usa login nem banco de dados. Para trocar o link de compra, altere CHECKOUT_URL.
const CHECKOUT_URL = 'https://checkout.ticto.app/OA8E76744'

const display = Archivo({ subsets: ['latin'], axes: ['wdth'], variable: '--font-g3d-display', display: 'swap' })
const body = Inter({ subsets: ['latin'], variable: '--font-g3d-body', display: 'swap' })

export const metadata: Metadata = {
  title: 'Glúteos 3D | Juninho Moro',
  description:
    'Treino de 6 semanas com foco em glúteo, liberado semana a semana no app. Método Juninho Moro para quem já treina. De R$ 99,90 por R$ 27,90.',
  openGraph: {
    title: 'Glúteos 3D | Juninho Moro',
    description: 'Glúteo mais forte, redondo e empinado em 6 semanas. Um treino novo liberado no app toda semana.',
    type: 'website',
  },
}

function Icon({ id }: { id: string }) {
  return (
    <svg aria-hidden="true">
      <use href={`#${id}`} />
    </svg>
  )
}

function BuyButton({ children }: { children: React.ReactNode }) {
  return (
    <a className="btn" href={CHECKOUT_URL}>
      {children} <Icon id="i-arrow" />
    </a>
  )
}

function IconSprite() {
  const s = { fill: 'none', stroke: 'currentColor' } as const
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
      <symbol id="i-check" viewBox="0 0 24 24"><path {...s} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" d="M5 12.5l4.2 4.2L19 7" /></symbol>
      <symbol id="i-x" viewBox="0 0 24 24"><path {...s} strokeWidth="2.4" strokeLinecap="round" d="M6 6l12 12M18 6L6 18" /></symbol>
      <symbol id="i-lock" viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="10" rx="2.5" {...s} strokeWidth="2" /><path d="M8 11V8a4 4 0 018 0v3" {...s} strokeWidth="2" /></symbol>
      <symbol id="i-arrow" viewBox="0 0 24 24"><path {...s} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" /></symbol>
      <symbol id="i-shield" viewBox="0 0 24 24"><path {...s} strokeWidth="2" strokeLinejoin="round" d="M12 3l8 3v6c0 4.5-3.4 8-8 9-4.6-1-8-4.5-8-9V6z" /><path {...s} strokeWidth="2" strokeLinecap="round" d="M8.5 12l2.5 2.5 4.5-5" /></symbol>
      <symbol id="i-bolt" viewBox="0 0 24 24"><path {...s} strokeWidth="2" strokeLinejoin="round" d="M13 3L5 13h6l-1 8 8-10h-6z" /></symbol>
      <symbol id="i-card" viewBox="0 0 24 24"><rect x="3" y="6" width="18" height="13" rx="2.5" {...s} strokeWidth="2" /><path stroke="currentColor" strokeWidth="2" d="M3 10.5h18" /></symbol>
      <symbol id="i-play" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="3" {...s} strokeWidth="2" /><path d="M10 9.5v5l4.5-2.5z" fill="currentColor" /></symbol>
      <symbol id="i-timer" viewBox="0 0 24 24"><circle cx="12" cy="13" r="7.5" {...s} strokeWidth="2" /><path {...s} strokeWidth="2" strokeLinecap="round" d="M12 13V9.5M9.5 3h5" /></symbol>
      <symbol id="i-weight" viewBox="0 0 24 24"><path {...s} strokeWidth="2" strokeLinecap="round" d="M4 9v6M7 7v10M17 7v10M20 9v6M7 12h10" /></symbol>
      <symbol id="i-chart" viewBox="0 0 24 24"><path {...s} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M4 19h16M6 15l4-4 3 3 5-6" /></symbol>
      <symbol id="i-photo" viewBox="0 0 24 24"><rect x="3" y="4" width="8" height="16" rx="2" {...s} strokeWidth="2" /><rect x="13" y="4" width="8" height="16" rx="2" {...s} strokeWidth="2" /></symbol>
      <symbol id="i-cal" viewBox="0 0 24 24"><rect x="3.5" y="5" width="17" height="15" rx="2.5" {...s} strokeWidth="2" /><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M3.5 10h17M8 3v4M16 3v4" /></symbol>
    </svg>
  )
}

const MUSCLES = [
  { n: '1', name: 'Máximo', title: 'Volume e projeção', text: 'O maior músculo do glúteo. É ele que dá o "empinado" visto de lado.', ex: ['Elevação pélvica', 'Terra sumô', 'Extensão de quadril'] },
  { n: '2', name: 'Médio', title: 'Formato arredondado', text: 'Fica na lateral do quadril e preenche o glúteo visto de trás.', ex: ['Cadeira abdutora', 'Passada lateral', 'Abdução com band'] },
  { n: '3', name: 'Mínimo', title: 'Firmeza e estabilidade', text: 'O mais profundo. Estabiliza o quadril e sustenta carga nos exercícios pesados.', ex: ['Ostra com band', 'Agachamento búlgaro', 'Abdução no cabo'] },
]

const WEEK = [
  { d: 'SEG', t: 'g' }, { d: 'TER', t: 's' }, { d: 'QUA', t: 'g' }, { d: 'QUI', t: 's' },
  { d: 'SEX', t: 'g' }, { d: 'SÁB', t: 'r' }, { d: 'DOM', t: 'r' },
]

const WEEK_DETAIL = [
  { k: 'SEG', g: true, title: 'Glúteo e posterior', text: 'Ativação com mini band, elevação pélvica em rest-pause, búlgaro, abdutora com drop set' },
  { k: 'TER', g: false, title: 'Costas, ombro, tríceps e abdômen', text: 'Bi-sets para treinar mais em menos tempo' },
  { k: 'QUA', g: true, title: 'Quadríceps e glúteo', text: 'Agachamento, hack, leg press em cluster, afundo no Smith' },
  { k: 'QUI', g: false, title: 'Superior completo', text: 'Puxadas, remadas, supino, ombro, braço e core' },
  { k: 'SEX', g: true, title: 'Perna completa com glúteo', text: 'Elevação pélvica unilateral, terra sumô, hack, flexoras' },
]

const UNLOCKS = [
  { when: 'Na compra', phase: 'Base' },
  { when: 'Dia 8', phase: 'Base' },
  { when: 'Dia 15', phase: 'Choque' },
  { when: 'Dia 22', phase: 'Choque' },
  { when: 'Dia 29', phase: 'Choque' },
  { when: 'Dia 36', phase: 'Deload' },
]

const FEATURES = [
  { icon: 'i-play', title: 'Vídeo de execução', text: 'Cada exercício com demonstração, para fazer com a técnica certa desde a primeira série.' },
  { icon: 'i-bolt', title: 'Base, Choque e Deload', text: 'A intensidade sobe semana a semana e a última semana recupera o corpo para você colher o resultado.' },
  { icon: 'i-weight', title: 'Registro de carga', text: 'Anote o peso de cada série e veja quanto usou no treino anterior.' },
  { icon: 'i-chart', title: 'Gráfico de evolução', text: 'Acompanhe peso e medidas semana a semana.' },
  { icon: 'i-photo', title: 'Antes e depois lado a lado', text: 'Tire suas fotos no app e compare a semana 1 com a semana 6.' },
  { icon: 'i-cal', title: 'Calendário de constância', text: 'Veja os dias treinados. Perdeu um dia? Faça o treino em outro dia da semana.' },
]

// Espaços reservados: trocar pelos prints reais das alunas antes de rodar anúncio.
const PROOF_SLOTS = [
  { before: 'Foto antes (semana 1)', after: 'Foto depois (semana 6)', text: 'Print do depoimento real da aluna sobre o resultado no glúteo.', who: 'Nome da aluna · tempo de treino' },
  { before: 'Foto antes', after: 'Foto depois', text: 'Print de conversa no WhatsApp ou direct do Instagram.', who: 'Nome da aluna · cidade' },
  { before: 'Foto antes', after: 'Foto depois', text: 'Print de story repostado com marcação do @juninhomoro_.', who: 'Nome da aluna' },
]

const FAQ = [
  { q: 'Como eu recebo o acesso?', a: 'Assim que o pagamento é aprovado, você recebe no e-mail o link do app e seus dados de acesso. Pix aprova na hora.' },
  { q: 'Preciso baixar algum aplicativo?', a: 'Não. O app abre direto no navegador do celular, em juninhomoro.com.br/app. Você pode salvar na tela inicial e ele fica igual a um aplicativo.' },
  { q: 'Sou iniciante. Posso fazer?', a: 'O Glúteos 3D é para quem já treina e conhece os exercícios básicos. Se você está começando agora, fale com o suporte antes de comprar.' },
  { q: 'Dá para treinar em casa?', a: 'Dá. Todos os exercícios têm versão para casa, mas sem os equipamentos da academia a progressão de carga fica limitada. O resultado é melhor na academia.' },
  { q: 'Vou treinar só glúteo?', a: 'Não. São 5 treinos por semana: 3 de inferior com ênfase em glúteo e 2 de superior, para o corpo ficar proporcional.' },
  { q: 'E se eu perder um dia?', a: 'Sem problema. Os treinos da semana ficam liberados e você pode fazer qualquer um deles em outro dia.' },
  { q: 'Quanto tempo tenho para fazer?', a: 'As 6 semanas são liberadas uma por semana. Depois de liberadas, ficam disponíveis no seu app.' },
]

export default function Gluteos3DPage() {
  return (
    <div className={`g3d ${display.variable} ${body.variable}`}>
      <IconSprite />

      <header className="wrap topbar">
        <Image src="/logo-jm.png" alt="JM Juninho Moro" width={41} height={34} priority />
        <span className="tag">Glúteos 3D</span>
      </header>

      {/* HERO */}
      <section className="hero">
        <div className="wrap hero-grid">
          <div className="stack" style={{ gap: 20 }}>
            <p className="eyebrow">Método Juninho Moro · 6 semanas no app</p>
            <h1>
              <span className="brand">Glúteos <span className="three">3D</span></span>
              <span className="promise">Mais forte, redondo e empinado em 6 semanas.</span>
            </h1>
            <p className="lead">
              Um treino novo liberado no app toda semana, com foco total no glúteo sem largar o resto do corpo. Feito à mão
              pelo Juninho, para quem já treina e quer ver o glúteo mudar de verdade.
            </p>
            <div className="price-row">
              <span className="price-old">de R$ 99,90</span>
              <span className="price-now"><small>R$</small>27,90</span>
              <span className="price-note">pagamento único</span>
            </div>
            <div><BuyButton>Quero meu Glúteos 3D</BuyButton></div>
            <div className="trust">
              <span><Icon id="i-shield" />7 dias de garantia</span>
              <span><Icon id="i-bolt" />Acesso na hora</span>
              <span><Icon id="i-card" />Pix ou cartão</span>
            </div>
          </div>

          <div className="phone-wrap" aria-label="Prévia do treino no app">
            <div className="phone">
              <div className="screen">
                <div className="notch" />
                <div className="app-top"><span className="wk">Semana 1 · Segunda</span><span className="pill">Hoje</span></div>
                <p className="app-title">Glúteos &amp; Posterior</p>
                <p className="app-sub">Ênfase em glúteo · 8 exercícios</p>
                <div className="bar"><i /></div>

                <div className="ex done"><span className="n">✓</span><span><b>Ostra com mini band</b><em>3 × 12–15</em></span><span className="tech pre">Ativação</span></div>
                <div className="ex done"><span className="n">✓</span><span><b>Passada lateral com mini band</b><em>3 × 12–15</em></span><span className="tech pre">Ativação</span></div>
                <div className="ex now"><span className="n">3</span><span><b>Elevação pélvica</b><em>2 × 12–15 + cluster 4-4-4</em></span><span className="tech">Cluster</span></div>
                <div className="load"><span>1ª 40 kg</span><span>2ª 40 kg</span><span className="on">3ª ___ kg</span></div>
                <div className="ex"><span className="n">4</span><span><b>Agachamento sumô</b><em>3 × 12–15</em></span><span /></div>
                <div className="ex"><span className="n">5</span><span><b>Agachamento búlgaro</b><em>3 × 12–15</em></span><span /></div>

                <div className="rest">
                  <span><em>Fase Base · semana 1 de 6</em><b>Descanso de 60 a 120s</b></span>
                </div>
              </div>
            </div>
            <div className="phone-badge"><strong>30</strong> treinos em<br />6 semanas</div>
          </div>
        </div>
      </section>

      {/* PARA QUEM É */}
      <section style={{ paddingTop: 24 }}>
        <div className="wrap">
          <div className="sec-head">
            <p className="eyebrow">Para quem é</p>
            <h2>Feito para quem já treina e cansou de ver o glúteo parado.</h2>
          </div>
          <div className="fit">
            <div className="fit-card yes">
              <h3>O Glúteos 3D é para você se</h3>
              <ul className="checks">
                <li><Icon id="i-check" /><span>Você já treina há alguns meses e conhece os exercícios básicos de academia.</span></li>
                <li><Icon id="i-check" /><span>Treina em academia. Dá para fazer em casa, mas com menos progressão de carga.</span></li>
                <li><Icon id="i-check" /><span>Quer foco no glúteo sem abandonar perna, costas, ombro e abdômen.</span></li>
                <li><Icon id="i-check" /><span>Quer abrir o celular e saber exatamente o que fazer, quantas séries e quanto descansar.</span></li>
              </ul>
            </div>
            <div className="fit-card no">
              <h3>Não é para você se</h3>
              <ul className="checks">
                <li><Icon id="i-x" /><span>Você nunca treinou musculação. O método é de nível intermediário para cima.</span></li>
                <li><Icon id="i-x" /><span>Procura um treino de 15 minutos sem esforço.</span></li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* POR QUE 3D */}
      <section>
        <div className="wrap">
          <div className="sec-head">
            <p className="eyebrow">Por que 3D</p>
            <h2>O glúteo tem três músculos. A maioria dos treinos só trabalha um.</h2>
            <p className="lead">
              Volume, formato e firmeza vêm de músculos diferentes. O Glúteos 3D distribui o estímulo entre os três, em todos
              os treinos de inferior.
            </p>
          </div>
          <div className="three-grid">
            {MUSCLES.map((m) => (
              <div className="muscle" key={m.n}>
                <div className="d">{m.n}<small>{m.name}</small></div>
                <div>
                  <h3>{m.title}</h3>
                  <p>{m.text}</p>
                  <div className="ex-list">{m.ex.map((e) => <span key={e}>{e}</span>)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SEMANA */}
      <section>
        <div className="wrap">
          <div className="sec-head">
            <p className="eyebrow">A semana de treino</p>
            <h2>5 treinos por semana. 3 deles com glúteo.</h2>
            <p className="lead">
              Segunda, quarta e sexta são de inferior com ênfase em glúteo. Terça e quinta trabalham o superior para o corpo
              ficar proporcional. Fim de semana é descanso.
            </p>
          </div>
          <div className="week" role="list" aria-label="Divisão semanal">
            {WEEK.map((w) => (
              <div className={`day ${w.t}`} role="listitem" key={w.d}><span className="dn">{w.d}</span><span className="dot" /></div>
            ))}
          </div>
          <div className="week-legend">
            <span><i style={{ background: 'var(--gold)' }} />Inferior com ênfase em glúteo</span>
            <span><i style={{ background: 'var(--purple-2)' }} />Superior</span>
            <span><i style={{ border: '1.5px dashed var(--muted)' }} />Descanso</span>
          </div>
          <div className="week-detail">
            {WEEK_DETAIL.map((w) => (
              <div className="wd" key={w.k}>
                <span className={`k${w.g ? ' g' : ''}`}>{w.k}</span>
                <span><b>{w.title}</b><em>{w.text}</em></span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6 SEMANAS */}
      <section>
        <div className="wrap">
          <div className="sec-head">
            <p className="eyebrow">Como funciona</p>
            <h2>Uma semana nova liberada a cada 7 dias.</h2>
            <p className="lead">
              Você não recebe um PDF gigante para se perder. A semana 1 libera na hora da compra e cada semana seguinte abre
              sozinha no app, 7 dias depois.
            </p>
          </div>
          <div className="timeline">
            {UNLOCKS.map((u, i) => (
              <div className={`tw${i === 0 ? ' open' : ''}`} key={u.when}>
                <div className="num">{i + 1}</div>
                <div className="lbl">{u.phase}</div>
                <div className="when">{u.when}</div>
                {i > 0 && <Icon id="i-lock" />}
              </div>
            ))}
          </div>
          <div className="tl-note">
            <p>As semanas seguem 3 fases: <b>Base</b> (1 e 2) para adaptar aos exercícios e técnicas, <b>Choque</b> (3 a 5) com intensidade máxima e <b>Deload</b> (6) para o corpo recuperar.</p>
            <p>Séries, repetições e técnicas como cluster set, drop set e back off set mudam a cada semana para o glúteo não se acostumar.</p>
          </div>
        </div>
      </section>

      {/* APP */}
      <section>
        <div className="wrap">
          <div className="sec-head">
            <p className="eyebrow">O que você recebe</p>
            <h2>Seu personal no bolso, do aquecimento ao último set.</h2>
          </div>
          <div className="feats">
            {FEATURES.map((f) => (
              <div className="feat" key={f.title}>
                <span className="ic"><Icon id={f.icon} /></span>
                <div><h3>{f.title}</h3><p>{f.text}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DEPOIMENTOS */}
      <section>
        <div className="wrap">
          <div className="sec-head">
            <p className="eyebrow">Resultados das alunas</p>
            <h2>Quem treina, transforma.</h2>
          </div>
          <div className="proof">
            {PROOF_SLOTS.map((p, i) => (
              <div className="slot" key={i}>
                <span className="ex-tag">Espaço reservado</span>
                <div className="ba"><div>{p.before}</div><div>{p.after}</div></div>
                <q>{p.text}</q>
                <span className="who">{p.who}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AUTOR */}
      <section>
        <div className="wrap">
          <div className="author">
            <div className="author-text">
              <p className="eyebrow">Quem criou o método</p>
              <h2>Eu sou Juninho Moro.</h2>
              <p>
                Personal trainer com CREF e criador do JM Team. Cada treino do Glúteos 3D foi montado por mim, exercício por
                exercício, sem modelo pronto e sem inteligência artificial.
              </p>
              <div className="stats">
                <div className="stat"><b>+500</b><span>evoluções reais</span></div>
                <div className="stat"><b>6</b><span>anos de método</span></div>
                <div className="stat"><b>CREF</b><span>personal registrado</span></div>
              </div>
              <p className="motto">Força só é ruim <span className="gold">pra quem não tem.</span></p>
            </div>
            <Image className="author-photo" src="/gluteos3d/juninho.webp" alt="Juninho Moro, personal trainer" width={360} height={420} />
          </div>
        </div>
      </section>

      {/* OFERTA */}
      <section id="oferta">
        <div className="wrap">
          <div className="offer">
            <p className="eyebrow">Acesso completo</p>
            <h2>Glúteos <span className="gold">3D</span></h2>
            <ul className="checks yes">
              <li><Icon id="i-check" /><span>6 semanas de treino, 30 treinos no total</span></li>
              <li><Icon id="i-check" /><span>Treino novo liberado toda semana no app</span></li>
              <li><Icon id="i-check" /><span>Vídeo de execução em cada exercício</span></li>
              <li><Icon id="i-check" /><span>Registro de carga em cada série</span></li>
              <li><Icon id="i-check" /><span>Gráfico de evolução e fotos de antes e depois</span></li>
            </ul>
            <div className="price-block">
              <span className="price-old">de R$ 99,90</span>
              <span className="price-now"><small>R$</small>27,90</span>
              <span className="per">Menos de R$ 1 por treino · pagamento único</span>
            </div>
            <BuyButton>Quero começar agora</BuyButton>
            <p className="secure">Pagamento seguro pela Ticto · Pix ou cartão</p>
          </div>
        </div>
      </section>

      {/* GARANTIA */}
      <section style={{ paddingTop: 8 }}>
        <div className="wrap">
          <div className="guarantee">
            <div className="seal"><span><b>7</b><span>DIAS DE<br />GARANTIA</span></span></div>
            <div className="stack" style={{ gap: 6 }}>
              <h3>Risco zero para você</h3>
              <p>Entrou, treinou e não gostou? Peça o reembolso em até 7 dias e devolvemos 100% do valor. Sem perguntas.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section>
        <div className="wrap">
          <div className="sec-head"><p className="eyebrow">Dúvidas</p><h2>Perguntas frequentes</h2></div>
          <div className="faq">
            {FAQ.map((f) => (
              <details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL */}
      <section>
        <div className="wrap final">
          <p className="eyebrow">Sua semana 1 já está pronta</p>
          <h2>Daqui a 6 semanas você vai querer ter começado hoje.</h2>
          <BuyButton>Quero meu Glúteos 3D</BuyButton>
        </div>
      </section>

      <footer className="wrap">
        <span>© 2026 Juninho Moro · Todos os direitos reservados</span>
        <span>Suporte: suportejmteam@outlook.com</span>
        <span>Os resultados variam de pessoa para pessoa e dependem de constância no treino e na alimentação.</span>
      </footer>

      <div className="sticky">
        <div className="sticky-in">
          <span className="p"><s>R$ 99,90</s><b>R$ 27,90</b></span>
          <BuyButton>Quero começar</BuyButton>
        </div>
      </div>
    </div>
  )
}
