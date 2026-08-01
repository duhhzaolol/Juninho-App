'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/trainer/Sidebar'
import { Button } from '@/components/ui/Button'

const inputClass =
  'w-full bg-navy-light border border-white/10 rounded-control px-4 py-2.5 text-white placeholder:text-white/30 text-sm'

export default function NewExercisePage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '',
    muscleGroup: '',
    equipment: '',
    videoUrl: '',
    gifUrl: '',
    description: '',
    correctForm: '',
    commonMistakes: '',
  })

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const res = await fetch('/api/exercises', {
      method: 'POST',
      body: JSON.stringify(form),
    })
    setSaving(false)
    if (res.ok) router.push('/trainer/exercicios')
  }

  return (
    <div className="min-h-screen bg-navy flex flex-col md:flex-row">
      <Sidebar />

      <main className="flex-1 px-6 py-8 max-w-xl">
        <p className="font-display font-bold text-xl text-white mb-6">Novo exercício</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input required placeholder="Nome do exercício" className={inputClass}
            value={form.name} onChange={(e) => update('name', e.target.value)} />

          <div className="grid grid-cols-2 gap-3">
            <input required placeholder="Grupo muscular" className={inputClass}
              value={form.muscleGroup} onChange={(e) => update('muscleGroup', e.target.value)} />
            <input placeholder="Equipamento" className={inputClass}
              value={form.equipment} onChange={(e) => update('equipment', e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input placeholder="URL do vídeo" className={inputClass}
              value={form.videoUrl} onChange={(e) => update('videoUrl', e.target.value)} />
            <input placeholder="URL do GIF" className={inputClass}
              value={form.gifUrl} onChange={(e) => update('gifUrl', e.target.value)} />
          </div>

          <textarea placeholder="Descrição" rows={2} className={inputClass}
            value={form.description} onChange={(e) => update('description', e.target.value)} />
          <textarea placeholder="Execução correta" rows={2} className={inputClass}
            value={form.correctForm} onChange={(e) => update('correctForm', e.target.value)} />
          <textarea placeholder="Erros comuns" rows={2} className={inputClass}
            value={form.commonMistakes} onChange={(e) => update('commonMistakes', e.target.value)} />

          <Button type="submit" loading={saving} fullWidth className="mt-2">
            Salvar exercício
          </Button>
        </form>
      </main>
    </div>
  )
}
