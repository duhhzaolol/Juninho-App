'use client'

import { AreaChart, Area, XAxis, ResponsiveContainer, Tooltip } from 'recharts'

interface EvolutionChartProps {
  data: { date: string; value: number }[]
}

function LastPointDot(props: any) {
  const { cx, cy, index, dataLength } = props
  if (index !== dataLength - 1 || cx == null || cy == null) return null
  return (
    <g>
      <circle
        cx={cx}
        cy={cy}
        r={9}
        fill="#F5B300"
        opacity={0.25}
        className="animate-ping-slow"
        style={{ transformOrigin: `${cx}px ${cy}px` }}
      />
      <circle cx={cx} cy={cy} r={4} fill="#F5B300" stroke="#151430" strokeWidth={1.5} />
    </g>
  )
}

export function EvolutionChart({ data }: EvolutionChartProps) {
  return (
    <div className="h-40 -ml-2">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="goldFade" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F5B300" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#F5B300" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="date" stroke="#9B9FB5" fontSize={10} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{ background: '#151430', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }}
            labelStyle={{ color: '#9B9FB5' }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#F5B300"
            strokeWidth={2.5}
            fill="url(#goldFade)"
            dot={(props) => <LastPointDot key={props.index} {...props} dataLength={data.length} />}
            animationDuration={1800}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
