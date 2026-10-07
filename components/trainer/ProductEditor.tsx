'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowDown, ArrowUp, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'

const inputClass =
  'w-full bg-navy border border-white/10 rounded-control px-3 py-2.5 text-white placeholder:text-white/30 text-sm'

type ProductForm = {
  id: string
  name: string
  slug: string
  category: string
  tagline: string
  description: string
  price: string
  oldPrice: string
  checkoutUrl: string
  tictoCodes: string
  unlockMode: string
  unlockDays: number
  status: string
  sortOrder: number
  weeks: string[]
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-wider text-white/40">{label}</span>
      <div className="mt-1">{children}</div>
      {hint && <span className="block text-[11px] text-white/30 mt-1">{hint}</span>}
    </label>
  )
}

export function ProductEditor({ product, programs }: { product: ProductForm; programs: { id: string; name: string }[] }) {
  const router = useRouter()
  const [f, setF] = useState<ProductForm>(product)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const set = <K extends keyof ProductForm>(k: K, v: ProductForm[K]) => setF((x) => ({ ...x, [k]: v }))

  function moveWeek(i: number, dir: -1 | 1) {
    const w = [...f.weeks]
    const j = i + dir
    if (j < 0 || j >= w.length) return
    ;[w[i], w[j]] = [w[j], w[i]]
    set('weeks', w)
  }

  async function save() {
    setSaving(true)
    setMsg(null)
    const res = await fetch(`/api/products/${f.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ ...f, weeks: f.weeks.filter(Boolean).map((programId) => ({ programId })) }),
    })
    setSaving(false)
    if (res.ok) {
      setMsg({ ok: true, text: 'Planilha salva.' })
      router.refresh()
      return
    }
    const data = await res.json().catch(() => ({}))
    setMsg({
      ok: false,
      text:
        data.error === 'publish_requirements'
          ? 'Para colocar à venda, a planilha precisa ter pelo menos uma semana e o link do checkout.'
          : data.error === 'slug_in_use'
            ? 'Esse endereço já é usado por outra planilha.'
            : 'Não deu para salvar. Tente de novo.',
    })
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-6">
        <p className="font-display font-bold text-xl text-white">{f.name || 'Planilha'}</p>
        <select className={`${inputClass} w-auto`} value={f.status} onChange={(e) => set('status', e.target.value)}>
          <option value="draft">Rascunho (não aparece)</option>
          <option value="soon">Em breve (aparece sem vender)</option>
          <option value="published">À venda</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Field label="Nome"><input className={inputClass} value={f.name} onChange={(e) => set('name', e.target.value)} /></Field>
        <Field label="Categoria" hint='Ex: "Glúteos". Aparece no card junto com o número de semanas.'>
          <input className={inputClass} value={f.category} onChange={(e) => set('category', e.target.value)} />
        </Field>
        <div className="md:col-span-2">
          <Field label="Frase curta" hint="Aparece no card da loja.">
            <input className={inputClass} value={f.tagline} onChange={(e) => set('tagline', e.target.value)} />
          </Field>
        </div>
        <div className="md:col-span-2">
          <Field label="Descrição" hint="Aparece na página da planilha, antes da compra.">
            <textarea rows={4} className={inputClass} value={f.description} onChange={(e) => set('description', e.target.value)} />
          </Field>
        </div>
        <Field label="Preço (R$)"><input className={inputClass} inputMode="decimal" value={f.price} onChange={(e) => set('price', e.target.value)} /></Field>
        <Field label="Preço riscado (R$)" hint="Opcional, o “de” da oferta.">
          <input className={inputClass} inputMode="decimal" value={f.oldPrice} onChange={(e) => set('oldPrice', e.target.value)} />
        </Field>
        <div className="md:col-span-2">
          <Field label="Link do checkout (Ticto)" hint="Ex: https://checkout.ticto.app/OA8E76744">
            <input className={inputClass} value={f.checkoutUrl} onChange={(e) => set('checkoutUrl', e.target.value)} />
          </Field>
        </div>
        <Field label="Código na Ticto" hint="O código do produto ou da oferta (o fim do link do checkout). Pode pôr mais de um, separados por vírgula.">
          <input className={inputClass} value={f.tictoCodes} onChange={(e) => set('tictoCodes', e.target.value)} />
        </Field>
        <Field label="Endereço no app" hint={`app.juninhomoro.com.br/planilhas/${f.slug}`}>
          <input className={inputClass} value={f.slug} onChange={(e) => set('slug', e.target.value)} />
        </Field>
      </div>

      <div className="bg-navy-light border border-white/10 rounded-card p-5 mb-6">
        <p className="font-display font-semibold text-white mb-3">Liberação das semanas</p>
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <select className={`${inputClass} md:w-auto`} value={f.unlockMode} onChange={(e) => set('unlockMode', e.target.value)}>
            <option value="WEEKLY">Uma semana nova a cada</option>
            <option value="ALL_AFTER">Semana 1 na compra, todas as outras depois de</option>
          </select>
          <div className="flex items-center gap-2">
            <input className={`${inputClass} w-20`} inputMode="numeric" value={f.unlockDays} onChange={(e) => set('unlockDays', Number(e.target.value.replace(/\D/g, '')) || 0)} />
            <span className="text-sm text-white/50">dias</span>
          </div>
        </div>
        <p className="text-[11px] text-white/30 mt-2">
          Deixe igual ou maior que o prazo de garantia da Ticto, para ninguém ver tudo e pedir reembolso.
        </p>
      </div>

      <div className="bg-navy-light border border-white/10 rounded-card p-5 mb-6">
        <p className="font-display font-semibold text-white mb-1">Semanas</p>
        <p className="text-xs text-white/40 mb-4">Escolha o programa semanal de cada semana, na ordem.</p>
        <div className="flex flex-col gap-2">
          {f.weeks.map((programId, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="font-display font-bold text-sm text-gold-light w-20 shrink-0">Semana {i + 1}</span>
              <select
                className={inputClass}
                value={programId}
                onChange={(e) => set('weeks', f.weeks.map((w, k) => (k === i ? e.target.value : w)))}
              >
                <option value="">Escolha um programa</option>
                {programs.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <button type="button" aria-label="Subir" onClick={() => moveWeek(i, -1)} className="text-white/40 p-1"><ArrowUp size={16} /></button>
              <button type="button" aria-label="Descer" onClick={() => moveWeek(i, 1)} className="text-white/40 p-1"><ArrowDown size={16} /></button>
              <button type="button" aria-label="Remover semana" onClick={() => set('weeks', f.weeks.filter((_, k) => k !== i))} className="text-red-400/70 p-1"><X size={16} /></button>
            </div>
          ))}
        </div>
        <button type="button" onClick={() => set('weeks', [...f.weeks, ''])} className="text-gold-light text-sm mt-3">
          + Adicionar semana
        </button>
      </div>

      {msg && <p className={`text-sm mb-3 ${msg.ok ? 'text-green-400' : 'text-red-400'}`}>{msg.text}</p>}
      <Button type="button" onClick={save} loading={saving}>Salvar planilha</Button>
    </div>
  )
}
