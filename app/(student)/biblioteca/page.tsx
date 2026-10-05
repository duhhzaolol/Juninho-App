import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ContentCard } from '@/components/shared/ContentCard'
import { BottomNav } from '@/components/student/BottomNav'

export default async function LibraryPage() {
  const session = await auth()

  const student = await prisma.studentProfile.findUnique({
    where: { userId: session?.user?.id },
    include: { trainer: true, subscriptions: { where: { status: 'active' }, include: { plan: true } } },
  })
  if (!student) return null

  const contents = await prisma.libraryContent.findMany({
    where: { trainerId: student.trainerId },
    orderBy: { category: 'asc' },
  })

  const unlockedPlanIds = new Set(student.subscriptions.map((s: { planId: string }) => s.planId))

  const byCategory = new Map<string, typeof contents>()
  for (const content of contents) {
    const key = content.category ?? 'Outros'
    byCategory.set(key, [...(byCategory.get(key) ?? []), content])
  }

  return (
    <main className="min-h-screen bg-navy pb-28 px-5 pt-8">
      <p className="font-display font-bold text-xl text-white mb-6">Biblioteca</p>

      {Array.from(byCategory.entries()).map(([category, items]) => (
        <div key={category} className="mb-6">
          <p className="text-[11px] uppercase tracking-wider text-gold-light mb-2">{category}</p>
          <div className="flex flex-col gap-2">
            {items.map((item) => (
              <ContentCard
                key={item.id}
                title={item.title}
                type={item.type}
                category={undefined}
                locked={!!item.requiredPlanId && !unlockedPlanIds.has(item.requiredPlanId)}
              />
            ))}
          </div>
        </div>
      ))}

      {contents.length === 0 && (
        <p className="text-white/40 text-sm">Seu professor ainda não adicionou conteúdos.</p>
      )}

      <BottomNav />
    </main>
  )
}
