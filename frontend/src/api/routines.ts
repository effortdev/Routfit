import { apiClient } from './client'
import { Routine, DailyProgress } from '../types'

export async function getTodayRoutines(): Promise<Routine[]> {
  const { data } = await apiClient.get<Routine[]>('/api/v1/routines/today')
  return data
}

export async function createRoutine(title: string): Promise<Routine> {
  const { data } = await apiClient.post<Routine>('/api/v1/routines', { title })
  return data
}

export async function updateRoutine(id: number, title?: string, sortOrder?: number): Promise<Routine> {
  const { data } = await apiClient.put<Routine>(`/api/v1/routines/${id}`, { title, sortOrder })
  return data
}

export async function deleteRoutine(id: number): Promise<void> {
  await apiClient.delete(`/api/v1/routines/${id}`)
}

export async function toggleRoutineLog(id: number, completed: boolean, date?: string): Promise<DailyProgress> {
  const { data } = await apiClient.post<DailyProgress>(`/api/v1/routines/${id}/logs`, { completed, date })
  return data
}

// 히트맵에서 특정 날짜 클릭 시, 그날 체크했던 루틴 목록 조회
export async function getRoutinesForDate(date: string): Promise<Routine[]> {
  const { data } = await apiClient.get<Routine[]>('/api/v1/routines/logs', { params: { date } })
  return data
}
