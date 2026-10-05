import { Sidebar } from '@/components/trainer/Sidebar'
import { Sparkles } from 'lucide-react'
import { APP_VERSION } from '@/lib/version'

const novidades = [
  {
    title: 'Programa semanal unificado',
    desc: 'Criar um programa agora é um fluxo só: nomeia, vai dia por dia (Descanso/treino pronto/montar do zero) e salva tudo de uma vez.',
  },
  {
    title: 'Bloco com vários exercícios',
    desc: 'Biset, superserie e circuito agora aceitam quantos exercícios você quiser no mesmo bloco, alternando sem descanso entre eles.',
  },
  {
    title: 'Financeiro por tipo de cobrança',
    desc: 'Planos recorrentes, compra única e parceria com influencer, cada um com a data certa — e uma visão financeira geral de todos os alunos.',
  },
  {
    title: 'Avaliação pós-treino',
    desc: 'O aluno avalia o treino com estrelas + comentário ao terminar; você vê as últimas avaliações na tela de cada aluno.',
  },
  {
    title: 'Fotos Antes/Atual com histórico',
    desc: 'Toda troca de foto de progresso fica guardada com a data — nada se perde, útil pra comparações e marketing.',
  },
  {
    title: 'Treino flexível por dia',
    desc: 'Se o aluno pular um dia, pode fazer o treino de outro dia depois — o calendário registra certinho qual treino foi feito quando.',
  },
  {
    title: 'Cadastro de aluno pelo app',
    desc: 'Sem precisar de terminal: cadastra o aluno direto pela tela, com senha temporária gerada na hora.',
  },
  {
    title: 'Cards por programa',
    desc: 'Treinos organizados em cards por programa (ex: "Glúteos 3D"), com os 7 dias visíveis ao clicar.',
  },
]

export default function NovidadesPage() {
  return (
    <div className="min-h-screen bg-navy flex flex-col md:flex-row">
      <Sidebar />

      <main className="flex-1 px-6 py-8 max-w-lg">
        <p className="font-display font-bold text-xl text-white mb-1">Novidades</p>
        <p className="text-xs text-white/40 mb-6">Você está na {APP_VERSION}</p>

        <div className="flex flex-col gap-3">
          {novidades.map((n) => (
            <div key={n.title} className="bg-navy-light border border-white/10 rounded-control p-4">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles size={14} className="text-gold-light shrink-0" />
                <p className="text-sm text-white font-medium">{n.title}</p>
              </div>
              <p className="text-xs text-white/50">{n.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
