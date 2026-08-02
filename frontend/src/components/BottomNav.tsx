import { NavLink } from 'react-router-dom'

const items = [
  { to: '/', label: '홈', icon: 'home' },
  { to: '/routines', label: '루틴', icon: 'check' },
  { to: '/metrics', label: '신체분석', icon: 'trend' },
  { to: '/me', label: '마이페이지', icon: 'user' }
] as const

function Icon({ name, active }: { name: string; active: boolean }) {
  const stroke = active ? '#8fae76' : '#5b6467'
  const common = { fill: 'none', stroke, strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  if (name === 'home') return <svg width="22" height="22" viewBox="0 0 24 24" {...common}><path d="M4 11 12 4l8 7" /><path d="M6 10v9h12v-9" /></svg>
  if (name === 'check') return <svg width="22" height="22" viewBox="0 0 24 24" {...common}><rect x="4" y="4" width="16" height="16" rx="4" /><path d="m8 12 3 3 5-6" /></svg>
  if (name === 'trend') return <svg width="22" height="22" viewBox="0 0 24 24" {...common}><path d="M4 17 9 11l4 3 7-8" /></svg>
  return <svg width="22" height="22" viewBox="0 0 24 24" {...common}><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.5-6 8-6s8 2 8 6" /></svg>
}

export default function BottomNav() {
  return (
    <nav className="safe-bottom fixed bottom-0 left-0 right-0 z-30 bg-panel/95 backdrop-blur border-t border-line">
      <div className="max-w-md mx-auto flex items-stretch">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className="flex-1 flex flex-col items-center gap-1 py-2.5 min-h-[52px] justify-center active:scale-95 transition"
          >
            {({ isActive }) => (
              <>
                <Icon name={item.icon} active={isActive} />
                <span className={`text-[11px] font-medium ${isActive ? 'text-moss' : 'text-paper/40'}`}>
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
