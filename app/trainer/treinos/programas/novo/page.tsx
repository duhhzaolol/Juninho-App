import { Sidebar } from '@/components/trainer/Sidebar'
import { WeeklyWorkoutBuilder } from '@/components/trainer/WeeklyWorkoutBuilder'

export default function NewWeeklyProgramPage() {
  return (
    <div className="min-h-screen bg-navy flex flex-col md:flex-row">
      <Sidebar />
      <WeeklyWorkoutBuilder />
    </div>
  )
}
