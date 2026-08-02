import Link from 'next/link'
import { Dumbbell, Zap, Footprints, Activity } from 'lucide-react'

const categoryIcons: Record<string, any> = {
  gluteos: Zap,
  superiores: Dumbbell,
  ombro: Activity,
  pernas: Footprints,
  geral: Dumbbell,
}

const categoryLabels: Record<string, string> = {
  gluteos: 'Glúteos',
  superiores: 'Superiores',
  ombro: 'Ombro',
  pernas: 'Pernas',
  geral: 'Treino',
}

function detectCategory(text: string) {
  const t = text.toLowerCase()
  if (t.includes('glúte') || t.includes('glute')) return 'gluteos'
  if (t.includes('ombro')) return 'ombro'
  if (t.includes('perna') || t.includes('quadríceps') || t.includes('quadriceps') || t.includes('posterior')) return 'pernas'
  if (t.includes('superior') || t.includes('costas') || t.includes('peito') || t.includes('braço') || t.includes('bíceps')) return 'superiores'
  return 'geral'
}

interface WorkoutHeroCardProps {
  workoutId: string
  name: string
  goal?: string | null
  subtitle: string
}

export function WorkoutHeroCard({ workoutId, name, goal, subtitle }: WorkoutHeroCardProps) {
  const category = detectCategory(`${name} ${goal ?? ''}`)
  const Icon = categoryIcons[category]
  const label = categoryLabels[category]

  return (
    <Link
      href={`/treino/${workoutId}`}
      className="block relative overflow-hidden rounded-card p-5 mb-4 bg-gradient-to-br from-purple-dark via-purple to-navy-light border border-white/10"
    >
      <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full bg-white/5" />
      <div className="absolute right-3 bottom-3 opacity-15">
        <Icon size={80} strokeWidth={1} className="text-white" />
      </div>
      <div className="relative">
        <p className="text-[11px] uppercase tracking-wider text-gold-light mb-1">{label} · Seu plano atual</p>
        <p className="font-display font-bold text-xl text-white mb-1">{name}</p>
        <p className="text-xs text-white/60 mb-4">{subtitle}</p>
        <span className="inline-block font-display font-semibold text-xs bg-gold text-navy px-5 py-2.5 rounded-control">
          Ver plano →
        </span>
      </div>
    </Link>
  )
}
