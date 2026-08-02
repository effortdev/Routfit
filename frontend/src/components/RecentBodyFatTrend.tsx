import { MetricsEntry } from '../types'

interface Props {
    entries: MetricsEntry[] // recordDate 오름차순으로 정렬된 상태를 가정
}

// 항상 "가장 최근 3개" 기록만 보여줌 (몸무게 + 체지방률 같이).
// 예: 8/2,8/3,8/4가 있다가 8/5를 입력하면 자동으로 8/3,8/4,8/5로 밀려남 (롤링 윈도우)
export default function RecentBodyFatTrend({ entries }: Props) {
    const recent = entries.filter((e) => e.bodyFatPercent != null).slice(-3)

    if (recent.length === 0) {
        return null
    }

    return (
        <div className="bg-panel border border-line rounded-card p-4">
            <h3 className="text-sm font-medium text-paper/70 mb-3">최근 3일 몸무게 · 체지방률</h3>
            <div className="flex gap-2">
                {recent.map((entry, i) => (
                    <div
                        key={entry.recordDate}
                        className={`flex-1 flex flex-col items-center gap-1 rounded-lg py-3 ${
                            i === recent.length - 1 ? 'bg-moss/15 border border-moss/40' : 'bg-panelSoft border border-line'
                        }`}
                    >
                        <span className="text-[11px] text-paper/40 font-mono">{entry.recordDate.slice(5)}</span>
                        <span className={`text-sm font-mono ${i === recent.length - 1 ? 'text-moss' : 'text-paper/70'}`}>
              {entry.weightKg.toFixed(1)}kg
            </span>
                        <span className={`text-base font-display font-semibold ${i === recent.length - 1 ? 'text-ember' : 'text-paper'}`}>
              {entry.bodyFatPercent?.toFixed(1)}%
            </span>
                    </div>
                ))}
            </div>
        </div>
    )
}