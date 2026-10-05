import { prisma } from '@/lib/prisma'
import { Sidebar } from '@/components/trainer/Sidebar'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default async function StudentPhotoHistoryPage({ params }: { params: Promise<{ studentId: string }> }) {
  const { studentId } = await params

  const student = await prisma.studentProfile.findUnique({
    where: { id: studentId },
    include: { user: true, progressPhotos: { orderBy: { date: 'desc' } } },
  })
  if (!student) return null

  return (
    <div className="min-h-screen bg-navy flex flex-col md:flex-row">
      <Sidebar />

      <main className="flex-1 px-6 py-8 max-w-lg">
        <Link href={`/trainer/alunos/${studentId}`} className="text-white/50 flex items-center gap-1 text-sm mb-4">
          <ChevronLeft size={18} /> {student.user.name}
        </Link>

        <p className="font-display font-bold text-xl text-white mb-1">Histórico de fotos</p>
        <p className="text-xs text-white/40 mb-6">{student.progressPhotos.length} foto(s) registrada(s)</p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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
      </main>
    </div>
  )
}
