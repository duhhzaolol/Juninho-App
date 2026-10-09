'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Check, Copy, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { GrantForm } from '@/components/trainer/GrantForm'
import { cn } from '@/lib/utils'

export type GrantStudent = { id: string; name: string; email: string; pending: boolean; has: boolean }

type Result =
  | { studentId: string; name: string; ok: true; alreadyHad: boolean; accessLink: string | null; emailSent: boolean; whatsapp: string }
  | { studentId: string; name: string; ok: false; error: string }

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

// "Liberar acesso" na tela da planilha: escolher alunos do app ou liberar por e-mail
export function GrantAccess({ productId, students }: { productId: string; students: GrantStudent[] }) {
  const [tab, setTab] = useState<'students' | 'email'>('students')

  return (
    <div>
      <div className="inline-flex bg-navy rounded-control p-1 mb-4">
        {[
          { key: 'students' as const, label: 'Alunos do app' },
          { key: 'email' as const, label: 'Por e-mail' },
        ].map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={cn(
              'px-4 py-2 rounded-control text-sm',
              tab === t.key ? 'bg-gold text-navy font-display font-semibold' : 'text-white/60'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'students' ? (
        <GrantToStudents productId={productId} students={students} />
      ) : (
        <>
          <p className="text-xs text-white/50 mb-3">
            Para quem ainda não tem conta no app. A conta é criada e a pessoa recebe um link para criar a senha.
          </p>
          <GrantForm productId={productId} />
        </>
      )}
    </div>
  )
}

function GrantToStudents({ productId, students }: { productId: string; students: GrantStudent[] }) {
  const router = useRouter()
  const [q, setQ] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [results, setResults] = useState<Result[] | null>(null)

  const list = useMemo(() => {
    const term = norm(q.trim())
    return term ? students.filter((s) => norm(`${s.name} ${s.email}`).includes(term)) : students
  }, [q, students])

  function toggle(id: string) {
    setSelected((cur) => {
      const next = new Set(cur)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function grant() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/products/${productId}/grant`, {
        method: 'POST',
        body: JSON.stringify({ studentIds: Array.from(selected) }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || `erro ${res.status}`)
      setResults(data.results)
      setSelected(new Set())
      router.refresh()
    } catch (err) {
      setError(`Não deu para liberar agora (${err instanceof TypeError ? 'sem resposta do servidor' : (err as Error).message}). Tente de novo.`)
    } finally {
      setLoading(false)
    }
  }

  if (results) {
    const done = results.filter((r) => r.ok && !r.alreadyHad).length
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-green-400">
          {done > 0 ? `Planilha liberada para ${done} aluno(s).` : 'Nenhuma liberação nova.'} A semana 1 já aparece no app.
        </p>
        <div className="flex flex-col gap-2">
          {results.map((r) => (
            <ResultRow key={r.studentId} result={r} />
          ))}
        </div>
        <button type="button" onClick={() => setResults(null)} className="text-white/50 text-sm self-start">
          Liberar para mais alunos
        </button>
      </div>
    )
  }

  if (students.length === 0) {
    return <p className="text-sm text-white/40">Nenhum aluno cadastrado ainda. Use a opção “Por e-mail”.</p>
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar aluno por nome ou e-mail"
          className="w-full bg-navy border border-white/10 rounded-control pl-9 pr-3 py-2.5 text-white placeholder:text-white/30 text-sm"
        />
      </div>

      <div className="max-h-80 overflow-y-auto flex flex-col gap-1.5 pr-1">
        {list.map((s) => {
          const checked = s.has || selected.has(s.id)
          return (
            <button
              key={s.id}
              type="button"
              disabled={s.has}
              onClick={() => toggle(s.id)}
              className={cn(
                'flex items-center gap-3 text-left rounded-control px-3 py-2.5 border',
                s.has
                  ? 'border-white/5 bg-white/[0.03] opacity-60'
                  : selected.has(s.id)
                    ? 'border-gold/50 bg-gold/10'
                    : 'border-white/10 bg-navy'
              )}
            >
              <span
                className={cn(
                  'w-5 h-5 rounded-md border flex items-center justify-center shrink-0',
                  checked ? 'bg-gold border-gold text-navy' : 'border-white/25'
                )}
              >
                {checked && <Check size={14} strokeWidth={3} />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm text-white truncate">{s.name}</span>
                <span className="block text-xs text-white/40 truncate">{s.email}</span>
              </span>
              {s.has ? (
                <span className="text-[11px] text-green-400 shrink-0">Já tem</span>
              ) : s.pending ? (
                <span className="text-[11px] text-white/40 shrink-0">Aguardando aprovação</span>
              ) : null}
            </button>
          )
        })}
        {list.length === 0 && <p className="text-sm text-white/40 px-1">Ninguém encontrado com “{q}”.</p>}
      </div>

      {error && <p className="text-red-400 text-xs">{error}</p>}

      <div>
        <Button type="button" size="sm" loading={loading} disabled={selected.size === 0} onClick={grant}>
          {selected.size === 0 ? 'Escolha os alunos' : `Liberar para ${selected.size} aluno(s)`}
        </Button>
      </div>
    </div>
  )
}

function ResultRow({ result: r }: { result: Result }) {
  const [copied, setCopied] = useState(false)

  if (!r.ok) {
    return (
      <div className="bg-navy border border-red-500/30 rounded-control px-3 py-2.5">
        <p className="text-sm text-white">{r.name}</p>
        <p className="text-xs text-red-400">Não deu para liberar: {r.error}</p>
      </div>
    )
  }

  async function copy(link: string) {
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      window.prompt('Copie o link:', link)
    }
  }

  return (
    <div className="bg-navy border border-white/10 rounded-control px-3 py-2.5 flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-white min-w-0 truncate">{r.name}</p>
        <span className={cn('text-[11px] shrink-0', r.alreadyHad ? 'text-white/40' : 'text-green-400')}>
          {r.alreadyHad ? 'Já tinha' : 'Liberada'}
        </span>
      </div>
      {r.accessLink ? (
        <>
          <p className="text-xs text-white/50">Ainda não criou a senha. Mande o link para ela entrar:</p>
          <div className="flex flex-wrap gap-2">
            <a
              href={r.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 bg-[#25D366]/15 border border-[#25D366]/30 text-[#25D366] rounded-control px-3 py-2 text-xs font-display font-semibold"
            >
              <MessageCircle size={14} /> Enviar no WhatsApp
            </a>
            <button
              type="button"
              onClick={() => copy(r.accessLink!)}
              className="flex items-center gap-1.5 border border-white/15 text-white/80 rounded-control px-3 py-2 text-xs"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copiado' : 'Copiar link'}
            </button>
          </div>
        </>
      ) : (
        !r.alreadyHad && (
          <a href={r.whatsapp} target="_blank" rel="noopener noreferrer" className="text-xs text-[#25D366] self-start">
            Avisar no WhatsApp
          </a>
        )
      )}
    </div>
  )
}
