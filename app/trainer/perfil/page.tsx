'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { Sidebar } from '@/components/trainer/Sidebar'
import { Button } from '@/components/ui/Button'
import { SignOutButton } from '@/components/shared/SignOutButton'

const inputClass =
  'w-full bg-navy-light border border-white/10 rounded-control px-4 py-3 text-white placeholder:text-white/30 text-sm'

export default function TrainerProfilePage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', bio: '', whatsapp: '' })
  const [loaded, setLoaded] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/trainer/profile')
      .then((r) => r.json())
      .then((data) => {
        setForm({ name: data.name ?? '', bio: data.bio ?? '', whatsapp: data.whatsapp ?? '' })
        setLoaded(true)
      })
  }, [])

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await fetch('/api/trainer/profile', { method: 'PATCH', body: JSON.stringify(form) })
    setSaving(false)
    router.push('/trainer/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-navy flex flex-col md:flex-row">
      <Sidebar />

      <main className="flex-1 px-6 py-8 max-w-md">
        <Link href="/trainer/dashboard" className="text-white/50 flex items-center gap-1 text-sm mb-6">
          <ChevronLeft size={18} /> Dashboard
        </Link>

        <p className="font-display font-bold text-xl text-white mb-6">Editar perfil</p>

        {loaded && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div>
              <label className="text-xs text-white/40 mb-1 block">Nome</label>
              <input className={inputClass} value={form.name} onChange={(e) => update('name', e.target.value)} />
            </div>

            <div>
              <label className="text-xs text-white/40 mb-1 block">Bio</label>
              <textarea rows={2} className={inputClass} value={form.bio} onChange={(e) => update('bio', e.target.value)} />
            </div>

            <div>
              <label className="text-xs text-white/40 mb-1 block">WhatsApp (com DDI e DDD, ex: 5519999999999)</label>
              <input
                placeholder="5519999999999"
                className={inputClass}
                value={form.whatsapp}
                onChange={(e) => update('whatsapp', e.target.value.replace(/\D/g, ''))}
              />
              <p className="text-[11px] text-white/30 mt-1">
                É esse número que vira o botão "Falar com o professor" no app dos seus alunos.
              </p>
            </div>

            <Button type="submit" loading={saving} fullWidth className="mt-2">
              Salvar
            </Button>
          </form>
        )}

        <div className="mt-6 pt-6 border-t border-white/10">
          <SignOutButton className="text-left bg-navy-light rounded-control px-4 py-3 text-sm text-red-400 block w-full" />
        </div>
      </main>
    </div>
  )
}
