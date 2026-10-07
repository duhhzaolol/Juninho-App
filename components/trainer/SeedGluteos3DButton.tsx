'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Sparkles, CheckCircle2 } from 'lucide-react'

type Result = {
  exercisesCreated: number
  workoutsCreated: string[]
  programsCreated: string[]
  productCreated: boolean
  productId: string | null
}

// Cartão "Glúteos 3D completo" do painel (Treinos, Planilhas e Programas semanais).
// Some sozinho quando as 6 semanas e a planilha já estão cadastradas.
export function Gluteos3DSetup({
  weeksReady,
  totalWeeks,
  complete,
}: {
  weeksReady: number
  totalWeeks: number
  complete: boolean
}) {
  const router = useRouter()
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [result, setResult] = useState<Result | null>(null)
  const [error, setError] = useState('')

  async function handleClick() {
    setState('loading')
    setError('')
    try {
      const res = await fetch('/api/workouts/seed-gluteos3d', { method: 'POST' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error ? `${data.error}` : `erro ${res.status}`)
      setResult(data)
      setState('done')
      router.refresh() // mostra as semanas novas na tela, sem perder esta mensagem
    } catch (err) {
      setError(err instanceof TypeError ? 'sem resposta do servidor' : (err as Error).message)
      setState('error')
    }
  }

  if (state === 'done' && result) {
    const weeks = result.programsCreated.length
    return (
      <div className="bg-green-500/10 border border-green-500/30 rounded-card p-5 mb-6 flex items-start gap-3">
        <CheckCircle2 size={22} className="text-green-400 shrink-0 mt-0.5" />
        <div className="min-w-0">
          <p className="font-display font-semibold text-white">Glúteos 3D cadastrado</p>
          <p className="text-xs text-white/60 mt-1">
            {weeks > 0
              ? `${weeks} semana(s) e ${result.workoutsCreated.length} treinos criados.`
              : 'As 6 semanas já estavam cadastradas. Nada foi duplicado.'}
            {result.productCreated && ' A planilha foi criada em Planilhas, como rascunho.'}
          </p>
          {result.productId && (
            <Link href={`/app/trainer/planilhas/${result.productId}`} className="inline-block text-sm text-gold-light mt-3">
              Abrir a planilha →
            </Link>
          )}
        </div>
      </div>
    )
  }

  if (complete) return null

  const text =
    weeksReady === 0
      ? 'Cadastra as 6 semanas (30 treinos, com os exercícios) e cria a planilha na loja, como rascunho. Leva poucos segundos.'
      : weeksReady < totalWeeks
        ? `Já tem ${weeksReady} de ${totalWeeks} semanas. Toque para completar: o que já existe não se repete.`
        : 'As 6 semanas já estão em Treinos. Falta só criar a planilha na loja.'

  return (
    <div className="bg-gradient-to-br from-purple-dark to-navy-light border border-gold/30 rounded-card p-5 mb-6 flex items-start gap-3">
      <span className="w-10 h-10 rounded-control bg-gold/15 flex items-center justify-center shrink-0">
        <Sparkles size={18} className="text-gold-light" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-display font-semibold text-white">Glúteos 3D completo</p>
        <p className="text-xs text-white/60 mt-1">{text}</p>
        <button
          onClick={handleClick}
          disabled={state === 'loading'}
          className="mt-4 bg-gold text-navy font-display font-semibold text-sm px-4 py-2.5 rounded-control disabled:opacity-60"
        >
          {state === 'loading'
            ? 'Cadastrando...'
            : weeksReady >= totalWeeks
              ? 'Criar a planilha'
              : 'Cadastrar as 6 semanas'}
        </button>
        {state === 'error' && (
          <p className="text-red-400 text-xs mt-3">
            Não deu certo agora ({error}). Toque de novo: o que já foi cadastrado não se repete.
          </p>
        )}
      </div>
    </div>
  )
}
