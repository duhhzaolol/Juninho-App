'use client'

import { useRef, useState } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'

interface StepperProps {
  value: number
  onChange: (v: number) => void
  step?: number
  min?: number
  suffix?: string
  disabled?: boolean
}

export function Stepper({ value, onChange, step = 2.5, min = 0, suffix = '', disabled }: StepperProps) {
  const dragRef = useRef<{ startY: number; startValue: number } | null>(null)
  const [dragging, setDragging] = useState(false)

  function clamp(v: number) {
    const rounded = Math.round(v / step) * step
    return Math.max(min, Math.round(rounded * 100) / 100)
  }

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (disabled) return
    dragRef.current = { startY: e.clientY, startValue: value }
    setDragging(true)
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragRef.current || disabled) return
    const deltaY = dragRef.current.startY - e.clientY
    const steps = Math.round(deltaY / 18)
    const newValue = clamp(dragRef.current.startValue + steps * step)
    if (newValue !== value) onChange(newValue)
  }

  function handlePointerUp() {
    dragRef.current = null
    setDragging(false)
  }

  return (
    <div className="flex flex-col items-center select-none">
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(clamp(value + step))}
        className="text-white/40 disabled:opacity-20 p-0.5"
      >
        <ChevronUp size={14} />
      </button>
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{ touchAction: 'none' }}
        className={`font-display font-bold text-sm text-white px-2 py-1 rounded-control cursor-ns-resize min-w-[52px] text-center ${
          dragging ? 'bg-white/10' : ''
        }`}
      >
        {value}
        {suffix && <span className="text-[9px] text-white/40 ml-0.5">{suffix}</span>}
      </div>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(clamp(value - step))}
        className="text-white/40 disabled:opacity-20 p-0.5"
      >
        <ChevronDown size={14} />
      </button>
    </div>
  )
}
