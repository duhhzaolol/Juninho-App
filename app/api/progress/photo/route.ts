import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { tag, url } = await req.json()
  if (typeof url !== 'string' || url.length > 400_000) {
    return NextResponse.json({ error: 'invalid image' }, { status: 400 })
  }
  if (!['0', '30', '60', '90'].includes(tag)) {
    return NextResponse.json({ error: 'invalid tag' }, { status: 400 })
  }

  const student = await prisma.studentProfile.findUnique({ where: { userId: session.user.id } })
  if (!student) return NextResponse.json({ error: 'not a student' }, { status: 403 })

  // Substitui a foto anterior desse marco (0/30/60/90), se já existir
  const existing = await prisma.progressPhoto.findFirst({ where: { studentId: student.id, tag } })
  if (existing) {
    await prisma.progressPhoto.update({ where: { id: existing.id }, data: { url, date: new Date() } })
  } else {
    await prisma.progressPhoto.create({ data: { studentId: student.id, tag, url } })
  }

  return NextResponse.json({ ok: true })
}
