interface Props {
  percent: number // 0-100
  size?: number
  label?: string
  sublabel?: string
}

export default function ProgressRing({ percent, size = 96, label, sublabel }: Props) {
  const stroke = 8
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (Math.min(100, Math.max(0, percent)) / 100) * circumference

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="#2a3032" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#8fae76"
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-xl font-display font-semibold text-paper">{Math.round(percent)}%</span>
        {sublabel && <span className="text-[10px] text-paper/50 font-mono">{sublabel}</span>}
      </div>
      {label && (
        <span className="absolute -bottom-6 text-xs text-paper/60 font-medium whitespace-nowrap">{label}</span>
      )}
    </div>
  )
}
