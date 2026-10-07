// Mostra o vídeo ou GIF do exercício dentro do app.
// Aceita: link do YouTube (normal, youtu.be ou Shorts), Google Drive, Vimeo, ou arquivo de vídeo direto (.mp4).

type Media =
  | { kind: 'gif'; src: string }
  | { kind: 'iframe'; src: string; vertical: boolean }
  | { kind: 'video'; src: string }
  | { kind: 'link'; src: string }

export function parseVideoUrl(raw: string): Media {
  const url = raw.trim()
  let u: URL
  try {
    u = new URL(url)
  } catch {
    return { kind: 'link', src: url }
  }
  const host = u.hostname.replace(/^www\.|^m\./, '')

  // YouTube
  if (host === 'youtube.com' || host === 'youtu.be' || host === 'youtube-nocookie.com') {
    let id = ''
    let vertical = false
    if (host === 'youtu.be') id = u.pathname.slice(1)
    else if (u.pathname.startsWith('/shorts/')) {
      id = u.pathname.split('/')[2] ?? ''
      vertical = true
    } else if (u.pathname.startsWith('/embed/')) id = u.pathname.split('/')[2] ?? ''
    else id = u.searchParams.get('v') ?? ''
    id = id.split(/[?&#/]/)[0]
    if (id) {
      return {
        kind: 'iframe',
        src: `https://www.youtube-nocookie.com/embed/${id}?playsinline=1&rel=0&modestbranding=1&loop=1&playlist=${id}`,
        vertical,
      }
    }
  }

  // Google Drive: https://drive.google.com/file/d/ID/view
  if (host === 'drive.google.com') {
    const m = u.pathname.match(/\/file\/d\/([^/]+)/)
    const id = m?.[1] ?? u.searchParams.get('id')
    if (id) return { kind: 'iframe', src: `https://drive.google.com/file/d/${id}/preview`, vertical: true }
  }

  // Vimeo
  if (host === 'vimeo.com' || host === 'player.vimeo.com') {
    const id = u.pathname.split('/').filter(Boolean).pop()
    if (id && /^\d+$/.test(id)) return { kind: 'iframe', src: `https://player.vimeo.com/video/${id}?playsinline=1`, vertical: false }
  }

  if (/\.(mp4|webm|mov|m4v)$/i.test(u.pathname)) return { kind: 'video', src: url }
  if (/\.gif$/i.test(u.pathname)) return { kind: 'gif', src: url }

  return { kind: 'link', src: url }
}

export function ExerciseMedia({
  name,
  videoUrl,
  gifUrl,
  compact = false,
}: {
  name: string
  videoUrl: string | null
  gifUrl: string | null
  compact?: boolean
}) {
  if (gifUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={gifUrl} alt={name} className="w-full rounded-control bg-navy" />
  }

  if (!videoUrl) {
    return (
      <div
        className={`${compact ? 'h-24' : 'h-44'} rounded-control bg-navy border border-white/10 flex items-center justify-center text-white/25 text-xs text-center px-4`}
      >
        Vídeo em breve
      </div>
    )
  }

  const media = parseVideoUrl(videoUrl)

  if (media.kind === 'iframe') {
    return (
      <div
        className={`relative w-full overflow-hidden rounded-control bg-black mx-auto ${
          media.vertical ? `aspect-[9/16] ${compact ? 'max-w-[170px]' : 'max-w-[260px]'}` : 'aspect-video'
        }`}
      >
        <iframe
          src={media.src}
          title={`Vídeo: ${name}`}
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
          loading="lazy"
        />
      </div>
    )
  }

  if (media.kind === 'video') {
    return <video src={media.src} controls playsInline loop muted className="w-full rounded-control bg-black" />
  }

  if (media.kind === 'gif') {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={media.src} alt={name} className="w-full rounded-control bg-navy" />
  }

  return (
    <a
      href={media.src}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-center gap-2 h-24 rounded-control bg-navy border border-white/10 text-gold-light text-sm"
    >
      ▶ Ver vídeo do exercício
    </a>
  )
}
