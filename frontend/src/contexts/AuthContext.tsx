import React, { createContext, useContext, useEffect, useState } from 'react'
import { UserProfile } from '../types'
import { getMyProfile, loginWithGoogle as loginWithGoogleApi } from '../api/auth'

interface AuthContextValue {
  user: UserProfile | null
  isLoading: boolean
  loginWithGoogle: (idToken: string) => Promise<void>
  logout: () => void
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('roufit_access_token')
    if (!token) {
      setIsLoading(false)
      return
    }
    getMyProfile()
      .then(setUser)
      .catch(() => {
        localStorage.removeItem('roufit_access_token')
        localStorage.removeItem('roufit_refresh_token')
      })
      .finally(() => setIsLoading(false))
  }, [])

  async function loginWithGoogle(idToken: string) {
    const res = await loginWithGoogleApi(idToken)
    localStorage.setItem('roufit_access_token', res.accessToken)
    localStorage.setItem('roufit_refresh_token', res.refreshToken)
    setUser(res.user)
  }

  function logout() {
    localStorage.removeItem('roufit_access_token')
    localStorage.removeItem('roufit_refresh_token')
    setUser(null)
  }

  async function refreshProfile() {
    const profile = await getMyProfile()
    setUser(profile)
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, loginWithGoogle, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth는 AuthProvider 내부에서만 사용할 수 있어요.')
  return ctx
}
