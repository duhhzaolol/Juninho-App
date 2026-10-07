import { gluteos3dStatus } from '@/lib/programs/gluteos3d-setup'
import { Gluteos3DSetup } from '@/components/trainer/SeedGluteos3DButton'

// Mostra o cartão "Glúteos 3D completo" enquanto as 6 semanas ou a planilha ainda não existem.
export async function Gluteos3DSetupCard({ trainerId }: { trainerId: string }) {
  const status = await gluteos3dStatus(trainerId)
  return <Gluteos3DSetup weeksReady={status.weeksReady} totalWeeks={status.totalWeeks} complete={status.complete} />
}
