import Link from 'next/link'
import { Sidebar } from '@/components/trainer/Sidebar'
import { SignOutButton } from '@/components/shared/SignOutButton'
import { User, KeyRound, ChevronRight } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-navy flex flex-col md:flex-row">
      <Sidebar />

      <main className="flex-1 px-6 py-8 max-w-md">
        <p className="font-display font-bold text-xl text-white mb-6">Configurações</p>

        <div className="flex flex-col gap-2 mb-6">
          <Link href="/trainer/perfil" className="flex items-center justify-between bg-navy-light border border-white/10 rounded-control px-4 py-3.5">
            <div className="flex items-center gap-3">
              <User size={18} className="text-white/50" />
              <span className="text-sm text-white">Editar perfil</span>
            </div>
            <ChevronRight size={16} className="text-white/30" />
          </Link>

          <Link href="/trainer/perfil/senha" className="flex items-center justify-between bg-navy-light border border-white/10 rounded-control px-4 py-3.5">
            <div className="flex items-center gap-3">
              <KeyRound size={18} className="text-white/50" />
              <span className="text-sm text-white">Trocar senha</span>
            </div>
            <ChevronRight size={16} className="text-white/30" />
          </Link>
        </div>

        <SignOutButton className="text-left bg-navy-light rounded-control px-4 py-3.5 text-sm text-red-400 block w-full" />
      </main>
    </div>
  )
}
