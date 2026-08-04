import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hash } from 'bcryptjs'

export const dynamic = 'force-dynamic'

function generateTempPassword() {
  // Ex: "sol-4821" — fácil de ditar por WhatsApp/telefone
  const words = ['sol', 'foco', 'gado', 'leve', 'raio', 'zinc', 'vale', 'roda']
  const word = words[Math.floor(Math.random() * words.length)]
  const digits = Math.floor(1000 + Math.random() * 9000)
  return `${word}-${digits}`
}

export async function POST(req: Request, { params }: { params: Promise<{ studentId: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { studentId } = await params

  const trainer = await prisma.trainerProfile.findUnique({ where: { userId: session.user.id } })
  if (!trainer) return NextResponse.json({ error: 'not a trainer' }, { status: 403 })

  const student = await prisma.studentProfile.findFirst({
    where: { id: studentId, trainerId: trainer.id },
    include: { user: true },
  })
  if (!student) return NextResponse.json({ error: 'student not found' }, { status: 404 })

  const tempPassword = generateTempPassword()
  const passwordHash = await hash(tempPassword, 10)

  await prisma.user.update({ where: { id: student.userId }, data: { passwordHash } })

  return NextResponse.json({ tempPassword })
}
