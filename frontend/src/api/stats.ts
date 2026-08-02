import { apiClient } from './client'
import { HeatmapCell, DashboardData } from '../types'

export async function getHeatmap(start: string, end: string): Promise<HeatmapCell[]> {
  const { data } = await apiClient.get<{ cells: HeatmapCell[] }>('/api/v1/stats/heatmap', { params: { start, end } })
  return data.cells
}

export async function getDashboard(): Promise<DashboardData> {
  const { data } = await apiClient.get<DashboardData>('/api/v1/stats/dashboard')
  return data
}
