import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { name, goal, weightKg, heightCm, age, level } = await req.json()

  const student = await prisma.studentProfile.findUnique({ where: { userId: session.user.id } })
  if (!student) return NextResponse.json({ error: 'not a student' }, { status: 403 })

  if (name) {
    await prisma.user.update({ where: { id: session.user.id }, data: { name } })
  }

  const updated = await prisma.studentProfile.update({
    where: { id: student.id },
    data: { goal, weightKg, heightCm, age, level },
  })

  return NextResponse.json(updated)
}
