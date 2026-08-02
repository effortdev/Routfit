import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { updateMyProfile } from '../api/auth'
import { Gender } from '../types'
import Header from '../components/Header'
import { useNavigate } from 'react-router-dom'

export default function MyPage() {
  const { user, refreshProfile, logout } = useAuth()
  const navigate = useNavigate()
  const [height, setHeight] = useState(user?.heightCm?.toString() ?? '')
  const [gender, setGender] = useState<Gender | ''>(user?.gender ?? '')
  const [isSaving, setIsSaving] = useState(false)

  async function handleSave() {
    setIsSaving(true)
    try {
      await updateMyProfile(height ? parseFloat(height) : undefined, gender || undefined)
      await refreshProfile()
    } finally {
      setIsSaving(false)
    }
  }

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="pb-24">
      <Header />
      <main className="px-5 pt-5 flex flex-col gap-4">
        <div className="bg-panel border border-line rounded-card p-5 flex flex-col gap-4">
          <div>
            <p className="text-xs text-paper/40">이메일</p>
            <p className="text-sm text-paper">{user?.email}</p>
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-paper/40">키 (cm)</span>
            <input
              type="number"
              inputMode="decimal"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder="예: 175"
              className="bg-panelSoft border border-line rounded-lg px-3 py-2.5 text-sm text-paper placeholder:text-paper/30 focus:outline-none focus:border-moss min-h-[44px]"
            />
          </label>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs text-paper/40">성별</span>
            <div className="flex gap-2">
              {(['MALE', 'FEMALE'] as Gender[]).map((g) => (
                <button
                  key={g}
                  onClick={() => setGender(g)}
                  className={`flex-1 rounded-lg py-2.5 text-sm min-h-[44px] transition ${
                    gender === g ? 'bg-moss text-ink font-medium' : 'bg-panelSoft text-paper/60 border border-line'
                  }`}
                >
                  {g === 'MALE' ? '남성' : '여성'}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-ember text-ink font-medium rounded-card py-3 min-h-[44px] active:scale-95 transition disabled:opacity-50"
          >
            {isSaving ? '저장 중...' : '프로필 저장'}
          </button>
        </div>

        <button
          onClick={handleLogout}
          className="text-paper/40 text-sm py-3 min-h-[44px]"
        >
          로그아웃
        </button>
      </main>
    </div>
  )
}
