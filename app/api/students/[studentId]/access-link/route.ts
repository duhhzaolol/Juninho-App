import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { currentTrainer, whatsappLink } from '@/lib/trainer'
import { createPasswordLink } from '@/lib/tokens'
import { emailTemplates, sendEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'

// Gera um link para o aluno criar (ou trocar) a senha. Vale 7 dias e só pode ser usado uma vez.
export async function POST(req: Request, { params }: { params: Promise<{ studentId: string }> }) {
  const trainer = await currentTrainer()
  if (!trainer) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { studentId } = await params

  const student = await prisma.studentProfile.findFirst({ where: { id: studentId, trainerId: trainer.id }, include: { user: true } })
  if (!student) return NextResponse.json({ error: 'not found' }, { status: 404 })

  const { sendByEmail } = await req.json().catch(() => ({}))
  const link = await createPasswordLink(student.userId, new URL(req.url).origin)

  let emailSent = false
  if (sendByEmail) {
    const t = emailTemplates.invite(student.user.name, link)
    emailSent = await sendEmail(student.user.email, t.subject, t.html)
  }

  const text = `Oi, ${student.user.name.split(' ')[0]}! Aqui é o Juninho. Seu acesso ao app está pronto. Crie sua senha por este link (vale 7 dias): ${link}`
  return NextResponse.json({ link, emailSent, whatsapp: whatsappLink(student.whatsapp, text) })
}
