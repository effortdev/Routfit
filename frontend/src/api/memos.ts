import { apiClient } from './client'

export interface MemoEntry {
    logDate: string
    content: string | null
}

export async function getMemoForDate(date: string): Promise<MemoEntry> {
    const { data } = await apiClient.get<MemoEntry>('/api/v1/memos', { params: { date } })
    return data
}

export async function upsertMemo(logDate: string, content: string): Promise<MemoEntry> {
    const { data } = await apiClient.post<MemoEntry>('/api/v1/memos', { logDate, content })
    return data
}