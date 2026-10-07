import type { Metadata } from 'next'
import { LinksPage, linksMetadata } from '@/components/links/LinksPage'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = linksMetadata

// Mesma página que abre em juninhomoro.com.br. Aqui ela pode ser vista em qualquer domínio (ex: app.juninhomoro.com.br/links).
export default function LinksRoute() {
  return <LinksPage />
}
