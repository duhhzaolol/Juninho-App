'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'

const inputClass =
  'w-full bg-navy-light border border-white/10 rounded-control px-4 py-3 text-white placeholder:text-white/30 text-sm'

export default function ChangePasswordPage() {
  const router = useRouter()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (newPassword.length < 6) {
      setError('A senha nova precisa ter pelo menos 6 caracteres.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('As senhas novas não são iguais.')
      return
    }

    setSaving(true)
    const res = await fetch('/api/profile/password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    })
    setSaving(false)

    if (res.ok) {
      router.push('/perfil')
    } else {
      const data = await res.json().catch(() => ({}))
      setError(data.error === 'wrong_password' ? 'Senha atual incorreta.' : 'Não deu pra trocar. Tenta de novo.')
    }
  }

  return (
    <main className="min-h-screen bg-navy px-5 pt-8 pb-10">
      <Link href="/perfil" className="text-white/50 flex items-center gap-1 text-sm mb-6">
        <ChevronLeft size={18} /> Perfil
      </Link>

      <p className="font-display font-bold text-xl text-white mb-6">Trocar senha</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="password"
          placeholder="Senha atual"
          className={inputClass}
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
        <input
          type="password"
          placeholder="Senha nova"
          className={inputClass}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <input
          type="password"
          placeholder="Confirmar senha nova"
          className={inputClass}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        {error && <p className="text-red-400 text-xs">{error}</p>}

        <Button type="submit" loading={saving} fullWidth className="mt-2">
          Salvar nova senha
        </Button>
      </form>
    </main>
  )
}
