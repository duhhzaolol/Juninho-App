interface Photo {
  tag: string
  url: string | null
}

export function PhotoComparison({ photos }: { photos: Photo[] }) {
  const tags = ['0', '30', '60', '90']

  return (
    <div className="grid grid-cols-4 gap-2">
      {tags.map((tag) => {
        const photo = photos.find((p) => p.tag === tag)
        return (
          <div key={tag} className="flex flex-col items-center gap-1">
            <div className="w-full aspect-[3/4] rounded-control bg-navy-light border border-white/10 flex items-center justify-center overflow-hidden">
              {photo?.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photo.url} alt={`Foto dia ${tag}`} className="w-full h-full object-cover" />
              ) : (
                <span className="text-white/20 text-[10px]">+</span>
              )}
            </div>
            <span className="text-[10px] text-white/40">{tag === '0' ? 'Antes' : `${tag} dias`}</span>
          </div>
        )
      })}
    </div>
  )
}
