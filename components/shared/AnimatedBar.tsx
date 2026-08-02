'use client'

import { motion } from 'framer-motion'

interface AnimatedBarProps {
  percent: number
  color?: 'gold' | 'purple'
  delay?: number
}

export function AnimatedBar({ percent, color = 'gold', delay = 0 }: AnimatedBarProps) {
  const fill = color === 'gold' ? 'bg-gold' : 'bg-purple'
  const clamped = Math.min(100, Math.max(0, percent))

  return (
    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
      <motion.div
        className={`h-full ${fill} rounded-full`}
        initial={{ width: 0 }}
        animate={{ width: `${clamped}%` }}
        transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  )
}
