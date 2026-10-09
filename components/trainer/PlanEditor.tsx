'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { PillSelect } from '@/components/trainer/PillSelect'

const inputClass =
  'w-full bg-navy-light border border-white/10 rounded-control px-4 py-2.5 text-white placeholder:text-white/30 text-sm'

const TYPES = [
  { value: 'PLANILHA', label: 'Planilha' },
  { value: 'CONSULTORIA', label: 'Consultoria' },
  { value: 'PROGRAMA', label: 'Programa' },
  { value: 'CURSO', label: 'Curso' },
]

const BILLING: Record<string, string> = {
  RECORRENTE: 'Recorrente (mensal)',
  UNICA: 'Compra única',
  INFLUENCER: 'Parceria com influencer',
}

export type PlanForm = {
  id: string | null
  name: string
  type: string
  billingType: string
  price: string
  promoPrice: string
  promoStartsAt: string
  promoEndsAt: string
  productId: string
  subscribers: number
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="text-xs text-white/40 mb-1.5 block">{children}</label>
}

// Criar ou editar um plano: preço, promoção, planilha que ele libera e excluir
export function PlanEditor({ plan, products }: { plan: PlanForm; products: { id: string; name: string }[] }) {
  const router = useRouter()
  const [f, setF] = useState<PlanForm>(plan)
  const [hasPromo, setHasPromo] = useState(!!plan.promoPrice)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const set = <K extends keyof PlanForm>(k: K, v: PlanForm[K]) => setF((x) => ({ ...x, [k]: v }))
  const isNew = !f.id

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMsg(null)
    const body = {
      name: f.name,
      type: f.type,
      billingType: f.billingType,
      price: f.price,
      promoPrice: hasPromo ? f.promoPrice : null,
      promoStartsAt: hasPromo ? f.promoStartsAt : null,
      promoEndsAt: hasPromo ? f.promoEndsAt : null,
      productId: f.productId || null,
    }
    try {
      const res = await fetch(isNew ? '/api/plans' : `/api/plans/${f.id}`, {
        method: isNew ? 'POST' : 'PATCH',
        body: JSON.stringify(body),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error === 'missing fields' ? 'Preencha o nome e o preço.' : 'Não deu para salvar. Tente de novo.')
      if (isNew) {
        router.push('/app/trainer/planos')
        router.refresh()
        return
      }
      const product = products.find((p) => p.id === f.productId)
      setMsg({
        ok: true,
        text:
          data.grantedTo > 0 && product
            ? `Plano salvo. A planilha ${product.name} foi liberada para ${data.grantedTo} aluno(s) que já tinham este plano.`
            : 'Plano salvo.',
      })
      router.refresh()
    } catch (err) {
      setMsg({ ok: false, text: (err as Error).message })
    } finally {
      setSaving(false)
    }
  }

  async function remove() {
    setDeleting(true)
    const res = await fetch(`/api/plans/${f.id}`, { method: 'DELETE' })
    if (res.ok) {
      router.push('/app/trainer/planos')
      router.refresh()
      return
    }
    setDeleting(false)
    setMsg({ ok: false, text: 'Não deu para excluir agora. Tente de novo.' })
  }

  return (
    <form onSubmit={save} className="flex flex-col gap-4">
      <div>
        <Label>Nome do plano</Label>
        <input required placeholder="Ex: Planilha Glúteos 3D" className={inputClass} value={f.name} onChange={(e) => set('name', e.target.value)} />
      </div>

      <div>
        <Label>Categoria</Label>
        <select className={inputClass} value={f.type} onChange={(e) => set('type', e.target.value)}>
          {TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      <div>
        <Label>Tipo de cobrança</Label>
        <PillSelect
          options={Object.values(BILLING)}
          value={BILLING[f.billingType] ?? ''}
          onChange={(label) => set('billingType', Object.entries(BILLING).find(([, v]) => v === label)?.[0] ?? '')}
        />
      </div>

      <div>
        <Label>Preço cheio (R$)</Label>
        <input required inputMode="decimal" placeholder="Ex: 97,00" className={inputClass} value={f.price} onChange={(e) => set('price', e.target.value)} />
      </div>

      <div className="bg-navy-light/60 border border-white/10 rounded-control p-4">
        <label className="flex items-center justify-between gap-3 cursor-pointer">
          <span>
            <span className="block text-sm text-white">Promoção</span>
            <span className="block text-[11px] text-white/40">Preço menor por um tempo, ou para sempre.</span>
          </span>
          <input type="checkbox" className="w-5 h-5 accent-[#F5B300]" checked={hasPromo} onChange={(e) => setHasPromo(e.target.checked)} />
        </label>
        {hasPromo && (
          <div className="flex flex-col gap-3 mt-4">
            <div>
              <Label>Preço da promoção (R$)</Label>
              <input required inputMode="decimal" placeholder="Ex: 27,90" className={inputClass} value={f.promoPrice} onChange={(e) => set('promoPrice', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Começa em</Label>
                <input type="date" className={inputClass} value={f.promoStartsAt} onChange={(e) => set('promoStartsAt', e.target.value)} />
              </div>
              <div>
                <Label>Termina em</Label>
                <input type="date" className={inputClass} value={f.promoEndsAt} onChange={(e) => set('promoEndsAt', e.target.value)} />
              </div>
            </div>
            <p className="text-[11px] text-white/40">Deixe as datas em branco para a promoção valer sempre.</p>
          </div>
        )}
      </div>

      <div>
        <Label>Libera a planilha</Label>
        <select className={inputClass} value={f.productId} onChange={(e) => set('productId', e.target.value)}>
          <option value="">Nenhuma</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <p className="text-[11px] text-white/40 mt-1.5">
          Quando você registrar este plano para um aluno, a planilha é liberada na hora no app dele.
          {!isNew && f.subscribers > 0 && ' Ao salvar, quem já tem este plano também recebe.'}
        </p>
      </div>

      {msg && <p className={`text-xs ${msg.ok ? 'text-green-400' : 'text-red-400'}`}>{msg.text}</p>}

      <Button type="submit" loading={saving} disabled={!f.billingType} fullWidth className="mt-1">
        {isNew ? 'Criar plano' : 'Salvar plano'}
      </Button>

      {!isNew && (
        <div className="mt-4">
          {!confirmDelete ? (
            <button type="button" onClick={() => setConfirmDelete(true)} className="flex items-center gap-1.5 text-red-400/80 text-sm">
              <Trash2 size={14} /> Excluir plano
            </button>
          ) : (
            <div className="bg-red-500/10 border border-red-500/30 rounded-control p-4">
              <p className="text-sm text-white">Excluir “{f.name}”?</p>
              <p className="text-xs text-white/60 mt-1">
                {f.subscribers > 0
                  ? `Este plano já foi registrado para ${f.subscribers} aluno(s). Ele sai da lista de planos, mas o histórico deles fica guardado.`
                  : 'Ninguém tem este plano. Ele será apagado.'}
              </p>
              <div className="flex items-center gap-3 mt-3">
                <button
                  type="button"
                  onClick={remove}
                  disabled={deleting}
                  className="bg-red-500 text-white text-sm font-display font-semibold px-4 py-2 rounded-control disabled:opacity-60"
                >
                  {deleting ? 'Excluindo...' : 'Excluir plano'}
                </button>
                <button type="button" onClick={() => setConfirmDelete(false)} className="text-sm text-white/60">
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </form>
  )
}
