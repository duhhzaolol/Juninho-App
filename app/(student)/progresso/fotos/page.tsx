import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { BottomNav } from '@/components/student/BottomNav'

export default async function PhotoHistoryPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const student = await prisma.studentProfile.findUnique({
    where: { userId: session.user.id },
    include: { progressPhotos: { orderBy: { date: 'desc' } } },
  })
  if (!student) redirect('/login')

  return (
    <main className="min-h-screen bg-navy pb-28 px-5 pt-8">
      <Link href="/progresso" className="text-white/50 flex items-center gap-1 text-sm mb-6">
        <ChevronLeft size={18} /> Progresso
      </Link>

      <p className="font-display font-bold text-xl text-white mb-1">Histórico de fotos</p>
      <p className="text-xs text-white/40 mb-6">{student.progressPhotos.length} foto(s) registrada(s)</p>

      <div className="grid grid-cols-2 gap-3">
        {student.progressPhotos.map((photo) => (
          <div key={photo.id} className="flex flex-col gap-1.5">
            <div className="w-full aspect-[3/4] rounded-control bg-navy-light border border-white/10 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.url} alt={`Foto de ${photo.date.toLocaleDateString('pt-BR')}`} className="w-full h-full object-cover" />
            </div>
            <span className="text-[11px] text-white/40 text-center">{photo.date.toLocaleDateString('pt-BR')}</span>
          </div>
        ))}
      </div>

      {student.progressPhotos.length === 0 && (
        <p className="text-white/40 text-sm">Nenhuma foto registrada ainda.</p>
      )}

      <BottomNav />
    </main>
  )
}
