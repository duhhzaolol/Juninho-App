'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function DeleteExerciseButton({ exerciseId }: { exerciseId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleDelete() {
    if (!confirm('Excluir esse exercício? Não dá pra desfazer.')) return
    setLoading(true)
    setError('')
    const res = await fetch(`/api/exercises/${exerciseId}`, { method: 'DELETE' })
    setLoading(false)

    if (res.ok) {
      router.push('/trainer/exercicios')
      router.refresh()
    } else if (res.status === 409) {
      setError('Esse exercício está sendo usado em algum treino — remova ele dos treinos antes de excluir.')
    } else {
      setError('Não deu pra excluir. Tenta de novo.')
    }
  }

  return (
    <div>
      <button onClick={handleDelete} disabled={loading} className="text-red-400 text-xs">
        {loading ? 'Excluindo...' : 'Excluir exercício'}
      </button>
      {error && <p className="text-red-400 text-[11px] mt-1">{error}</p>}
    </div>
  )
}
