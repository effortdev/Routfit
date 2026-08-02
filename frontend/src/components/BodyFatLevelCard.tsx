import { BodyFatLevel } from '../types'

interface Props {
  data: BodyFatLevel
}

// 시그니처 비주얼: 나무의 나이테(growth ring)처럼 10단계를 동심원으로 표현.
// 현재 레벨까지는 moss 색으로 채워지고, 현재 레벨 링은 ember 색으로 강조.
export default function BodyFatLevelCard({ data }: Props) {
  const level = data.currentLevel ?? 0
  const size = 200
  const center = size / 2
  const maxRadius = 88
  const ringCount = 10
  const step = maxRadius / ringCount

  const rings = Array.from({ length: ringCount }, (_, i) => {
    const ringIndex = ringCount - i // 바깥쪽부터 Level 10 -> 안쪽 Level 1 순서로 그림
    const radius = step * i + step
    const isFilled = level >= ringIndex
    const isCurrent = level === ringIndex
    return { radius, isFilled, isCurrent, ringIndex }
  })

  return (
    <div className="bg-panel border border-line rounded-card p-5 flex flex-col items-center gap-3">
      <div className="w-full flex items-center justify-between">
        <h3 className="text-sm font-medium text-paper/70">체지방 단계</h3>
        <span className="text-xs font-mono text-paper/40">10단계 중</span>
      </div>

      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size}>
          {rings.map((ring) => (
            <circle
              key={ring.ringIndex}
              cx={center}
              cy={center}
              r={ring.radius}
              fill="none"
              stroke={ring.isCurrent ? '#e0a458' : ring.isFilled ? '#5f7a4a' : '#242a2c'}
              strokeWidth={ring.isCurrent ? 4 : 2.5}
              opacity={ring.isFilled || ring.isCurrent ? 1 : 0.6}
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-display font-bold text-paper">
            {data.currentLevel ?? '–'}
          </span>
          <span className="text-[11px] text-paper/50 font-mono">LEVEL</span>
          {data.currentBodyFatPercent != null && (
            <span className="mt-1 text-xs text-moss font-mono">{data.currentBodyFatPercent.toFixed(1)}%</span>
          )}
        </div>
      </div>

      <p className="text-xs text-paper/60 text-center leading-relaxed px-2">{data.message}</p>
    </div>
  )
}
