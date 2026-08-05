export function LoadingSpinner() {
  return (
    <main className="min-h-screen bg-navy flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-full border-[3px] border-white/10 border-t-gold animate-spin" />
        <p className="text-xs text-white/30">Carregando...</p>
      </div>
    </main>
  )
}
