export function LoadingSpinner() {
  return (
    <main className="min-h-screen bg-navy flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-24 h-20 flex items-center justify-center">
          <div className="absolute w-20 h-20 rounded-full bg-gold/40 blur-xl animate-logo-glow" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-jm.png"
            alt="Carregando"
            className="relative w-14 h-auto animate-logo-pulse"
          />
        </div>
        <p className="text-xs text-white/30">Carregando...</p>
      </div>
    </main>
  )
}
