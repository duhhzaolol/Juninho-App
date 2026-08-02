'use client'

import { LineChart, Line, XAxis, ResponsiveContainer, Tooltip } from 'recharts'

interface EvolutionChartProps {
  data: { date: string; value: number }[]
}

export function EvolutionChart({ data }: EvolutionChartProps) {
  return (
    <div className="h-40 -ml-2">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="date" stroke="#9B9FB5" fontSize={10} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{ background: '#151430', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }}
            labelStyle={{ color: '#9B9FB5' }}
          />
          <Line type="monotone" dataKey="value" stroke="#F5B300" strokeWidth={2.5} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
