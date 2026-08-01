'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/trainer/Sidebar'
import { Button } from '@/components/ui/Button'

const inputClass =
  'w-full bg-navy-light border border-white/10 rounded-control px-4 py-2.5 text-white placeholder:text-white/30 text-sm'

const types = [
  { value: 'PLANILHA', label: 'Planilha' },
  { value: 'CONSULTORIA', label: 'Consultoria' },
  { value: 'PROGRAMA', label: 'Programa' },
  { value: 'CURSO', label: 'Curso' },
]

export default function NewPlanPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ type: 'PLANILHA', name: '', price: '' })

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const res = await fetch('/api/plans', {
      method: 'POST',
      body: JSON.stringify({
        type: form.type,
        name: form.name,
        priceCents: Math.round(parseFloat(form.price.replace(',', '.')) * 100),
      }),
    })
    setSaving(false)
    if (res.ok) router.push('/trainer/planos')
  }

  return (
    <div className="min-h-screen bg-navy flex flex-col md:flex-row">
      <Sidebar />

      <main className="flex-1 px-6 py-8 max-w-md">
        <p className="font-display font-bold text-xl text-white mb-6">Novo plano</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <select className={inputClass} value={form.type} onChange={(e) => update('type', e.target.value)}>
            {types.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>

          <input required placeholder="Nome do plano" className={inputClass}
            value={form.name} onChange={(e) => update('name', e.target.value)} />

          <input required placeholder="Preço (ex: 97,00)" className={inputClass}
            value={form.price} onChange={(e) => update('price', e.target.value)} />

          <Button type="submit" loading={saving} fullWidth className="mt-2">
            Criar plano
          </Button>
        </form>
      </main>
    </div>
  )
}
