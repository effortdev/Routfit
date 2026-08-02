import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

// Google Identity Services 스크립트를 index.html에서 로드하지 않고
// 여기서 동적으로 로드해 One Tap / 버튼 렌더링을 처리
declare global {
  interface Window {
    google?: any
  }
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

export default function LoginPage() {
  const { loginWithGoogle, user } = useAuth()
  const navigate = useNavigate()
  const buttonRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (user) {
      navigate('/', { replace: true })
    }
  }, [user, navigate])

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.onload = () => {
      if (!window.google || !buttonRef.current) return
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response: { credential: string }) => {
          await loginWithGoogle(response.credential)
        }
      })
      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: 'filled_black',
        size: 'large',
        shape: 'pill',
        width: 280
      })
    }
    document.body.appendChild(script)
    return () => {
      document.body.removeChild(script)
    }
  }, [loginWithGoogle])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 gap-8">
      <div className="flex flex-col items-center gap-3">
        <div className="w-16 h-16 rounded-2xl bg-panel border border-line flex items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8fae76" strokeWidth={2}>
            <path d="m8 12 3 3 5-6" />
            <circle cx="12" cy="12" r="9" />
          </svg>
        </div>
        <h1 className="text-2xl font-display font-semibold text-paper">Roufit</h1>
        <p className="text-sm text-paper/50 text-center leading-relaxed">
          매일의 루틴과 체중 변화를<br />기록하는 나만의 트래커
        </p>
      </div>

      <div ref={buttonRef} />

      {!GOOGLE_CLIENT_ID && (
        <p className="text-xs text-ember text-center max-w-xs">
          .env에 VITE_GOOGLE_CLIENT_ID가 설정되어 있지 않아요. Google Cloud Console에서 OAuth 클라이언트 ID를 발급받아 설정해주세요.
        </p>
      )}
    </div>
  )
}
