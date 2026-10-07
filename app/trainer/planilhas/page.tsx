import Link from 'next/link'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { currentTrainer } from '@/lib/trainer'
import { Sidebar } from '@/components/trainer/Sidebar'
import { Badge } from '@/components/ui/Badge'
import { NewProductButton } from '@/components/trainer/NewProductButton'
import { CopyField } from '@/components/trainer/CopyField'
import { tictoWebhookKey } from '@/lib/ticto'
import { emailEnabled } from '@/lib/email'
import { formatPrice } from '@/lib/store'

export const dynamic = 'force-dynamic'

const STATUS: Record<string, { label: string; color: 'gray' | 'purple' | 'green' }> = {
  draft: { label: 'Rascunho', color: 'gray' },
  soon: { label: 'Em breve', color: 'purple' },
  published: { label: 'À venda', color: 'green' },
}

const RESULT: Record<string, { label: string; color: 'green' | 'gray' | 'red' }> = {
  processed: { label: 'Processado', color: 'green' },
  ignored: { label: 'Ignorado', color: 'gray' },
  error: { label: 'Erro', color: 'red' },
}

export default async function TrainerProductsPage() {
  const trainer = await currentTrainer()
  if (!trainer) redirect('/app/login')

  const [products, logs] = await Promise.all([
    prisma.product.findMany({
      where: { trainerId: trainer.id },
      include: { _count: { select: { weeks: true } }, purchases: { where: { status: 'active' }, select: { id: true } } },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    }),
    prisma.webhookLog.findMany({ where: { source: 'ticto' }, orderBy: { createdAt: 'desc' }, take: 10 }),
  ])

  const h = await headers()
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? 'app.juninhomoro.com.br'
  const proto = h.get('x-forwarded-proto') ?? 'https'
  const webhookUrl = `${proto}://${host}/api/webhooks/ticto?key=${tictoWebhookKey()}`

  return (
    <div className="min-h-screen bg-navy flex flex-col md:flex-row">
      <Sidebar />

      <main className="flex-1 px-6 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-2">
          <p className="font-display font-bold text-xl text-white">Planilhas</p>
          <NewProductButton />
        </div>
        <p className="text-sm text-white/40 mb-6">
          Cada planilha é uma sequência de semanas. Cada semana é um programa semanal montado em Treinos → Programas.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-10">
          {products.map((p) => (
            <Link key={p.id} href={`/app/trainer/planilhas/${p.id}`} className="block bg-navy-light border border-white/10 rounded-control p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-white font-medium">{p.name}</p>
                <Badge color={STATUS[p.status]?.color ?? 'gray'} label={STATUS[p.status]?.label ?? p.status} />
              </div>
              <p className="text-xs text-white/40">
                {p._count.weeks} semana(s) · {formatPrice(p.priceCents)} · {p.purchases.length} compradora(s) ativa(s)
              </p>
            </Link>
          ))}
          {products.length === 0 && (
            <p className="text-white/40 text-sm">
              Nenhuma planilha ainda. O Glúteos 3D é criado pelo botão em Treinos → Programas semanais.
            </p>
          )}
        </div>

        <div className="bg-navy-light border border-white/10 rounded-card p-5 mb-6">
          <p className="font-display font-semibold text-white mb-1">Liberação automática pela Ticto</p>
          <p className="text-xs text-white/50 mb-4">
            Na Ticto, vá em Tictools → Webhooks → Adicionar. Cole o endereço abaixo, escolha a versão 2 e o formato JSON,
            marque todos os eventos e selecione os produtos. Depois cadastre o código do produto (ex: OA8E76744) em cada planilha.
          </p>
          <CopyField label="Endereço do webhook" value={webhookUrl} />
          <p className="text-xs mt-4 text-white/50">
            E-mail automático:{' '}
            {emailEnabled() ? (
              <span className="text-green-400">ligado (as compradoras recebem o link para criar a senha)</span>
            ) : (
              <span className="text-gold-light">desligado. Os links de acesso aparecem na tela de cada planilha para mandar pelo WhatsApp.</span>
            )}
          </p>
        </div>

        <p className="text-[11px] uppercase tracking-wider text-white/40 mb-2">Últimos avisos recebidos da Ticto</p>
        <div className="flex flex-col gap-2">
          {logs.map((log) => (
            <details key={log.id} className="bg-navy-light border border-white/10 rounded-control px-4 py-3">
              <summary className="flex items-center justify-between gap-3 cursor-pointer list-none">
                <span className="text-xs text-white/70 min-w-0 break-words">
                  {log.createdAt.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })} · {log.message}
                </span>
                <Badge color={RESULT[log.result]?.color ?? 'gray'} label={RESULT[log.result]?.label ?? log.result} />
              </summary>
              <pre className="mt-3 text-[11px] text-white/50 overflow-x-auto max-h-80">{JSON.stringify(log.payload, null, 2)}</pre>
            </details>
          ))}
          {logs.length === 0 && <p className="text-sm text-white/40">Nenhum aviso ainda. Use o botão de teste da Ticto depois de cadastrar o webhook.</p>}
        </div>
      </main>
    </div>
  )
}
