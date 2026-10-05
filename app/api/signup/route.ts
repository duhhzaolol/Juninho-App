import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hash } from 'bcryptjs'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const { name, email, password, whatsapp } = await req.json()

  if (!name || !email || !password) {
    return NextResponse.json({ error: 'missing fields' }, { status: 400 })
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json({ error: 'email_in_use' }, { status: 409 })
  }

  // Sistema de um único professor por enquanto — vincula ao primeiro cadastrado
  const trainer = await prisma.trainerProfile.findFirst()
  if (!trainer) return NextResponse.json({ error: 'no trainer available' }, { status: 500 })

  const passwordHash = await hash(password, 10)

  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: 'STUDENT',
      studentProfile: {
        create: {
          trainerId: trainer.id,
          whatsapp: whatsapp || null,
          status: 'pending',
        },
      },
    },
  })

  return NextResponse.json({ ok: true })
}
