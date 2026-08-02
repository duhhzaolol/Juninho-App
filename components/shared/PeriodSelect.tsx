'use client'

import { useRouter, usePathname } from 'next/navigation'
import { ChevronDown } from 'lucide-react'

const options = [
  { value: '7', label: 'Últimos 7 dias' },
  { value: '30', label: 'Últimos 30 dias' },
  { value: '90', label: 'Últimos 90 dias' },
]

export function PeriodSelect({ value }: { value: string }) {
  const router = useRouter()
  const pathname = usePathname()

  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => router.push(`${pathname}?days=${e.target.value}`)}
        className="w-full appearance-none bg-navy-light border border-white/10 rounded-control px-4 py-2.5 text-white text-sm"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
    </div>
  )
}
