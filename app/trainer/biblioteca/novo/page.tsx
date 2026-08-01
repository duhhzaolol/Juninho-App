'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/trainer/Sidebar'
import { Button } from '@/components/ui/Button'

const inputClass =
  'w-full bg-navy-light border border-white/10 rounded-control px-4 py-2.5 text-white placeholder:text-white/30 text-sm'

const types = [
  { value: 'VIDEO', label: 'Vídeo' },
  { value: 'PDF', label: 'PDF' },
  { value: 'CURSO', label: 'Curso' },
  { value: 'EBOOK', label: 'E-book' },
  { value: 'DICA', label: 'Dica' },
]

export default function NewContentPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ title: '', type: 'VIDEO', category: '', url: '', requiredPlanId: '' })

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const res = await fetch('/api/library', { method: 'POST', body: JSON.stringify(form) })
    setSaving(false)
    if (res.ok) router.push('/trainer/biblioteca')
  }

  return (
    <div className="min-h-screen bg-navy flex flex-col md:flex-row">
      <Sidebar />

      <main className="flex-1 px-6 py-8 max-w-xl">
        <p className="font-display font-bold text-xl text-white mb-6">Novo conteúdo</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input required placeholder="Título" className={inputClass}
            value={form.title} onChange={(e) => update('title', e.target.value)} />

          <select className={inputClass} value={form.type} onChange={(e) => update('type', e.target.value)}>
            {types.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>

          <input placeholder="Categoria (ex: Mobilidade, Nutrição)" className={inputClass}
            value={form.category} onChange={(e) => update('category', e.target.value)} />

          <input required placeholder="URL do conteúdo" className={inputClass}
            value={form.url} onChange={(e) => update('url', e.target.value)} />

          <input placeholder="ID do plano exigido (opcional — deixe em branco se for aberto a todos)" className={inputClass}
            value={form.requiredPlanId} onChange={(e) => update('requiredPlanId', e.target.value)} />

          <Button type="submit" loading={saving} fullWidth className="mt-2">
            Publicar conteúdo
          </Button>
        </form>
      </main>
    </div>
  )
}
