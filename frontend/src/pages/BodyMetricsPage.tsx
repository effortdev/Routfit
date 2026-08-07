import { useEffect, useState } from 'react'
import { MetricsEntry, BodyFatLevel } from '../types'
import { getMetricsRange, upsertMetrics, uploadProgressPhoto, getCurrentBodyFatLevel } from '../api/bodyMetrics'
import { useAuth } from '../contexts/AuthContext'
import Header from '../components/Header'
import WeightInputForm from '../components/WeightInputForm'
import MetricsTrendChart from '../components/MetricsTrendChart'
import RecentBodyFatTrend from '../components/RecentBodyFatTrend'
import ProgressPhotoTimeline from '../components/ProgressPhotoTimeline'
import BodyFatLevelCard from '../components/BodyFatLevelCard'

function toIsoDate(d: Date): string {
  // toISOString()은 UTC 기준이라 한국 시간(UTC+9)에서 자정~오전9시 사이에 날짜가 하루 밀리는 버그가 있었음.
  // 기기의 로컬 시간 그대로 YYYY-MM-DD를 만들도록 수정.
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export default function BodyMetricsPage() {
  const { user } = useAuth()
  const [entries, setEntries] = useState<MetricsEntry[]>([])
  const [level, setLevel] = useState<BodyFatLevel | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [photoRefreshTrigger, setPhotoRefreshTrigger] = useState(0)
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

  async function handleSubmit(recordDate: string, weightKg: number, bodyFatPercent?: number, photoFile?: File | null) {
    await upsertMetrics(recordDate, weightKg, bodyFatPercent)
    if (photoFile) {
      await uploadProgressPhoto(recordDate, photoFile)
    }
    await loadAll()
    setPhotoRefreshTrigger((n) => n + 1) // 진행 사진 타임라인은 독립적으로 조회하므로 재조회 신호를 보냄
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
                <ProgressPhotoTimeline refreshTrigger={photoRefreshTrigger} />
                <RecentBodyFatTrend entries={entries} />
                <MetricsTrendChart entries={entries} />
                <WeightInputForm
                    defaultDate={today}
                    userHeightCm={user?.heightCm}
                    userGender={user?.gender}
                    userAge={user?.age}
                    onSubmit={handleSubmit}
                />
              </>
          )}
        </main>
      </div>
  )
}