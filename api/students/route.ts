import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hash } from 'bcryptjs'

function generateTempPassword() {
  const words = ['sol', 'foco', 'gado', 'leve', 'raio', 'zinc', 'vale', 'roda']
  const word = words[Math.floor(Math.random() * words.length)]
  const digits = Math.floor(1000 + Math.random() * 9000)
  return `${word}-${digits}`
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { name, email, goal, weightKg, heightCm, age, level } = await req.json()

  if (!name || !email) {
    return NextResponse.json({ error: 'missing fields' }, { status: 400 })
  }

  const trainer = await prisma.trainerProfile.findUnique({ where: { userId: session.user.id } })
  if (!trainer) return NextResponse.json({ error: 'not a trainer' }, { status: 403 })

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json({ error: 'email_in_use' }, { status: 409 })
  }

  const tempPassword = generateTempPassword()
  const passwordHash = await hash(tempPassword, 10)

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: 'STUDENT',
      studentProfile: {
        create: {
          trainerId: trainer.id,
          goal: goal || null,
          weightKg: weightKg || null,
          heightCm: heightCm || null,
          age: age || null,
          level: level || null,
        },
      },
    },
    include: { studentProfile: true },
  })

  return NextResponse.json({ studentId: user.studentProfile!.id, tempPassword })
}
