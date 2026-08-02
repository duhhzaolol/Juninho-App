import { Sidebar } from '@/components/trainer/Sidebar'
import { WeeklyProgramBuilder } from '@/components/trainer/WeeklyProgramBuilder'

export default function NewWeeklyProgramPage() {
  return (
    <div className="min-h-screen bg-navy flex flex-col md:flex-row">
      <Sidebar />
      <main className="flex-1 px-6 py-8 max-w-lg">
        <WeeklyProgramBuilder />
      </main>
    </div>
  )
}
