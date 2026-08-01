export function ProgressBar({ value, color = 'gold' }: { value: number; color?: 'gold' | 'purple' | 'green' }) {
  const fill = { gold: 'bg-gold', purple: 'bg-purple', green: 'bg-green-400' }[color]

  return (
    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mt-3">
      <div className={`h-full ${fill} rounded-full`} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  )
}
