'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/trainer/Sidebar'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    q: 'Como cadastro um novo aluno?',
    a: 'Vai em Alunos → "+ Novo aluno". Depois de cadastrar, aparece uma senha temporária pra você repassar pro aluno.',
  },
  {
    q: 'Como monto o treino da semana de um aluno?',
    a: 'Duas formas: crie um Programa semanal (Treinos → "+ Novo programa") e depois aplique ele no aluno em Alunos → [aluno] → Programa da semana. Ou monte manualmente, dia por dia, direto na tela do aluno.',
  },
  {
    q: 'O aluno esqueceu a senha, e agora?',
    a: 'Vai em Alunos → [aluno] → "Redefinir senha do aluno", no final da página. Gera uma senha nova na hora pra você repassar.',
  },
  {
    q: 'Como sei se um aluno está com a mensalidade atrasada?',
    a: 'Aparece um badge vermelho na lista de Alunos e na tela financeira de Planos. O próprio aluno também vê um aviso no Dashboard dele.',
  },
  {
    q: 'Dá pra reaproveitar um treino em vários alunos?',
    a: 'Sim — monte um Programa semanal uma vez e aplique em quantos alunos quiser, cada um pode ter ajustes próprios depois.',
  },
  {
    q: 'Como adiciono vídeo ou GIF num exercício?',
    a: 'Vai em Exercícios → escolhe o exercício → Editar exercício → cola o link do vídeo (YouTube) ou do GIF.',
  },
]

export default function HelpPage() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-navy flex flex-col md:flex-row">
      <Sidebar />

      <main className="flex-1 px-6 py-8 max-w-lg">
        <p className="font-display font-bold text-xl text-white mb-6">Ajuda</p>

        <div className="flex flex-col gap-2">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-navy-light border border-white/10 rounded-control overflow-hidden">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-4 py-3 text-left"
              >
                <span className="text-sm text-white">{faq.q}</span>
                <ChevronDown size={16} className={`text-white/40 shrink-0 transition-transform ${open === i ? 'rotate-180' : ''}`} />
              </button>
              {open === i && (
                <p className="px-4 pb-3 text-xs text-white/50">{faq.a}</p>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
