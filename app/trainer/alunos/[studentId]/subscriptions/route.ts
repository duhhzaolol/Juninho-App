import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request, { params }: { params: Promise<{ studentId: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { studentId } = await params
  const { planId, priceCents, renewsAt } = await req.json()

  const trainer = await prisma.trainerProfile.findUnique({ where: { userId: session.user.id } })
  if (!trainer) return NextResponse.json({ error: 'not a trainer' }, { status: 403 })

  // Confirma que o aluno é mesmo desse professor
  const student = await prisma.studentProfile.findFirst({ where: { id: studentId, trainerId: trainer.id } })
  if (!student) return NextResponse.json({ error: 'student not found' }, { status: 404 })

  // Encerra qualquer assinatura ativa anterior antes de criar a nova
  await prisma.subscription.updateMany({
    where: { studentId, status: 'active' },
    data: { status: 'expired' },
  })

  const subscription = await prisma.subscription.create({
    data: {
      studentId,
      planId,
      priceCents,
      renewsAt: new Date(renewsAt),
      status: 'active',
    },
  })

  return NextResponse.json(subscription)
}
