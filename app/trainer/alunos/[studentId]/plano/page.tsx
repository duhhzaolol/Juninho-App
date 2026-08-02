'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Sidebar } from '@/components/trainer/Sidebar'
import { Button } from '@/components/ui/Button'

const inputClass =
  'w-full bg-navy-light border border-white/10 rounded-control px-4 py-2.5 text-white placeholder:text-white/30 text-sm'

const durationPresets = [
  { label: '30 dias', days: 30 },
  { label: '45 dias', days: 45 },
  { label: '3 meses', days: 90 },
  { label: '6 meses', days: 180 },
]

interface Plan {
  id: string
  name: string
  type: string
  priceCents: number
}

export default function RegisterSubscriptionPage() {
  const router = useRouter()
  const params = useParams()
  const studentId = params.studentId as string

  const [plans, setPlans] = useState<Plan[]>([])
  const [selectedPlanId, setSelectedPlanId] = useState('')
  const [price, setPrice] = useState('')
  const [renewsAt, setRenewsAt] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/plans')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setPlans(data)
      })
  }, [])

  function applyPreset(days: number) {
    const d = new Date()
    d.setDate(d.getDate() + days)
    setRenewsAt(d.toISOString().slice(0, 10))
  }

  function handlePlanSelect(planId: string) {
    setSelectedPlanId(planId)
    const plan = plans.find((p) => p.id === planId)
    if (plan) setPrice((plan.priceCents / 100).toFixed(2).replace('.', ','))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const res = await fetch(`/api/students/${studentId}/subscriptions`, {
      method: 'POST',
      body: JSON.stringify({
        planId: selectedPlanId,
        priceCents: Math.round(parseFloat(price.replace(',', '.')) * 100),
        renewsAt,
      }),
    })
    setSaving(false)
    if (res.ok) router.push(`/trainer/alunos/${studentId}`)
  }

  return (
    <div className="min-h-screen bg-navy flex flex-col md:flex-row">
      <Sidebar />

      <main className="flex-1 px-6 py-8 max-w-md">
        <Link href={`/trainer/alunos/${studentId}`} className="text-white/50 text-sm mb-4 inline-block">
          ← Voltar
        </Link>
        <p className="font-display font-bold text-xl text-white mb-6">Registrar plano do aluno</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <label className="text-xs text-white/40">Plano</label>
          <select
            required
            className={inputClass}
            value={selectedPlanId}
            onChange={(e) => handlePlanSelect(e.target.value)}
          >
            <option value="">Selecione um plano</option>
            {plans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — {(p.priceCents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </option>
            ))}
          </select>

          <label className="text-xs text-white/40 mt-2">Valor combinado (pode ajustar se deu desconto)</label>
          <input
            required
            placeholder="Ex: 97,00"
            className={inputClass}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />

          <label className="text-xs text-white/40 mt-2">Vence em</label>
          <div className="flex gap-2 flex-wrap mb-1">
            {durationPresets.map((preset) => (
              <button
                key={preset.days}
                type="button"
                onClick={() => applyPreset(preset.days)}
                className="text-xs bg-navy-light border border-white/10 rounded-control px-3 py-1.5 text-white/70"
              >
                {preset.label}
              </button>
            ))}
          </div>
          <input
            required
            type="date"
            className={inputClass}
            value={renewsAt}
            onChange={(e) => setRenewsAt(e.target.value)}
          />

          <Button type="submit" loading={saving} fullWidth className="mt-3">
            Salvar
          </Button>
        </form>
      </main>
    </div>
  )
}
