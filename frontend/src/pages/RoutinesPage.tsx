import { useEffect, useState } from 'react'
import { Routine } from '../types'
import { getTodayRoutines, createRoutine, deleteRoutine, toggleRoutineLog } from '../api/routines'
import { getHeatmap } from '../api/stats'
import { HeatmapCell } from '../types'
import Header from '../components/Header'
import RoutineChecklist from '../components/RoutineChecklist'
import HabitHeatmap from '../components/HabitHeatmap'

function toIsoDate(d: Date) {
  return d.toISOString().slice(0, 10)
}

export default function RoutinesPage() {
  const [routines, setRoutines] = useState<Routine[]>([])
  const [heatmapCells, setHeatmapCells] = useState<HeatmapCell[]>([])
  const [isLoading, setIsLoading] = useState(true)

  async function loadAll() {
    const end = new Date()
    const start = new Date()
    start.setDate(end.getDate() - 69) // 최근 10주

    const [routinesData, heatmapData] = await Promise.all([
      getTodayRoutines(),
      getHeatmap(toIsoDate(start), toIsoDate(end))
    ])
    setRoutines(routinesData)
    setHeatmapCells(heatmapData)
  }

  useEffect(() => {
    loadAll().finally(() => setIsLoading(false))
  }, [])

  async function handleToggle(id: number, completed: boolean) {
    setRoutines((prev) => prev.map((r) => (r.id === id ? { ...r, completedToday: completed } : r)))
    await toggleRoutineLog(id, completed)
    const end = new Date()
    const start = new Date()
    start.setDate(end.getDate() - 69)
    getHeatmap(toIsoDate(start), toIsoDate(end)).then(setHeatmapCells)
  }

  async function handleAdd(title: string) {
    const routine = await createRoutine(title)
    setRoutines((prev) => [...prev, routine])
  }

  async function handleDelete(id: number) {
    setRoutines((prev) => prev.filter((r) => r.id !== id))
    await deleteRoutine(id)
  }

  return (
    <div className="pb-24">
      <Header />
      <main className="px-5 pt-5 flex flex-col gap-4">
        {isLoading ? (
          <div className="text-paper/40 text-sm text-center py-10">불러오는 중...</div>
        ) : (
          <>
            <HabitHeatmap cells={heatmapCells} />
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
