'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'

export function WeightLogger() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const weightKg = Number(value.replace(',', '.'))
    if (!weightKg) return

    setSaving(true)
    await fetch('/api/progress/weight', {
      method: 'POST',
      body: JSON.stringify({ weightKg }),
    })
    setSaving(false)
    setOpen(false)
    setValue('')
    router.refresh()
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 text-gold-light text-xs font-display font-semibold"
      >
        <Plus size={14} /> Registrar peso
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        autoFocus
        inputMode="decimal"
        placeholder="Ex: 62,5"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="flex-1 bg-navy border border-white/10 rounded-control px-3 py-2 text-white text-sm placeholder:text-white/30"
      />
      <button
        type="submit"
        disabled={saving}
        className="text-xs font-display font-semibold px-4 py-2 rounded-control bg-gold text-navy"
      >
        {saving ? '...' : 'Salvar'}
      </button>
    </form>
  )
}
