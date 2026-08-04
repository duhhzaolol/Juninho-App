import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const trainer = await prisma.trainerProfile.findUnique({ where: { userId: session.user.id } })
  if (!trainer) return NextResponse.json({ error: 'not a trainer' }, { status: 403 })

  const { title, type, category, url, requiredPlanId } = await req.json()

  const content = await prisma.libraryContent.create({
    data: {
      trainerId: trainer.id,
      title,
      type,
      category: category || null,
      url,
      requiredPlanId: requiredPlanId || null,
    },
  })

  return NextResponse.json(content)
}

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const trainer = await prisma.trainerProfile.findUnique({ where: { userId: session.user.id } })
  if (!trainer) return NextResponse.json({ error: 'not a trainer' }, { status: 403 })

  const contents = await prisma.libraryContent.findMany({ where: { trainerId: trainer.id } })
  return NextResponse.json(contents)
}
