import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { EditProfileForm } from '@/components/student/EditProfileForm'

export default async function EditProfilePage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const student = await prisma.studentProfile.findUnique({
    where: { userId: session.user.id },
    include: { user: true },
  })
  if (!student) redirect('/login')

  return (
    <EditProfileForm
      initial={{
        name: student.user.name,
        goal: student.goal ?? '',
        weightKg: student.weightKg ?? undefined,
        heightCm: student.heightCm ?? undefined,
        age: student.age ?? undefined,
        level: student.level ?? '',
      }}
    />
  )
}
