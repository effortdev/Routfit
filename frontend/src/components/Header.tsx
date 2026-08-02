import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const dayLabelsKo = ['일', '월', '화', '수', '목', '금', '토']

export default function Header() {
  const { user } = useAuth()
  const today = new Date()
  const dateLabel = `${today.getMonth() + 1}월 ${today.getDate()}일 (${dayLabelsKo[today.getDay()]})`

  return (
    <header className="safe-top sticky top-0 z-20 bg-ink/95 backdrop-blur px-5 pt-4 pb-3 flex items-center justify-between border-b border-line">
      <div>
        <p className="text-xs text-moss font-mono tracking-wide">{dateLabel}</p>
        <h1 className="text-lg font-display font-semibold text-paper">
          {user ? `${user.name}님` : 'Roufit'}
        </h1>
      </div>
      <Link
        to="/me"
        className="w-10 h-10 rounded-full bg-panelSoft border border-line flex items-center justify-center text-paper/70 active:scale-95 transition"
        aria-label="마이페이지"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20c0-4 3.5-6 8-6s8 2 8 6" />
        </svg>
      </Link>
    </header>
  )
}
