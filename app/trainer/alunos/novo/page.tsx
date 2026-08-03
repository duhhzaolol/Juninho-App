'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { Sidebar } from '@/components/trainer/Sidebar'
import { Button } from '@/components/ui/Button'

const inputClass =
  'w-full bg-navy-light border border-white/10 rounded-control px-4 py-2.5 text-white placeholder:text-white/30 text-sm'

export default function NewStudentPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [created, setCreated] = useState<{ tempPassword: string; email: string } | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [goal, setGoal] = useState('')
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
          goal: goal || null,
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
      } else {
        setError('Não deu pra cadastrar. Confere os campos e tenta de novo.')
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

      <main className="flex-1 px-6 py-8 max-w-md">
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
                }}
                className="text-white/40 text-sm"
              >
                Cadastrar outro
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="font-display font-bold text-xl text-white mb-6">Novo aluno</p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
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
              <input
                placeholder="Objetivo (ex: Hipertrofia de glúteos)"
                className={inputClass}
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
              />

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

              <input
                placeholder="Nível (ex: Iniciante, Intermediário)"
                className={inputClass}
                value={level}
                onChange={(e) => setLevel(e.target.value)}
              />

              {error && <p className="text-red-400 text-xs">{error}</p>}

              <Button type="submit" loading={saving} fullWidth className="mt-2">
                Cadastrar aluno
              </Button>
            </form>
          </>
        )}
      </main>
    </div>
  )
}
