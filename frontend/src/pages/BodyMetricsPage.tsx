import { useEffect, useState } from 'react'
import { MetricsEntry, BodyFatLevel } from '../types'
import { getMetricsRange, upsertMetrics, getCurrentBodyFatLevel } from '../api/bodyMetrics'
import Header from '../components/Header'
import WeightInputForm from '../components/WeightInputForm'
import MetricsTrendChart from '../components/MetricsTrendChart'
import BodyFatLevelCard from '../components/BodyFatLevelCard'

function toIsoDate(d: Date) {
  return d.toISOString().slice(0, 10)
}

export default function BodyMetricsPage() {
  const [entries, setEntries] = useState<MetricsEntry[]>([])
  const [level, setLevel] = useState<BodyFatLevel | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const today = toIsoDate(new Date())

  async function loadAll() {
    const end = new Date()
    const start = new Date()
    start.setDate(end.getDate() - 29)

    const [entriesData, levelData] = await Promise.all([
      getMetricsRange(toIsoDate(start), toIsoDate(end)),
      getCurrentBodyFatLevel()
    ])
    setEntries(entriesData)
    setLevel(levelData)
  }

  useEffect(() => {
    loadAll().finally(() => setIsLoading(false))
  }, [])

  async function handleSubmit(recordDate: string, weightKg: number, bodyFatPercent?: number) {
    await upsertMetrics(recordDate, weightKg, bodyFatPercent)
    await loadAll()
  }

  return (
    <div className="pb-24">
      <Header />
      <main className="px-5 pt-5 flex flex-col gap-4">
        {isLoading ? (
          <div className="text-paper/40 text-sm text-center py-10">불러오는 중...</div>
        ) : (
          <>
            {level && <BodyFatLevelCard data={level} />}
            <MetricsTrendChart entries={entries} />
            <WeightInputForm defaultDate={today} onSubmit={handleSubmit} />
          </>
        )}
      </main>
    </div>
  )
}
