import { prisma } from '@/lib/prisma'
import { Sidebar } from '@/components/trainer/Sidebar'
import { WeeklyProgramBuilder } from '@/components/trainer/WeeklyProgramBuilder'

export default async function EditWeeklyProgramPage({ params }: { params: Promise<{ programId: string }> }) {
  const { programId } = await params
  const program = await prisma.weeklyProgram.findUnique({
    where: { id: programId },
    include: { days: true },
  })
  if (!program) return null

  const initialSelection: Record<number, string> = {}
  for (const day of program.days) {
    if (day.workoutId) initialSelection[day.weekday] = day.workoutId
  }

  return (
    <div className="min-h-screen bg-navy flex flex-col md:flex-row">
      <Sidebar />
      <main className="flex-1 px-6 py-8 max-w-lg">
        <WeeklyProgramBuilder programId={program.id} initialName={program.name} initialSelection={initialSelection} />
      </main>
    </div>
  )
}
