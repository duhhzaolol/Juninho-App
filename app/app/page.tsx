import { redirectToAppHome } from '@/lib/app-home'

export const dynamic = 'force-dynamic'

// juninhomoro.com.br/app → abre o app de treinos (login ou Início)
export default async function AppEntryPage() {
  await redirectToAppHome()
  return null
}
