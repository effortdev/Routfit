import { apiClient } from './client'
import { MetricsEntry, BodyFatLevel } from '../types'

export async function upsertMetrics(recordDate: string, weightKg: number, bodyFatPercent?: number): Promise<MetricsEntry> {
  const { data } = await apiClient.post<MetricsEntry>('/api/v1/body-metrics', { recordDate, weightKg, bodyFatPercent })
  return data
}

export async function getMetricsRange(start: string, end: string): Promise<MetricsEntry[]> {
  const { data } = await apiClient.get<MetricsEntry[]>('/api/v1/body-metrics', { params: { start, end } })
  return data
}

export async function getCurrentBodyFatLevel(): Promise<BodyFatLevel> {
  const { data } = await apiClient.get<BodyFatLevel>('/api/v1/body-metrics/level')
  return data
}
