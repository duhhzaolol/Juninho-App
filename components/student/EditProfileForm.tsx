'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface Initial {
  name: string
  goal: string
  weightKg?: number
  heightCm?: number
  age?: number
  level: string
}

const inputClass =
  'w-full bg-navy-light border border-white/10 rounded-control px-4 py-3 text-white placeholder:text-white/30 text-sm'

export function EditProfileForm({ initial }: { initial: Initial }) {
  const router = useRouter()
  const [form, setForm] = useState({
    name: initial.name,
    goal: initial.goal,
    weightKg: initial.weightKg?.toString() ?? '',
    heightCm: initial.heightCm?.toString() ?? '',
    age: initial.age?.toString() ?? '',
    level: initial.level,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')

    const res = await fetch('/api/profile', {
      method: 'PATCH',
      body: JSON.stringify({
        name: form.name,
        goal: form.goal || null,
        weightKg: form.weightKg ? Number(form.weightKg) : null,
        heightCm: form.heightCm ? Number(form.heightCm) : null,
        age: form.age ? Number(form.age) : null,
        level: form.level || null,
      }),
    })

    setSaving(false)
    if (res.ok) {
      router.push('/perfil')
      router.refresh()
    } else {
      setError('Não deu pra salvar. Tenta de novo.')
    }
  }

  return (
    <main className="min-h-screen bg-navy px-5 pt-8 pb-10">
      <Link href="/perfil" className="text-white/50 flex items-center gap-1 text-sm mb-6">
        <ChevronLeft size={18} /> Perfil
      </Link>

      <p className="font-display font-bold text-xl text-white mb-6">Editar informações</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div>
          <label className="text-xs text-white/40 mb-1 block">Nome</label>
          <input className={inputClass} value={form.name} onChange={(e) => update('name', e.target.value)} />
        </div>

        <div>
          <label className="text-xs text-white/40 mb-1 block">Objetivo</label>
          <input placeholder="Ex: Hipertrofia de glúteos" className={inputClass} value={form.goal} onChange={(e) => update('goal', e.target.value)} />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-white/40 mb-1 block">Peso (kg)</label>
            <input type="number" className={inputClass} value={form.weightKg} onChange={(e) => update('weightKg', e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-white/40 mb-1 block">Altura (cm)</label>
            <input type="number" className={inputClass} value={form.heightCm} onChange={(e) => update('heightCm', e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-white/40 mb-1 block">Idade</label>
            <input type="number" className={inputClass} value={form.age} onChange={(e) => update('age', e.target.value)} />
          </div>
        </div>

        <div>
          <label className="text-xs text-white/40 mb-1 block">Nível</label>
          <input placeholder="Ex: Iniciante, Intermediário" className={inputClass} value={form.level} onChange={(e) => update('level', e.target.value)} />
        </div>

        {error && <p className="text-red-400 text-xs">{error}</p>}

        <Button type="submit" loading={saving} fullWidth className="mt-2">
          Salvar
        </Button>
      </form>
    </main>
  )
}
