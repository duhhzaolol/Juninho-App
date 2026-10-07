'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { Sidebar } from '@/components/trainer/Sidebar'
import { Button } from '@/components/ui/Button'
import { PillSelect } from '@/components/trainer/PillSelect'
import { MultiPillSelect } from '@/components/trainer/MultiPillSelect'
import { AccessLinkCard } from '@/components/trainer/AccessLinkCard'

const inputClass =
  'w-full bg-navy-light border border-white/10 rounded-control px-4 py-2.5 text-white placeholder:text-white/30 text-sm'

const GOAL_OPTIONS = ['Perda de peso', 'Hipertrofia', 'Definição muscular', 'Alto rendimento', 'Saúde e bem-estar']
const LEVEL_OPTIONS = ['Iniciante', 'Intermediário', 'Avançado']
const PERIODS = [
  { label: 'Mensal (30 dias)', days: 30 },
  { label: 'Bimestral (60 dias)', days: 60 },
  { label: 'Trimestral (90 dias)', days: 90 },
  { label: 'Semestral (180 dias)', days: 180 },
]

type Plan = { id: string; name: string; priceCents: number; billingType: string }

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <p className="text-[11px] uppercase tracking-wider text-white/40 mb-1">{title}</p>
      {hint && <p className="text-xs text-white/30 mb-3">{hint}</p>}
      {!hint && <div className="mb-2" />}
      {children}
    </div>
  )
}

const addDays = (days: number) => {
  const d = new Date(Date.now() + days * 86400000)
  return d.toISOString().slice(0, 10)
}

export default function NewStudentPage() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [created, setCreated] = useState<{ link: string | null; whatsapp: string; emailSent: boolean; converted: boolean; studentId: string } | null>(null)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [planId, setPlanId] = useState('')
  const [price, setPrice] = useState('')
  const [periodDays, setPeriodDays] = useState(30)
  const [renewsAt, setRenewsAt] = useState(addDays(30))
  const [workoutDays, setWorkoutDays] = useState('3')
  const [sendByEmail, setSendByEmail] = useState(true)
  const [goals, setGoals] = useState<string[]>([])
  const [level, setLevel] = useState('')
  const [weightKg, setWeightKg] = useState('')
  const [heightCm, setHeightCm] = useState('')
  const [age, setAge] = useState('')

  useEffect(() => {
    fetch('/api/plans')
      .then((r) => (r.ok ? r.json() : []))
      .then((list: Plan[]) => setPlans(list))
      .catch(() => {})
  }, [])

  function choosePlan(id: string) {
    setPlanId(id)
    const plan = plans.find((p) => p.id === id)
    if (plan) setPrice((plan.priceCents / 100).toFixed(2).replace('.', ','))
  }

  function choosePeriod(days: number) {
    setPeriodDays(days)
    setRenewsAt(addDays(days))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        body: JSON.stringify({
          name,
          email,
          whatsapp,
          planId: planId || null,
          priceCents: price ? Math.round(Number(price.replace(',', '.')) * 100) : null,
          periodDays,
          renewsAt,
          workoutDays: Number(workoutDays) || 0,
          sendByEmail,
          goal: goals.length > 0 ? goals.join(', ') : null,
          weightKg: weightKg ? Number(weightKg) : null,
          heightCm: heightCm ? Number(heightCm) : null,
          age: age ? Number(age) : null,
          level: level || null,
        }),
      })
      if (res.ok) setCreated(await res.json())
      else if (res.status === 409) setError('Esse e-mail já é usado por outra conta.')
      else if (res.status === 401) setError('Sua sessão expirou. Saia e entre de novo antes de tentar cadastrar.')
      else setError(`Não deu pra cadastrar (erro ${res.status}). Tenta de novo.`)
    } catch {
      setError('Erro de conexão. Tenta de novo.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-navy flex flex-col md:flex-row">
      <Sidebar />

      <main className="flex-1 px-6 py-8 max-w-lg">
        <Link href="/trainer/alunos" className="text-white/50 flex items-center gap-1 text-sm mb-4">
          <ChevronLeft size={18} /> Alunos
        </Link>

        {created ? (
          <>
            <p className="font-display font-bold text-xl text-white mb-1">
              {created.converted ? 'Consultoria ativada! 🎉' : 'Aluno cadastrado! 🎉'}
            </p>
            <p className="text-sm text-white/50 mb-5">
              {created.link
                ? 'Agora é só mandar o link para ele criar a senha e entrar no app.'
                : 'Esse aluno já tinha conta com senha. Ele já vê a consultoria ao entrar no app.'}
            </p>
            <AccessLinkCard link={created.link} whatsapp={created.whatsapp} emailSent={created.emailSent} />
            <div className="flex gap-4 mt-6">
              <Link href={`/trainer/alunos/${created.studentId}`} className="text-gold-light text-sm">Ver aluno</Link>
              <button type="button" onClick={() => { setCreated(null); setName(''); setEmail(''); setWhatsapp('') }} className="text-white/40 text-sm">
                Cadastrar outro
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <p className="font-display font-bold text-xl text-white mb-1">Novo aluno da consultoria</p>
            <p className="text-sm text-white/40 mb-6">O aluno recebe um link para criar a própria senha.</p>

            <Section title="Dados de acesso">
              <div className="flex flex-col gap-3">
                <input required placeholder="Nome completo" className={inputClass} value={name} onChange={(e) => setName(e.target.value)} />
                <input required type="email" placeholder="E-mail" className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} />
                <input placeholder="WhatsApp com DDD (ex: 19999999999)" inputMode="tel" className={inputClass} value={whatsapp} onChange={(e) => setWhatsapp(e.target.value.replace(/\D/g, ''))} />
              </div>
            </Section>

            <Section title="Plano" hint={plans.length === 0 ? 'Cadastre os planos em Planos para escolher aqui.' : undefined}>
              <div className="flex flex-col gap-3">
                <select className={inputClass} value={planId} onChange={(e) => choosePlan(e.target.value)}>
                  <option value="">Sem plano por enquanto</option>
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                {planId && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <label className="text-[11px] text-white/40">Valor (R$)
                        <input className={`${inputClass} mt-1`} inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} />
                      </label>
                      <label className="text-[11px] text-white/40">Próxima cobrança
                        <input type="date" className={`${inputClass} mt-1`} value={renewsAt} onChange={(e) => setRenewsAt(e.target.value)} />
                      </label>
                    </div>
                    <PillSelect
                      options={PERIODS.map((p) => p.label)}
                      value={PERIODS.find((p) => p.days === periodDays)?.label ?? ''}
                      onChange={(label) => choosePeriod(PERIODS.find((p) => p.label === label)?.days ?? 30)}
                    />
                  </>
                )}
              </div>
            </Section>

            <Section title="Prazo para liberar o treino" hint="Aparece para o aluno no Início enquanto o treino não fica pronto.">
              <div className="flex items-center gap-3">
                <input className={`${inputClass} w-24`} inputMode="numeric" value={workoutDays} onChange={(e) => setWorkoutDays(e.target.value.replace(/\D/g, ''))} />
                <span className="text-sm text-white/50">dias a partir de hoje</span>
              </div>
            </Section>

            <Section title="Objetivo">
              <MultiPillSelect options={GOAL_OPTIONS} values={goals} onChange={setGoals} allowOther />
            </Section>

            <Section title="Nível">
              <PillSelect options={LEVEL_OPTIONS} value={level} onChange={setLevel} />
            </Section>

            <Section title="Dados físicos (opcional)">
              <div className="grid grid-cols-3 gap-3">
                <input placeholder="Peso (kg)" type="number" className={inputClass} value={weightKg} onChange={(e) => setWeightKg(e.target.value)} />
                <input placeholder="Altura (cm)" type="number" className={inputClass} value={heightCm} onChange={(e) => setHeightCm(e.target.value)} />
                <input placeholder="Idade" type="number" className={inputClass} value={age} onChange={(e) => setAge(e.target.value)} />
              </div>
            </Section>

            <label className="flex items-center gap-2 text-sm text-white/60 mb-5">
              <input type="checkbox" checked={sendByEmail} onChange={(e) => setSendByEmail(e.target.checked)} />
              Mandar o link também por e-mail
            </label>

            {error && <p className="text-red-400 text-xs mb-3">{error}</p>}

            <Button type="submit" loading={saving} fullWidth>
              Cadastrar e gerar link de acesso
            </Button>
          </form>
        )}
      </main>
    </div>
  )
}
