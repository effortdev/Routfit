import { MetricsEntry } from '../types'

interface Props {
  entries: MetricsEntry[]
}

// 작은 모바일 화면에 맞춘 심플 라인 차트 (외부 차트 라이브러리 없이 순수 SVG)
export default function MetricsTrendChart({ entries }: Props) {
  const width = 320
  const height = 140
  const padding = 24

  if (entries.length < 2) {
    return (
      <div className="bg-panel border border-line rounded-card p-6 text-center text-paper/40 text-sm">
        추이를 보려면 기록이 2일 이상 필요해요.
      </div>
    )
  }

  const weights = entries.map((e) => e.weightKg)
  const min = Math.min(...weights)
  const max = Math.max(...weights)
  const range = max - min || 1

  const points = entries.map((entry, i) => {
    const x = padding + (i / (entries.length - 1)) * (width - padding * 2)
    const y = height - padding - ((entry.weightKg - min) / range) * (height - padding * 2)
    return { x, y, entry }
  })

  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')

  return (
    <div className="bg-panel border border-line rounded-card p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-paper/70">체중 변화 추이</h3>
        <span className="text-xs font-mono text-moss">
          {weights[weights.length - 1].toFixed(1)}kg
        </span>
      </div>
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
        <path d={path} fill="none" stroke="#8fae76" strokeWidth={2} />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={i === points.length - 1 ? 4 : 2.5} fill="#8fae76" />
        ))}
      </svg>
      <div className="flex justify-between text-[10px] text-paper/40 font-mono mt-1">
        <span>{entries[0].recordDate.slice(5)}</span>
        <span>{entries[entries.length - 1].recordDate.slice(5)}</span>
      </div>
    </div>
  )
}
