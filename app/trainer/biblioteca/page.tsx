import Link from 'next/link'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Sidebar } from '@/components/trainer/Sidebar'
import { ContentCard } from '@/components/shared/ContentCard'

export default async function TrainerLibraryPage() {
  const session = await auth()
  const trainer = await prisma.trainerProfile.findUnique({ where: { userId: session?.user?.id } })
  if (!trainer) return null

  const contents = await prisma.libraryContent.findMany({
    where: { trainerId: trainer.id },
    orderBy: { category: 'asc' },
  })

  return (
    <div className="min-h-screen bg-navy flex flex-col md:flex-row">
      <Sidebar />

      <main className="flex-1 px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <p className="font-display font-bold text-xl text-white">Biblioteca</p>
          <Link href="/trainer/biblioteca/novo" className="text-gold-light text-sm">+ Novo conteúdo</Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {contents.map((item) => (
            <ContentCard
              key={item.id}
              title={item.title}
              type={item.type}
              category={item.category}
              locked={!!item.requiredPlanId}
            />
          ))}
        </div>

        {contents.length === 0 && (
          <p className="text-white/40 text-sm">Nenhum conteúdo publicado ainda.</p>
        )}
      </main>
    </div>
  )
}
