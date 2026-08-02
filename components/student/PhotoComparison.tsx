interface Photo {
  url: string
  date: Date
}

export function PhotoComparison({ photos }: { photos: Photo[] }) {
  const first = photos[0]
  const latest = photos.at(-1)

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="flex flex-col items-center gap-1.5">
        <div className="w-full aspect-[3/4] rounded-control bg-navy-light border border-white/10 flex items-center justify-center overflow-hidden">
          {first ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={first.url} alt="Foto antes" className="w-full h-full object-cover" />
          ) : (
            <span className="text-white/20 text-xs">+</span>
          )}
        </div>
        <span className="text-[10px] text-white/40">Antes{first ? ` · ${first.date.toLocaleDateString('pt-BR')}` : ''}</span>
      </div>

      <div className="flex flex-col items-center gap-1.5">
        <div className="w-full aspect-[3/4] rounded-control bg-navy-light border border-white/10 flex items-center justify-center overflow-hidden">
          {latest ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={latest.url} alt="Foto atual" className="w-full h-full object-cover" />
          ) : (
            <span className="text-white/20 text-xs">+</span>
          )}
        </div>
        <span className="text-[10px] text-white/40">Atual{latest ? ` · ${latest.date.toLocaleDateString('pt-BR')}` : ''}</span>
      </div>
    </div>
  )
}
