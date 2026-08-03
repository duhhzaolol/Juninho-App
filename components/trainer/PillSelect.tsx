'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'

interface PillSelectProps {
  options: string[]
  value: string
  onChange: (value: string) => void
  allowOther?: boolean
}

export function PillSelect({ options, value, onChange, allowOther }: PillSelectProps) {
  const startsAsOther = allowOther && value !== '' && !options.includes(value)
  const [showOtherInput, setShowOtherInput] = useState(Boolean(startsAsOther))

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const selected = value === opt
          return (
            <button
              key={opt}
              type="button"
              onClick={() => {
                onChange(opt)
                setShowOtherInput(false)
              }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm border transition-colors ${
                selected
                  ? 'bg-gold/15 border-gold text-gold-light'
                  : 'bg-navy-light border-white/10 text-white/60'
              }`}
            >
              {selected && <Check size={13} />}
              {opt}
            </button>
          )
        })}

        {allowOther && (
          <button
            type="button"
            onClick={() => {
              setShowOtherInput(true)
              onChange('')
            }}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm border transition-colors ${
              showOtherInput
                ? 'bg-gold/15 border-gold text-gold-light'
                : 'bg-navy-light border-white/10 text-white/60'
            }`}
          >
            {showOtherInput && <Check size={13} />}
            Outro
          </button>
        )}
      </div>

      {allowOther && showOtherInput && (
        <input
          autoFocus
          placeholder="Especifique"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="mt-2 w-full bg-navy-light border border-white/10 rounded-control px-4 py-2.5 text-white placeholder:text-white/30 text-sm"
        />
      )}
    </div>
  )
}
