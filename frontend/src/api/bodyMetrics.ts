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

export async function uploadProgressPhoto(date: string, file: File): Promise<MetricsEntry> {
  const formData = new FormData()
  formData.append('photo', file)
  const { data } = await apiClient.post<MetricsEntry>(`/api/v1/body-metrics/${date}/photo`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return data
}

// 사진은 인증이 필요해서 <img src>로 바로 못 씀 -> blob으로 받아서 object URL 생성
export async function getProgressPhotoUrl(date: string): Promise<string> {
  const { data } = await apiClient.get(`/api/v1/body-metrics/${date}/photo`, { responseType: 'blob' })
  return URL.createObjectURL(data as Blob)
}