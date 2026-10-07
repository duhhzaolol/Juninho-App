import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { setupGluteos3D } from '@/lib/programs/gluteos3d-setup'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

// Botão "Cadastrar Glúteos 3D completo" do painel (ver lib/programs/gluteos3d-setup.ts).
// Pode tocar de novo sem medo: semanas que já existem são puladas, nada é duplicado.
export async function POST() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const trainer = await prisma.trainerProfile.findUnique({ where: { userId: session.user.id } })
  if (!trainer) return NextResponse.json({ error: 'not a trainer' }, { status: 403 })

  try {
    return NextResponse.json(await setupGluteos3D(trainer.id))
  } catch (err) {
    console.error('[gluteos3d] cadastro falhou', err)
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
