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

  const student = await prisma.studentProfile.findUnique({ where: { userId: session.user.id } })
  if (!student) return NextResponse.json({ error: 'not a student' }, { status: 403 })

  // Sempre cria um novo registro — nunca sobrescreve, assim guarda o histórico
  // completo (com data), útil tanto pra progressão quanto pra marketing depois.
  const created = await prisma.progressPhoto.create({
    data: { studentId: student.id, tag: tag ?? 'atual', url },
  })

  return NextResponse.json(created)
}
