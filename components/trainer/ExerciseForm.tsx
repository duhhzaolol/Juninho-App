'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'

const inputClass =
  'w-full bg-navy-light border border-white/10 rounded-control px-4 py-2.5 text-white placeholder:text-white/30 text-sm'

interface ExerciseFormData {
  name: string
  muscleGroup: string
  equipment: string
  videoUrl: string
  gifUrl: string
  description: string
  correctForm: string
  commonMistakes: string
}

export function ExerciseForm({ exerciseId, initial }: { exerciseId?: string; initial?: Partial<ExerciseFormData> }) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<ExerciseFormData>({
    name: initial?.name ?? '',
    muscleGroup: initial?.muscleGroup ?? '',
    equipment: initial?.equipment ?? '',
    videoUrl: initial?.videoUrl ?? '',
    gifUrl: initial?.gifUrl ?? '',
    description: initial?.description ?? '',
    correctForm: initial?.correctForm ?? '',
    commonMistakes: initial?.commonMistakes ?? '',
  })

  const isEditing = Boolean(exerciseId)

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const res = await fetch(isEditing ? `/api/exercises/${exerciseId}` : '/api/exercises', {
      method: isEditing ? 'PUT' : 'POST',
      body: JSON.stringify(form),
    })
    setSaving(false)
    if (res.ok) router.push(isEditing ? `/trainer/exercicios/${exerciseId}` : '/trainer/exercicios')
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div>
        <label className="text-xs text-white/40 mb-1 block">Nome do exercício</label>
        <input required className={inputClass} value={form.name} onChange={(e) => update('name', e.target.value)} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-white/40 mb-1 block">Grupo muscular</label>
          <input required className={inputClass} value={form.muscleGroup} onChange={(e) => update('muscleGroup', e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-white/40 mb-1 block">Equipamento</label>
          <input className={inputClass} value={form.equipment} onChange={(e) => update('equipment', e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-white/40 mb-1 block">URL do vídeo</label>
          <input className={inputClass} value={form.videoUrl} onChange={(e) => update('videoUrl', e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-white/40 mb-1 block">URL do GIF</label>
          <input className={inputClass} value={form.gifUrl} onChange={(e) => update('gifUrl', e.target.value)} />
        </div>
      </div>

      <div>
        <label className="text-xs text-white/40 mb-1 block">Descrição</label>
        <textarea rows={2} className={inputClass} value={form.description} onChange={(e) => update('description', e.target.value)} />
      </div>
      <div>
        <label className="text-xs text-white/40 mb-1 block">Execução correta</label>
        <textarea rows={2} className={inputClass} value={form.correctForm} onChange={(e) => update('correctForm', e.target.value)} />
      </div>
      <div>
        <label className="text-xs text-white/40 mb-1 block">Erros comuns</label>
        <textarea rows={2} className={inputClass} value={form.commonMistakes} onChange={(e) => update('commonMistakes', e.target.value)} />
      </div>

      <Button type="submit" loading={saving} fullWidth className="mt-2">
        {isEditing ? 'Salvar alterações' : 'Salvar exercício'}
      </Button>
    </form>
  )
}
