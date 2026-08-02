import { useEffect, useState } from 'react'
import { DashboardData } from '../types'
import { getDashboard } from '../api/stats'
import ProgressRing from '../components/ProgressRing'
import BodyFatLevelCard from '../components/BodyFatLevelCard'
import Header from '../components/Header'

export default function HomePage() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getDashboard()
      .then(setDashboard)
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <div className="pb-24">
      <Header />
      <main className="px-5 pt-5 flex flex-col gap-4">
        {isLoading && <div className="text-paper/40 text-sm text-center py-10">불러오는 중...</div>}

        {dashboard && (
          <>
            <div className="bg-panel border border-line rounded-card p-5 flex items-center justify-between">
              <div>
                <p className="text-xs text-paper/50 mb-1">오늘의 달성률</p>
                <p className="text-2xl font-display font-semibold text-paper">
                  {dashboard.todayProgress.completedCount}
                  <span className="text-paper/40"> / {dashboard.todayProgress.totalCount}</span>
                </p>
                {dashboard.currentStreakDays > 0 && (
                  <p className="text-xs text-ember mt-1 font-mono">🔥 {dashboard.currentStreakDays}일 연속</p>
                )}
              </div>
              <ProgressRing percent={dashboard.todayProgress.achievementRate} />
            </div>

            <BodyFatLevelCard data={dashboard.bodyFatLevel} />
          </>
        )}
      </main>
    </div>
  )
}
