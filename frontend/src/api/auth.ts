import { apiClient } from './client'
import { UserProfile, Gender } from '../types'

export interface TokenResponse {
  accessToken: string
  refreshToken: string
  user: UserProfile
}

export async function loginWithGoogle(idToken: string): Promise<TokenResponse> {
  const { data } = await apiClient.post<TokenResponse>('/api/v1/auth/google', { idToken })
  return data
}

export async function getMyProfile(): Promise<UserProfile> {
  const { data } = await apiClient.get<UserProfile>('/api/v1/auth/me')
  return data
}

export async function updateMyProfile(heightCm?: number, gender?: Gender, age?: number): Promise<UserProfile> {
  const { data } = await apiClient.patch<UserProfile>('/api/v1/auth/me', { heightCm, gender, age })
  return data
}
