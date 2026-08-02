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
  const [form, setForm] = useState({
    name: '',
    email: '',
    goal: '',
    weightKg: '',
    heightCm: '',
    age: '',
    level: '',
  })

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')

    const res = await fetch('/api/students', {
      method: 'POST',
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        goal: form.goal || null,
        weightKg: form.weightKg ? Number(form.weightKg) : null,
        heightCm: form.heightCm ? Number(form.heightCm) : null,
        age: form.age ? Number(form.age) : null,
        level: form.level || null,
      }),
    })

    setSaving(false)

    if (res.ok) {
      const data = await res.json()
      setCreated({ tempPassword: data.tempPassword, email: form.email })
    } else if (res.status === 409) {
      setError('Já existe uma conta com esse e-mail.')
    } else {
      setError('Não deu pra cadastrar. Confere os campos e tenta de novo.')
    }
  }

  if (created) {
    return (
      <div className="min-h-screen bg-navy flex flex-col md:flex-row">
        <Sidebar />
        <main className="flex-1 px-6 py-8 max-w-md">
          <p className="font-display font-bold text-xl text-white mb-4">Aluno cadastrado! 🎉</p>
          <div className="bg-gold/10 border border-gold/30 rounded-control p-4 mb-6">
            <p className="text-xs text-white/60 mb-2">Repassa esses dados de acesso pro aluno:</p>
            <p className="text-sm text-white mb-1"><span className="text-white/40">E-mail:</span> {created.email}</p>
            <p className="text-sm text-white"><span className="text-white/40">Senha temporária:</span> <span className="font-display font-bold text-gold-light">{created.tempPassword}</span></p>
          </div>
          <div className="flex gap-3">
            <Link href="/trainer/alunos" className="text-gold-light text-sm">Ver lista de alunos</Link>
            <button onClick={() => setCreated(null)} className="text-white/40 text-sm">Cadastrar outro</button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-navy flex flex-col md:flex-row">
      <Sidebar />

      <main className="flex-1 px-6 py-8 max-w-md">
        <Link href="/trainer/alunos" className="text-white/50 flex items-center gap-1 text-sm mb-4">
          <ChevronLeft size={18} /> Alunos
        </Link>

        <p className="font-display font-bold text-xl text-white mb-6">Novo aluno</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input required placeholder="Nome completo" className={inputClass}
            value={form.name} onChange={(e) => update('name', e.target.value)} />
          <input required type="email" placeholder="E-mail" className={inputClass}
            value={form.email} onChange={(e) => update('email', e.target.value)} />
          <input placeholder="Objetivo (ex: Hipertrofia de glúteos)" className={inputClass}
            value={form.goal} onChange={(e) => update('goal', e.target.value)} />

          <div className="grid grid-cols-3 gap-3">
            <input placeholder="Peso (kg)" type="number" className={inputClass}
              value={form.weightKg} onChange={(e) => update('weightKg', e.target.value)} />
            <input placeholder="Altura (cm)" type="number" className={inputClass}
              value={form.heightCm} onChange={(e) => update('heightCm', e.target.value)} />
            <input placeholder="Idade" type="number" className={inputClass}
              value={form.age} onChange={(e) => update('age', e.target.value)} />
          </div>

          <input placeholder="Nível (ex: Iniciante, Intermediário)" className={inputClass}
            value={form.level} onChange={(e) => update('level', e.target.value)} />

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <Button type="submit" loading={saving} fullWidth className="mt-2">
            Cadastrar aluno
          </Button>
        </form>
      </main>
    </div>
  )
}
