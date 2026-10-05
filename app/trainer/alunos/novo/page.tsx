'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { Sidebar } from '@/components/trainer/Sidebar'
import { Button } from '@/components/ui/Button'
import { PillSelect } from '@/components/trainer/PillSelect'
import { MultiPillSelect } from '@/components/trainer/MultiPillSelect'

const inputClass =
  'w-full bg-navy-light border border-white/10 rounded-control px-4 py-2.5 text-white placeholder:text-white/30 text-sm'

const GOAL_OPTIONS = ['Perda de peso', 'Hipertrofia', 'Definição muscular', 'Alto rendimento', 'Saúde e bem-estar']
const LEVEL_OPTIONS = ['Iniciante', 'Intermediário', 'Avançado']

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <p className="text-[11px] uppercase tracking-wider text-white/40 mb-3">{title}</p>
      {children}
    </div>
  )
}

export default function NewStudentPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [created, setCreated] = useState<{ tempPassword: string; email: string } | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [goals, setGoals] = useState<string[]>([])
  const [weightKg, setWeightKg] = useState('')
  const [heightCm, setHeightCm] = useState('')
  const [age, setAge] = useState('')
  const [level, setLevel] = useState('')

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
          goal: goals.length > 0 ? goals.join(', ') : null,
          weightKg: weightKg ? Number(weightKg) : null,
          heightCm: heightCm ? Number(heightCm) : null,
          age: age ? Number(age) : null,
          level: level || null,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setCreated({ tempPassword: data.tempPassword, email })
      } else if (res.status === 409) {
        setError('Já existe uma conta com esse e-mail.')
      } else if (res.status === 401 || res.status === 403) {
        setError('Sua sessão expirou. Saia e entre de novo antes de tentar cadastrar.')
      } else {
        const data = await res.json().catch(() => ({}))
        setError(`Não deu pra cadastrar (erro ${res.status}: ${data.error ?? 'desconhecido'}). Tenta de novo.`)
      }
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
            <p className="font-display font-bold text-xl text-white mb-4">Aluno cadastrado! 🎉</p>
            <div className="bg-gold/10 border border-gold/30 rounded-control p-4 mb-6">
              <p className="text-xs text-white/60 mb-2">Repassa esses dados de acesso pro aluno:</p>
              <p className="text-sm text-white mb-1">
                <span className="text-white/40">E-mail:</span> {created.email}
              </p>
              <p className="text-sm text-white">
                <span className="text-white/40">Senha temporária:</span>{' '}
                <span className="font-display font-bold text-gold-light">{created.tempPassword}</span>
              </p>
            </div>
            <div className="flex gap-4">
              <Link href="/trainer/alunos" className="text-gold-light text-sm">
                Ver lista de alunos
              </Link>
              <button
                type="button"
                onClick={() => {
                  setCreated(null)
                  setName('')
                  setEmail('')
                  setGoals([])
                  setLevel('')
                }}
                className="text-white/40 text-sm"
              >
                Cadastrar outro
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <p className="font-display font-bold text-xl text-white mb-6">Novo aluno</p>

            <Section title="Dados de acesso">
              <div className="flex flex-col gap-3">
                <input
                  required
                  placeholder="Nome completo"
                  className={inputClass}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <input
                  required
                  type="email"
                  placeholder="E-mail"
                  className={inputClass}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
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
                <input
                  placeholder="Peso (kg)"
                  type="number"
                  className={inputClass}
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                />
                <input
                  placeholder="Altura (cm)"
                  type="number"
                  className={inputClass}
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value)}
                />
                <input
                  placeholder="Idade"
                  type="number"
                  className={inputClass}
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                />
              </div>
            </Section>

            {error && <p className="text-red-400 text-xs mb-3">{error}</p>}

            <Button type="submit" loading={saving} fullWidth>
              Cadastrar aluno
            </Button>
          </form>
        )}
      </main>
    </div>
  )
}
