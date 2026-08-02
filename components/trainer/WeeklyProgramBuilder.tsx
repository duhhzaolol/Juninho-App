'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'

const weekdays = [
  { value: 1, label: 'Segunda-feira' },
  { value: 2, label: 'Terça-feira' },
  { value: 3, label: 'Quarta-feira' },
  { value: 4, label: 'Quinta-feira' },
  { value: 5, label: 'Sexta-feira' },
  { value: 6, label: 'Sábado' },
  { value: 0, label: 'Domingo' },
]

interface Workout {
  id: string
  name: string
}

interface WeeklyProgramBuilderProps {
  programId?: string
  initialName?: string
  initialSelection?: Record<number, string>
}

export function WeeklyProgramBuilder({ programId, initialName = '', initialSelection = {} }: WeeklyProgramBuilderProps) {
  const router = useRouter()
  const [name, setName] = useState(initialName)
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [selection, setSelection] = useState<Record<number, string>>(initialSelection)
  const [saving, setSaving] = useState(false)

  const isEditing = Boolean(programId)

  useEffect(() => {
    fetch('/api/workouts').then((r) => r.json()).then((data) => {
      if (Array.isArray(data)) setWorkouts(data)
    })
  }, [])

  function setDay(weekday: number, workoutId: string) {
    setSelection((prev) => {
      const copy = { ...prev }
      if (workoutId) copy[weekday] = workoutId
      else delete copy[weekday]
      return copy
    })
  }

  async function handleSave() {
    setSaving(true)
    const days = Object.entries(selection).map(([weekday, workoutId]) => ({
      weekday: Number(weekday),
      workoutId,
    }))
    const res = await fetch(isEditing ? `/api/programs/${programId}` : '/api/programs', {
      method: isEditing ? 'PUT' : 'POST',
      body: JSON.stringify({ name, days }),
    })
    setSaving(false)
    if (res.ok) router.push('/trainer/treinos/programas')
  }

  return (
    <>
      <Link href="/trainer/treinos/programas" className="text-white/50 flex items-center gap-1 text-sm mb-4">
        <ChevronLeft size={18} /> Programas
      </Link>

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nome do programa (ex: Hipertrofia 4x semana)"
        className="w-full bg-transparent font-display font-bold text-xl text-white placeholder:text-white/30 outline-none mb-1 border-b border-white/10 pb-2"
      />
      <p className="text-xs text-white/40 mb-6">Escolha qual treino cai em cada dia da semana.</p>

      <div className="flex flex-col gap-3">
        {weekdays.map((day) => (
          <div key={day.value} className="bg-navy-light border border-white/10 rounded-control p-3">
            <p className="text-xs text-white/50 mb-2">{day.label}</p>
            <select
              className="w-full bg-navy border border-white/10 rounded-control px-3 py-2 text-white text-sm"
              value={selection[day.value] ?? ''}
              onChange={(e) => setDay(day.value, e.target.value)}
            >
              <option value="">Descanso / sem treino</option>
              {workouts.map((w) => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          </div>
        ))}

        <Button onClick={handleSave} loading={saving} disabled={!name} fullWidth className="mt-3">
          {isEditing ? 'Salvar alterações' : 'Fechar programa'}
        </Button>
      </div>
    </>
  )
}
