import { MetricsEntry } from '../types'

interface Props {
    entries: MetricsEntry[]
}

// 작은 모바일 화면에 맞춘 심플 라인 차트 (외부 차트 라이브러리 없이 순수 SVG)
// 몸무게(moss)와 체지방률(ember)을 각각 다른 스케일로 같이 그림 (이중 y축 느낌)
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
    const weightMin = Math.min(...weights)
    const weightMax = Math.max(...weights)
    const weightRange = weightMax - weightMin || 1

    const bodyFatValues = entries.map((e) => e.bodyFatPercent).filter((v): v is number => v != null)
    const hasBodyFat = bodyFatValues.length >= 2
    const bodyFatMin = hasBodyFat ? Math.min(...bodyFatValues) : 0
    const bodyFatMax = hasBodyFat ? Math.max(...bodyFatValues) : 1
    const bodyFatRange = bodyFatMax - bodyFatMin || 1

    const xAt = (i: number) => padding + (i / (entries.length - 1)) * (width - padding * 2)

    const weightPoints = entries.map((entry, i) => ({
        x: xAt(i),
        y: height - padding - ((entry.weightKg - weightMin) / weightRange) * (height - padding * 2)
    }))
    const weightPath = weightPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')

    // 체지방률은 값 없는 날이 있을 수 있어서, 끊긴 구간은 선을 새로 시작함
    let bodyFatPath = ''
    let penDown = false
    const bodyFatPoints: { x: number; y: number }[] = []
    entries.forEach((entry, i) => {
        if (entry.bodyFatPercent == null) {
            penDown = false
            return
        }
        const y = height - padding - ((entry.bodyFatPercent - bodyFatMin) / bodyFatRange) * (height - padding * 2)
        const x = xAt(i)
        bodyFatPath += `${penDown ? 'L' : 'M'} ${x} ${y} `
        bodyFatPoints.push({ x, y })
        penDown = true
    })

    const latestBodyFat = [...entries].reverse().find((e) => e.bodyFatPercent != null)?.bodyFatPercent

    return (
        <div className="bg-panel border border-line rounded-card p-4">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-paper/70">체중 · 체지방률 추이</h3>
                <div className="flex items-center gap-2 text-xs font-mono">
                    <span className="text-moss">{weights[weights.length - 1].toFixed(1)}kg</span>
                    {latestBodyFat != null && <span className="text-ember">{latestBodyFat.toFixed(1)}%</span>}
                </div>
            </div>
            <svg width="100%" viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
                <path d={weightPath} fill="none" stroke="#8fae76" strokeWidth={2} />
                {weightPoints.map((p, i) => (
                    <circle key={`w-${i}`} cx={p.x} cy={p.y} r={i === weightPoints.length - 1 ? 4 : 2.5} fill="#8fae76" />
                ))}

                {hasBodyFat && (
                    <>
                        <path d={bodyFatPath} fill="none" stroke="#e0a458" strokeWidth={2} strokeDasharray="4 3" />
                        {bodyFatPoints.map((p, i) => (
                            <circle key={`f-${i}`} cx={p.x} cy={p.y} r={i === bodyFatPoints.length - 1 ? 4 : 2.5} fill="#e0a458" />
                        ))}
                    </>
                )}
            </svg>
            <div className="flex items-center justify-between mt-1">
                <div className="flex items-center gap-3 text-[10px]">
          <span className="flex items-center gap-1 text-paper/40">
            <span className="w-2 h-2 rounded-full bg-moss inline-block" /> 몸무게
          </span>
                    {hasBodyFat && (
                        <span className="flex items-center gap-1 text-paper/40">
              <span className="w-2 h-2 rounded-full bg-ember inline-block" /> 체지방률
            </span>
                    )}
                </div>
                <div className="flex justify-between text-[10px] text-paper/40 font-mono gap-2">
                    <span>{entries[0].recordDate.slice(5)}</span>
                    <span>{entries[entries.length - 1].recordDate.slice(5)}</span>
                </div>
            </div>
        </div>
    )
}