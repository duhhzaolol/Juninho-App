import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { weightKg } = await req.json()
  if (typeof weightKg !== 'number' || weightKg <= 0) {
    return NextResponse.json({ error: 'invalid weight' }, { status: 400 })
  }

  const student = await prisma.studentProfile.findUnique({ where: { userId: session.user.id } })
  if (!student) return NextResponse.json({ error: 'not a student' }, { status: 403 })

  const entry = await prisma.progressEntry.create({
    data: { studentId: student.id, weightKg },
  })

  // Mantém o peso "oficial" do perfil em sincronia com o último registro
  await prisma.studentProfile.update({ where: { id: student.id }, data: { weightKg } })

  return NextResponse.json(entry)
}
