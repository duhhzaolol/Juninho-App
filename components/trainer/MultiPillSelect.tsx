'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'

interface MultiPillSelectProps {
  options: string[]
  values: string[]
  onChange: (values: string[]) => void
  allowOther?: boolean
}

export function MultiPillSelect({ options, values, onChange, allowOther }: MultiPillSelectProps) {
  const otherValue = allowOther ? values.find((v) => !options.includes(v)) ?? '' : ''
  const [showOtherInput, setShowOtherInput] = useState(Boolean(otherValue))

  function toggle(opt: string) {
    if (values.includes(opt)) {
      onChange(values.filter((v) => v !== opt))
    } else {
      onChange([...values, opt])
    }
  }

  function toggleOther() {
    if (showOtherInput) {
      onChange(values.filter((v) => options.includes(v)))
      setShowOtherInput(false)
    } else {
      setShowOtherInput(true)
    }
  }

  function updateOtherText(text: string) {
    const withoutOldOther = values.filter((v) => options.includes(v))
    onChange(text ? [...withoutOldOther, text] : withoutOldOther)
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const selected = values.includes(opt)
          return (
            <button
              key={opt}
              type="button"
              onClick={() => toggle(opt)}
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
            onClick={toggleOther}
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
          value={otherValue}
          onChange={(e) => updateOtherText(e.target.value)}
          className="mt-2 w-full bg-navy-light border border-white/10 rounded-control px-4 py-2.5 text-white placeholder:text-white/30 text-sm"
        />
      )}
    </div>
  )
}
