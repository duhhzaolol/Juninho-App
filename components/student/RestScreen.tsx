interface RestScreenProps {
  seconds: number
  total: number
  nextLabel: string
  onSkip: () => void
}

export function RestScreen({ seconds, total, nextLabel, onSkip }: RestScreenProps) {
  const radius = 90
  const circumference = 2 * Math.PI * radius
  const pct = total > 0 ? seconds / total : 0
  const offset = circumference * (1 - pct)

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0')
  const ss = String(seconds % 60).padStart(2, '0')

  return (
    <div className="fixed inset-0 bg-navy z-50 flex flex-col items-center justify-center px-8">
      <p className="text-[11px] uppercase tracking-wider text-white/40 mb-8">Descanso</p>

      <div className="relative w-[220px] h-[220px] mb-8">
        <svg width="220" height="220" viewBox="0 0 220 220">
          <circle cx="110" cy="110" r={radius} stroke="rgba(255,255,255,0.08)" strokeWidth="12" fill="none" />
          <circle
            cx="110"
            cy="110"
            r={radius}
            stroke="#F5B300"
            strokeWidth="12"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform="rotate(-90 110 110)"
            style={{ transition: 'stroke-dashoffset 1s linear' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="font-display font-extrabold text-4xl text-white">{mm}:{ss}</p>
        </div>
      </div>

      <p className="text-xs text-white/40 mb-1">Próximo</p>
      <p className="text-sm text-white font-medium text-center mb-10">{nextLabel}</p>

      <button
        onClick={onSkip}
        className="text-xs text-white/40 underline underline-offset-4"
      >
        Pular descanso
      </button>
    </div>
  )
}
