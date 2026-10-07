// Leitura dos avisos (webhooks) da Ticto.
// A Ticto não publica o formato do aviso, então a leitura é tolerante: procura e-mail, nome, telefone,
// status e código do pedido em qualquer lugar do JSON. Cada aviso fica guardado em WebhookLog para conferência.
import { createHash } from 'crypto'

// Chave secreta que vai no endereço do webhook (?key=...). É derivada do AUTH_SECRET, então não precisa configurar nada.
export function tictoWebhookKey() {
  return createHash('sha256').update(`${process.env.AUTH_SECRET ?? ''}:ticto-webhook`).digest('hex').slice(0, 28)
}

type Found = { path: string; key: string; value: unknown }

function walk(node: unknown, path: string, out: Found[]) {
  if (Array.isArray(node)) node.forEach((v, i) => walk(v, `${path}[${i}]`, out))
  else if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
      out.push({ path: `${path}.${k}`.toLowerCase(), key: k.toLowerCase(), value: v })
      walk(v, `${path}.${k}`, out)
    }
  }
}

const NOT_BUYER = /producer|produtor|affiliate|afiliado|coproduc|seller|vendedor|owner/

const APPROVED = ['authorized', 'approved', 'paid', 'aprovad', 'autorizad', 'venda realizada', 'venda_realizada', 'completed', 'pago', 'confirmed']
const REFUNDED = ['refund', 'reembols', 'chargeback', 'estorn', 'cancel', 'dispute', 'disputa', 'devolvid']
// status de espera ou recusa: nunca liberam nada (ex: "unpaid", "waiting_payment", "aguardando pagamento")
const NEUTRAL = ['unpaid', 'waiting', 'pending', 'aguardando', 'pendente', 'expired', 'expirad', 'refused', 'recusad', 'abandon', 'gerado', 'impresso']

export type TictoEvent = {
  kind: 'approved' | 'refunded' | 'other'
  statusText: string
  email: string | null
  name: string | null
  phone: string | null
  orderId: string | null
}

export function parseTicto(payload: unknown): TictoEvent {
  const all: Found[] = []
  walk(payload, '', all)
  const str = (v: unknown) => (typeof v === 'string' || typeof v === 'number' ? String(v).trim() : '')

  // status: campos chamados status / event / type
  const statuses = all
    .filter((f) => ['status', 'event', 'type', 'event_type', 'status_name', 'situacao'].includes(f.key))
    .map((f) => str(f.value).toLowerCase())
    .filter(Boolean)
  const statusText = statuses.join(' | ')
  const classify = (s: string) =>
    REFUNDED.some((t) => s.includes(t)) ? 'refunded' : NEUTRAL.some((t) => s.includes(t)) ? 'other' : APPROVED.some((t) => s.includes(t)) ? 'approved' : 'other'
  const kinds = statuses.map(classify)
  const kind: TictoEvent['kind'] = kinds.includes('refunded') ? 'refunded' : kinds.includes('approved') && !statuses.some((s) => NEUTRAL.some((t) => s.includes(t))) ? 'approved' : 'other'

  const isEmail = (v: unknown) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str(v))
  const buyerFirst = (a: Found, b: Found) => {
    const score = (f: Found) => (/customer|buyer|client|comprador|cliente/.test(f.path) ? 0 : 1)
    return score(a) - score(b)
  }
  const emails = all.filter((f) => f.key.includes('email') && isEmail(f.value) && !NOT_BUYER.test(f.path)).sort(buyerFirst)
  const email = emails[0] ? str(emails[0].value).toLowerCase() : null

  const names = all
    .filter((f) => ['name', 'nome', 'full_name', 'first_name'].includes(f.key) && str(f.value) && !NOT_BUYER.test(f.path))
    .filter((f) => /customer|buyer|client|comprador|cliente/.test(f.path))
  const name = names[0] ? str(names[0].value) : null

  let phone: string | null = null
  const phoneField = all.find((f) => /phone|telefone|celular|whatsapp/.test(f.key) && !NOT_BUYER.test(f.path))
  if (phoneField) {
    if (typeof phoneField.value === 'object' && phoneField.value) {
      phone = Object.values(phoneField.value as Record<string, unknown>).map(str).join('')
    } else phone = str(phoneField.value)
    phone = phone.replace(/\D/g, '') || null
  }

  const orderField = all.find(
    (f) => ['hash', 'order_hash', 'transaction_hash', 'code', 'order_id', 'transaction_id', 'id'].includes(f.key) &&
      /order|transaction|pedido|venda|sale/.test(f.path) && str(f.value)
  )
  const orderId = orderField ? str(orderField.value) : null

  return { kind, statusText, email, name, phone, orderId }
}

// A planilha bate com o aviso se algum código cadastrado (produto/oferta da Ticto) aparece no aviso
export function matchesProduct(rawPayload: string, tictoCodes: string | null) {
  if (!tictoCodes) return false
  const hay = rawPayload.toLowerCase()
  return tictoCodes
    .split(',')
    .map((c) => c.trim().toLowerCase())
    .filter((c) => c.length >= 3)
    .some((c) => hay.includes(c))
}
