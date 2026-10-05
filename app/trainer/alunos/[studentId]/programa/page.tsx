'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Sidebar } from '@/components/trainer/Sidebar'
import { Button } from '@/components/ui/Button'

const weekdays = [
  { value: 1, label: 'Segunda-feira' },
  { value: 2, label: 'Terça-feira' },
  { value: 3, label: 'Quarta-feira' },
  { value: 4, label: 'Quinta-feira' },
  { value: 5, label: 'Sexta-feira' },
]

interface Workout {
  id: string
  name: string
}

interface Program {
  id: string
  name: string
}

export default function WeeklyProgramPage() {
  const router = useRouter()
  const params = useParams()
  const studentId = params.studentId as string

  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [programs, setPrograms] = useState<Program[]>([])
  const [selection, setSelection] = useState<Record<number, string>>({})
  const [saving, setSaving] = useState(false)
  const [applying, setApplying] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('/api/workouts').then((r) => r.json()),
      fetch('/api/programs').then((r) => r.json()),
      fetch(`/api/students/${studentId}/schedule`).then((r) => r.json()),
    ]).then(([workoutsData, programsData, scheduleData]) => {
      if (Array.isArray(workoutsData)) setWorkouts(workoutsData)
      if (Array.isArray(programsData)) setPrograms(programsData)
      if (scheduleData?.schedule) {
        const map: Record<number, string> = {}
        for (const item of scheduleData.schedule) map[item.weekday] = item.workoutId
        setSelection(map)
      }
      setLoaded(true)
    })
  }, [studentId])

  async function applyProgram(programId: string) {
    if (!programId) return
    setApplying(true)
    const program = await fetch(`/api/programs/${programId}`).then((r) => r.json())
    const map: Record<number, string> = {}
    for (const day of program.days ?? []) {
      if (day.workoutId) map[day.weekday] = day.workoutId
    }
    setSelection(map)
    setApplying(false)
  }

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
    const schedule = Object.entries(selection).map(([weekday, workoutId]) => ({
      weekday: Number(weekday),
      workoutId,
    }))
    const res = await fetch(`/api/students/${studentId}/schedule`, {
      method: 'POST',
      body: JSON.stringify({ schedule }),
    })
    setSaving(false)
    if (res.ok) router.push(`/trainer/alunos/${studentId}`)
  }

  return (
    <div className="min-h-screen bg-navy flex flex-col md:flex-row">
      <Sidebar />

      <main className="flex-1 px-6 py-8 max-w-lg">
        <Link href={`/trainer/alunos/${studentId}`} className="text-white/50 text-sm mb-4 inline-block">
          ← Voltar
        </Link>
        <p className="font-display font-bold text-xl text-white mb-1">Programa da semana</p>
        <p className="text-xs text-white/40 mb-6">
          Escolha qual treino cai em cada dia. Sábado e domingo já ficam como descanso.
        </p>

        {loaded && (
          <div className="flex flex-col gap-3">
            {programs.length > 0 && (
              <div className="bg-purple-dark border border-purple-light/30 rounded-control p-3 mb-2">
                <p className="text-xs text-white/60 mb-2">Aplicar um programa pronto (você ainda pode ajustar antes de salvar)</p>
                <select
                  className="w-full bg-navy border border-white/10 rounded-control px-3 py-2 text-white text-sm"
                  onChange={(e) => applyProgram(e.target.value)}
                  disabled={applying}
                  defaultValue=""
                >
                  <option value="">Selecione um programa</option>
                  {programs.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            )}

            {weekdays.map((day) => (
              <div key={day.value} className="bg-navy-light border border-white/10 rounded-control p-3">
                <p className="text-xs text-white/50 mb-2">{day.label}</p>
                <select
                  className="w-full bg-navy border border-white/10 rounded-control px-3 py-2 text-white text-sm"
                  value={selection[day.value] ?? ''}
                  onChange={(e) => setDay(day.value, e.target.value)}
                >
                  <option value="">Sem treino</option>
                  {workouts.map((w) => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>
            ))}

            <div className="grid grid-cols-2 gap-3">
              {['Sábado', 'Domingo'].map((label) => (
                <div key={label} className="bg-white/5 border border-white/10 rounded-control p-3 text-center">
                  <p className="text-xs text-white/40 mb-1">{label}</p>
                  <p className="text-sm text-white/60">Descanso</p>
                </div>
              ))}
            </div>

            <Button onClick={handleSave} loading={saving} fullWidth className="mt-3">
              Salvar programa
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}
