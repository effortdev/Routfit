import { useState } from 'react'
import { HeatmapCell, Routine } from '../types'
import { getRoutinesForDate } from '../api/routines'
import { getMemoForDate, upsertMemo } from '../api/memos'

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

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

// 깃허브 스타일 잔디, 모바일 가로 스크롤 전용 (7행 x N열)
// 잔디 하나를 누르면 오른쪽에 그날 루틴 체크 목록, 아래쪽에 그날 메모(일기)가 뜸
export default function HabitHeatmap({ cells }: Props) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [dayRoutines, setDayRoutines] = useState<Routine[]>([])
  const [isLoadingDay, setIsLoadingDay] = useState(false)
  const [memoContent, setMemoContent] = useState('')
  const [isSavingMemo, setIsSavingMemo] = useState(false)
  const [memoSavedMessage, setMemoSavedMessage] = useState('')

  const weeks: HeatmapCell[][] = []
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7))
  }

  async function handleCellClick(cell: HeatmapCell) {
    setSelectedDate(cell.date)
    setIsLoadingDay(true)
    setMemoSavedMessage('')
    try {
      const [routines, memo] = await Promise.all([
        getRoutinesForDate(cell.date),
        getMemoForDate(cell.date)
      ])
      setDayRoutines(routines)
      setMemoContent(memo.content ?? '')
    } finally {
      setIsLoadingDay(false)
    }
  }

  async function handleSaveMemo() {
    if (!selectedDate) return
    setIsSavingMemo(true)
    try {
      await upsertMemo(selectedDate, memoContent)
      setMemoSavedMessage('저장했어요.')
      setTimeout(() => setMemoSavedMessage(''), 2000)
    } finally {
      setIsSavingMemo(false)
    }
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

        <div className="flex gap-3">
          <div className="overflow-x-auto pb-1 flex-1 min-w-0">
            <div className="flex gap-1 w-max">
              {weeks.map((week, wi) => (
                  <div key={wi} className="flex flex-col gap-1">
                    {week.map((cell) => (
                        <button
                            key={cell.date}
                            onClick={() => handleCellClick(cell)}
                            title={`${cell.date} · ${cell.completedCount}/${cell.totalCount}`}
                            className={`w-3 h-3 rounded-sm transition ${
                                selectedDate === cell.date ? 'ring-1 ring-paper' : ''
                            }`}
                            style={{ backgroundColor: intensityColor(cell.achievementRate) }}
                        />
                    ))}
                  </div>
              ))}
            </div>
          </div>

          {/* 선택한 날짜의 루틴 목록 (5개 넘으면 스크롤) */}
          {selectedDate && (
              <div className="w-28 flex-shrink-0 border-l border-line pl-3 flex flex-col gap-1.5">
                <span className="text-[11px] font-mono text-paper/50">{formatDate(selectedDate)}</span>
                {isLoadingDay ? (
                    <span className="text-[11px] text-paper/30">불러오는 중...</span>
                ) : dayRoutines.length === 0 ? (
                    <span className="text-[11px] text-paper/30">기록 없음</span>
                ) : (
                    <div className="flex flex-col gap-1 max-h-[120px] overflow-y-auto pr-1">
                      {dayRoutines.map((r) => (
                          <div key={r.id} className="flex items-center gap-1.5">
                    <span
                        className={`w-3 h-3 rounded-full flex-shrink-0 flex items-center justify-center ${
                            r.completedToday ? 'bg-moss' : 'border border-line'
                        }`}
                    >
                      {r.completedToday && (
                          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#101314" strokeWidth={4}>
                            <path d="m5 13 4 4 10-10" />
                          </svg>
                      )}
                    </span>
                            <span className="text-[11px] text-paper/70 truncate">{r.title}</span>
                          </div>
                      ))}
                    </div>
                )}
              </div>
          )}
        </div>

        {/* 선택한 날짜의 메모(간단한 일기) - 전체 너비로 아래에 펼침 */}
        {selectedDate && (
            <div className="mt-3 pt-3 border-t border-line flex flex-col gap-2">
              <span className="text-[11px] text-paper/40">{formatDate(selectedDate)} 메모</span>
              <textarea
                  value={memoContent}
                  onChange={(e) => setMemoContent(e.target.value)}
                  maxLength={500}
                  rows={3}
                  placeholder="오늘 하루 간단히 기록해보세요..."
                  className="w-full bg-panelSoft border border-line rounded-lg px-3 py-2 text-sm text-paper placeholder:text-paper/30 focus:outline-none focus:border-moss resize-none"
              />
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-paper/30">{memoContent.length}/500</span>
                <button
                    onClick={handleSaveMemo}
                    disabled={isSavingMemo}
                    className="bg-moss text-ink text-xs font-medium rounded-lg px-3 py-1.5 min-h-[32px] active:scale-95 transition disabled:opacity-50"
                >
                  {isSavingMemo ? '저장 중...' : memoSavedMessage || '메모 저장'}
                </button>
              </div>
            </div>
        )}
      </div>
  )
}