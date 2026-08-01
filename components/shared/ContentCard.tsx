const typeMeta: Record<string, { label: string; icon: string }> = {
  VIDEO: { label: 'Vídeo', icon: '▶' },
  PDF: { label: 'PDF', icon: '📄' },
  CURSO: { label: 'Curso', icon: '🎓' },
  EBOOK: { label: 'E-book', icon: '📘' },
  DICA: { label: 'Dica', icon: '💡' },
}

interface ContentCardProps {
  title: string
  type: string
  category?: string | null
  locked?: boolean
}

export function ContentCard({ title, type, category, locked }: ContentCardProps) {
  const meta = typeMeta[type] ?? { label: type, icon: '•' }

  return (
    <div className="flex items-center gap-3 bg-navy-light border border-white/10 rounded-control p-3">
      <div className="w-11 h-11 rounded-control bg-purple/20 flex items-center justify-center text-lg shrink-0">
        {meta.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white truncate">{title}</p>
        <p className="text-xs text-white/40">{meta.label}{category ? ` · ${category}` : ''}</p>
      </div>
      {locked && <span className="text-[10px] uppercase tracking-wide text-gold-light shrink-0">Plano</span>}
    </div>
  )
}
