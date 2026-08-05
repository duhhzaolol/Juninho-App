'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { PillSelect } from '@/components/trainer/PillSelect'
import { MultiPillSelect } from '@/components/trainer/MultiPillSelect'

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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <p className="text-[11px] uppercase tracking-wider text-white/40 mb-2">{title}</p>
      {children}
    </div>
  )
}

export function ExerciseForm({ exerciseId, initial }: { exerciseId?: string; initial?: Partial<ExerciseFormData> }) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [muscleGroupOptions, setMuscleGroupOptions] = useState<string[]>([])
  const [equipmentOptions, setEquipmentOptions] = useState<string[]>([])
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

  const selectedMuscleGroups = form.muscleGroup ? form.muscleGroup.split(',').map((s) => s.trim()).filter(Boolean) : []

  useEffect(() => {
    fetch('/api/exercises/options')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.muscleGroups)) setMuscleGroupOptions(data.muscleGroups)
        if (Array.isArray(data.equipment)) setEquipmentOptions(data.equipment)
      })
  }, [])

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
    <form onSubmit={handleSubmit}>
      <Section title="Identificação">
        <input
          required
          placeholder="Nome do exercício"
          className={inputClass}
          value={form.name}
          onChange={(e) => update('name', e.target.value)}
        />
      </Section>

      <Section title="Grupo muscular">
        <MultiPillSelect
          options={muscleGroupOptions}
          values={selectedMuscleGroups}
          onChange={(values) => update('muscleGroup', values.join(', '))}
          allowOther
        />
      </Section>

      <Section title="Equipamento">
        <PillSelect
          options={equipmentOptions}
          value={form.equipment}
          onChange={(v) => update('equipment', v)}
          allowOther
        />
      </Section>

      <Section title="Mídia (opcional)">
        <div className="grid grid-cols-2 gap-3">
          <input placeholder="URL do vídeo (YouTube)" className={inputClass} value={form.videoUrl} onChange={(e) => update('videoUrl', e.target.value)} />
          <input placeholder="URL do GIF" className={inputClass} value={form.gifUrl} onChange={(e) => update('gifUrl', e.target.value)} />
        </div>
      </Section>

      <Section title="Detalhes (opcional)">
        <div className="flex flex-col gap-3">
          <textarea placeholder="Descrição" rows={2} className={inputClass} value={form.description} onChange={(e) => update('description', e.target.value)} />
          <textarea placeholder="Execução correta" rows={2} className={inputClass} value={form.correctForm} onChange={(e) => update('correctForm', e.target.value)} />
          <textarea placeholder="Erros comuns" rows={2} className={inputClass} value={form.commonMistakes} onChange={(e) => update('commonMistakes', e.target.value)} />
        </div>
      </Section>

      <Button type="submit" loading={saving} disabled={selectedMuscleGroups.length === 0} fullWidth>
        {isEditing ? 'Salvar alterações' : 'Salvar exercício'}
      </Button>
    </form>
  )
}
