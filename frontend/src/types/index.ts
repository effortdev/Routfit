export type Gender = 'MALE' | 'FEMALE'

export interface UserProfile {
  id: number
  email: string
  name: string
  heightCm: number | null
  gender: Gender | null
  age: number | null
}

export interface Routine {
  id: number
  title: string
  sortOrder: number
  active: boolean
  completedToday: boolean
}

export interface DailyProgress {
  date: string
  totalCount: number
  completedCount: number
  achievementRate: number
}

export interface MetricsEntry {
  id: number
  recordDate: string
  weightKg: number
  bodyFatPercent: number | null
  bodyFatLevel: number | null
  source: string
  hasPhoto: boolean
}

export interface BodyFatLevel {
  currentLevel: number | null
  currentBodyFatPercent: number | null
  nextLevel: number | null
  nextLevelThreshold: number | null
  levelLabel: string | null
  message: string
}

export interface HeatmapCell {
  date: string
  achievementRate: number
  completedCount: number
  totalCount: number
}

export interface DashboardData {
  todayProgress: DailyProgress
  bodyFatLevel: BodyFatLevel
  currentStreakDays: number
}
