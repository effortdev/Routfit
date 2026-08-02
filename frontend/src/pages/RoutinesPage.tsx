import { useEffect, useState } from 'react'
import { Routine } from '../types'
import { getTodayRoutines, createRoutine, deleteRoutine, toggleRoutineLog } from '../api/routines'
import { getHeatmap } from '../api/stats'
import { HeatmapCell } from '../types'
import Header from '../components/Header'
import RoutineChecklist from '../components/RoutineChecklist'
import HabitHeatmap from '../components/HabitHeatmap'

const WINDOW_DAYS = 70 // 잔디 10주 분량 (7일 x 10주), 시작점이 바뀌어도 이 길이는 유지

function toIsoDate(d: Date) {
  return d.toISOString().slice(0, 10)
}

function defaultRangeStart(): Date {
  const d = new Date()
  d.setDate(d.getDate() - (WINDOW_DAYS - 1))
  return d
}

export default function RoutinesPage() {
  const [routines, setRoutines] = useState<Routine[]>([])
  const [heatmapCells, setHeatmapCells] = useState<HeatmapCell[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [rangeStart, setRangeStart] = useState<Date>(defaultRangeStart())

  const today = new Date()
  const rangeEnd = new Date(Math.min(
      new Date(rangeStart).setDate(rangeStart.getDate() + (WINDOW_DAYS - 1)),
      today.getTime()
  ))
  const isDefaultRange = toIsoDate(rangeStart) === toIsoDate(defaultRangeStart())

  async function loadHeatmap(start: Date, end: Date) {
    const data = await getHeatmap(toIsoDate(start), toIsoDate(end))
    setHeatmapCells(data)
  }

  async function loadAll() {
    const [routinesData] = await Promise.all([
      getTodayRoutines(),
      loadHeatmap(rangeStart, rangeEnd)
    ])
    setRoutines(routinesData)
  }

  useEffect(() => {
    loadAll().finally(() => setIsLoading(false))
  }, [])

  useEffect(() => {
    if (!isLoading) loadHeatmap(rangeStart, rangeEnd)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rangeStart])

  async function handleToggle(id: number, completed: boolean) {
    setRoutines((prev) => prev.map((r) => (r.id === id ? { ...r, completedToday: completed } : r)))
    await toggleRoutineLog(id, completed)
    loadHeatmap(rangeStart, rangeEnd)
  }

  async function handleAdd(title: string) {
    const routine = await createRoutine(title)
    setRoutines((prev) => [...prev, routine])
  }

  async function handleDelete(id: number) {
    setRoutines((prev) => prev.filter((r) => r.id !== id))
    await deleteRoutine(id)
  }

  function handleJumpToDate(dateStr: string) {
    setRangeStart(new Date(dateStr))
  }

  function handleResetRange() {
    setRangeStart(defaultRangeStart())
  }

  return (
      <div className="pb-24">
        <Header />
        <main className="px-5 pt-5 flex flex-col gap-4">
          {isLoading ? (
              <div className="text-paper/40 text-sm text-center py-10">불러오는 중...</div>
          ) : (
              <>
                <HabitHeatmap
                    cells={heatmapCells}
                    rangeStart={toIsoDate(rangeStart)}
                    rangeEnd={toIsoDate(rangeEnd)}
                    isDefaultRange={isDefaultRange}
                    onJumpToDate={handleJumpToDate}
                    onResetRange={handleResetRange}
                />
                <RoutineChecklist
                    routines={routines}
                    onToggle={handleToggle}
                    onAdd={handleAdd}
                    onDelete={handleDelete}
                />
              </>
          )}
        </main>
      </div>
  )
}