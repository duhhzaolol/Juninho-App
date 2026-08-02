import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const trainer = await prisma.trainerProfile.findUnique({
    where: { userId: session.user.id },
    include: { user: true },
  })
  if (!trainer) return NextResponse.json({ error: 'not a trainer' }, { status: 403 })

  return NextResponse.json({ name: trainer.user.name, bio: trainer.bio, whatsapp: trainer.whatsapp })
}

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { name, bio, whatsapp } = await req.json()

  const trainer = await prisma.trainerProfile.findUnique({ where: { userId: session.user.id } })
  if (!trainer) return NextResponse.json({ error: 'not a trainer' }, { status: 403 })

  if (name) {
    await prisma.user.update({ where: { id: session.user.id }, data: { name } })
  }

  const updated = await prisma.trainerProfile.update({
    where: { id: trainer.id },
    data: { bio: bio || null, whatsapp: whatsapp || null },
  })

  return NextResponse.json(updated)
}
