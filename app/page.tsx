import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { isLinksHost, redirectToAppHome } from '@/lib/app-home'
import { LinksPage, linksMetadata } from '@/components/links/LinksPage'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = linksMetadata

// juninhomoro.com.br → página de links
// app.juninhomoro.com.br → abre o app (login ou Início)
export default async function RootPage() {
  const h = await headers()
  if (isLinksHost(h.get('x-forwarded-host') ?? h.get('host'))) return <LinksPage />
  await redirectToAppHome()
  return null
}
