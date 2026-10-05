import Image from 'next/image'
import { SignOutButton } from '@/components/shared/SignOutButton'
import { Clock3 } from 'lucide-react'

export default function WaitingApprovalPage() {
  return (
    <main className="min-h-screen bg-navy flex flex-col justify-center items-center px-8 text-center">
      <Image src="/logo-jm.png" alt="JM" width={90} height={75} className="mb-6" />
      <div className="w-14 h-14 rounded-full bg-gold/15 flex items-center justify-center mb-4">
        <Clock3 size={26} className="text-gold-light" />
      </div>
      <p className="font-display font-bold text-xl text-white mb-2">Cadastro em análise</p>
      <p className="text-sm text-white/50 mb-8 max-w-xs">
        Seu professor ainda precisa aprovar seu acesso. Assim que isso acontecer, você recebe uma mensagem no WhatsApp e já pode usar o app normalmente.
      </p>
      <SignOutButton className="text-white/40 text-sm" />
    </main>
  )
}
