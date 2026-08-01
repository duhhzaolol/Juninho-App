const colorStyles: Record<string, string> = {
  gold: 'bg-gold/15 text-gold-light',
  purple: 'bg-purple/20 text-purple-light',
  green: 'bg-green-500/15 text-green-400',
  red: 'bg-red-500/15 text-red-400',
  gray: 'bg-white/10 text-white/60',
}

export function Badge({ color = 'gray', label }: { color?: 'gold' | 'purple' | 'green' | 'red' | 'gray'; label: string }) {
  return (
    <span className={`text-[11px] font-semibold px-3 py-1 rounded-full uppercase tracking-wide ${colorStyles[color]}`}>
      {label}
    </span>
  )
}
