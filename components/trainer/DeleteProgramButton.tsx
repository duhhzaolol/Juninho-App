'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'

// Botão "Excluir" do programa, com confirmação na própria tela.
// lockedReason: quando o programa é semana de uma planilha, explica por que não dá para excluir.
export function DeleteProgramButton({
  programId,
  programName,
  lockedReason,
}: {
  programId: string
  programName: string
  lockedReason?: string | null
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function remove() {
    setLoading(true)
    setError('')
    const res = await fetch(`/api/programs/${programId}`, { method: 'DELETE' })
    if (res.ok) {
      router.push('/app/trainer/treinos')
      router.refresh()
      return
    }
    setLoading(false)
    const data = await res.json().catch(() => ({}))
    if (data.error === 'in_product') {
      const list = (data.products as { name: string; week: number }[]).map((p) => `${p.name} (semana ${p.week})`).join(', ')
      setError(`Este programa é usado na planilha ${list}. Tire ele da planilha antes de excluir.`)
    } else {
      setError('Não deu para excluir agora. Tente de novo.')
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-red-400/80 text-sm"
      >
        <Trash2 size={14} /> Excluir
      </button>

      {open && (
        <div className="basis-full bg-red-500/10 border border-red-500/30 rounded-control p-4 mt-1">
          {lockedReason ? (
            <>
              <p className="text-sm text-white">Não dá para excluir este programa</p>
              <p className="text-xs text-white/60 mt-1">{lockedReason}</p>
              <button type="button" onClick={() => setOpen(false)} className="text-sm text-white/60 mt-3">
                Entendi
              </button>
            </>
          ) : (
            <>
              <p className="text-sm text-white">Excluir “{programName}”?</p>
              <p className="text-xs text-white/60 mt-1">
                Os treinos dele saem junto. Se alguma aluna já está com esse programa, ela continua com os treinos até você
                trocar o programa dela.
              </p>
              {error && <p className="text-xs text-red-300 mt-2">{error}</p>}
              <div className="flex items-center gap-3 mt-3">
                <button
                  type="button"
                  onClick={remove}
                  disabled={loading}
                  className="bg-red-500 text-white text-sm font-display font-semibold px-4 py-2 rounded-control disabled:opacity-60"
                >
                  {loading ? 'Excluindo...' : 'Excluir programa'}
                </button>
                <button type="button" onClick={() => setOpen(false)} className="text-sm text-white/60">
                  Cancelar
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  )
}
