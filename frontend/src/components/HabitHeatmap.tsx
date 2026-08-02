import { HeatmapCell } from '../types'

interface Props {
  cells: HeatmapCell[]
}

function intensityColor(rate: number): string {
  if (rate <= 0) return '#1c2122'
  if (rate < 30) return '#2d3b26'
  if (rate < 60) return '#3d5330'
  if (rate < 90) return '#5f7a4a'
  return '#8fae76'
}

// 깃허브 스타일 잔디, 모바일 가로 스크롤 전용 (7행 x N열)
export default function HabitHeatmap({ cells }: Props) {
  const weeks: HeatmapCell[][] = []
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7))
  }

  return (
    <div className="bg-panel border border-line rounded-card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-paper/70">달성 기록</h3>
        <div className="flex items-center gap-1 text-[10px] text-paper/40">
          <span>낮음</span>
          {[0, 30, 60, 90, 100].map((r) => (
            <span key={r} className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: intensityColor(r) }} />
          ))}
          <span>높음</span>
        </div>
      </div>
      <div className="overflow-x-auto pb-1">
        <div className="flex gap-1 w-max">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1">
              {week.map((cell) => (
                <div
                  key={cell.date}
                  title={`${cell.date} · ${cell.completedCount}/${cell.totalCount}`}
                  className="w-3 h-3 rounded-sm"
                  style={{ backgroundColor: intensityColor(cell.achievementRate) }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
