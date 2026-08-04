'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/trainer/Sidebar'
import { Button } from '@/components/ui/Button'
import { PillSelect } from '@/components/trainer/PillSelect'

const inputClass =
  'w-full bg-navy-light border border-white/10 rounded-control px-4 py-2.5 text-white placeholder:text-white/30 text-sm'

const types = [
  { value: 'PLANILHA', label: 'Planilha' },
  { value: 'CONSULTORIA', label: 'Consultoria' },
  { value: 'PROGRAMA', label: 'Programa' },
  { value: 'CURSO', label: 'Curso' },
]

const billingLabels: Record<string, string> = {
  RECORRENTE: 'Recorrente (mensal)',
  UNICA: 'Compra única',
  INFLUENCER: 'Parceria com influencer',
}

export default function NewPlanPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [type, setType] = useState('PLANILHA')
  const [billingType, setBillingType] = useState('')
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const res = await fetch('/api/plans', {
      method: 'POST',
      body: JSON.stringify({
        type,
        billingType,
        name,
        priceCents: Math.round(parseFloat(price.replace(',', '.')) * 100),
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

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs text-white/40 mb-1.5 block">Categoria</label>
            <select className={inputClass} value={type} onChange={(e) => setType(e.target.value)}>
              {types.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-white/40 mb-1.5 block">Tipo de cobrança</label>
            <PillSelect
              options={Object.values(billingLabels)}
              value={billingLabels[billingType] ?? ''}
              onChange={(label) => {
                const key = Object.entries(billingLabels).find(([, v]) => v === label)?.[0] ?? ''
                setBillingType(key)
              }}
            />
          </div>

          <div>
            <label className="text-xs text-white/40 mb-1.5 block">Nome do plano</label>
            <input required placeholder="Ex: Planilha Glúteos 3D" className={inputClass}
              value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div>
            <label className="text-xs text-white/40 mb-1.5 block">Preço</label>
            <input required placeholder="Ex: 97,00" className={inputClass}
              value={price} onChange={(e) => setPrice(e.target.value)} />
          </div>

          <Button type="submit" loading={saving} disabled={!billingType} fullWidth className="mt-2">
            Criar plano
          </Button>
        </form>
      </main>
    </div>
  )
}
