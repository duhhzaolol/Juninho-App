'use client'

interface ShareCardProps {
  workoutName: string
  studentName: string
  timeLabel: string
  dateLabel: string
  totalSets: number
}

export function ShareCard({ workoutName, studentName, timeLabel, dateLabel, totalSets }: ShareCardProps) {
  return (
    <div
      id="share-card"
      className="relative w-[320px] h-[568px] overflow-hidden rounded-[28px]"
      style={{
        background: 'radial-gradient(120% 100% at 20% 0%, #3a1a7a 0%, #0f0923 55%), linear-gradient(180deg, #0f0923 0%, #151430 100%)',
      }}
    >
      {/* brilhos decorativos */}
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-gold/25 blur-3xl" />
      <div className="absolute bottom-20 -left-10 w-40 h-40 rounded-full bg-purple-light/30 blur-3xl" />

      <div className="relative h-full flex flex-col items-center justify-between px-7 py-9 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-jm.png" alt="JM" className="w-16 h-auto" crossOrigin="anonymous" />

        <div className="flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-gold/15 border border-gold/40 flex items-center justify-center mb-5 shadow-[0_0_40px_-6px_rgba(245,179,0,0.6)]">
            <span className="text-4xl">🔥</span>
          </div>

          <p className="text-[11px] uppercase tracking-[0.25em] text-gold-light mb-2">Treino concluído</p>
          <p className="font-display font-extrabold text-2xl text-white leading-tight mb-1 px-2">{workoutName}</p>
          <p className="text-xs text-white/40 mb-8">{studentName}</p>

          <div className="flex gap-8">
            <div>
              <p className="font-display font-bold text-3xl text-white">{timeLabel}</p>
              <p className="text-[10px] uppercase tracking-wider text-white/40 mt-1">Duração</p>
            </div>
            <div>
              <p className="font-display font-bold text-3xl text-white">{totalSets}</p>
              <p className="text-[10px] uppercase tracking-wider text-white/40 mt-1">Séries</p>
            </div>
          </div>
        </div>

        <div>
          <p className="text-sm text-white/70 italic mb-1">"Disciplina hoje, resultado amanhã."</p>
          <p className="text-[10px] text-white/30">{dateLabel} · JM Team</p>
        </div>
      </div>
    </div>
  )
}
