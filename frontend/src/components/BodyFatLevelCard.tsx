import { BodyFatLevel } from '../types'
import { useAuth } from '../contexts/AuthContext'

interface Props {
  data: BodyFatLevel
}

const EMBER: [number, number, number] = [224, 164, 88]
const MOSS: [number, number, number] = [143, 174, 118]

// 1(체지방 높음) ~ 7(목표치) 단계 색상 보간 (배지/점 진행바용)
function levelColor(level: number): string {
  const t = Math.max(0, Math.min(1, (level - 1) / 6))
  const mix = EMBER.map((c, i) => Math.round(c + (MOSS[i] - c) * t))
  return `rgb(${mix[0]}, ${mix[1]}, ${mix[2]})`
}

export default function BodyFatLevelCard({ data }: Props) {
  const { user } = useAuth()
  const isFemale = user?.gender === 'FEMALE'
  const level = data.currentLevel ?? 1
  const color = levelColor(level)
  const imageSrc = `/bodyfat/${isFemale ? 'female' : 'male'}-${level}.png`

  return (
      <div className="bg-panel border border-line rounded-card p-5 flex flex-col items-center gap-3">
        <div className="w-full flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h3 className="text-sm font-medium text-paper/70">체지방 단계</h3>
            {data.levelLabel && (
                <span
                    className="text-xs font-medium px-2 py-0.5 rounded-full w-fit"
                    style={{ color, backgroundColor: `${color}22` }}
                >
              {data.levelLabel}
            </span>
            )}
          </div>
          <span className="text-xs font-mono text-paper/40">{data.currentLevel ?? '–'} / 7단계</span>
        </div>

        <img
            src={imageSrc}
            alt={`체지방 ${level}단계 체형 일러스트`}
            className="h-52 w-auto object-contain"
        />

        <div className="flex items-center justify-between w-full px-1">
          {[...Array(7)].map((_, index) => {
            const step = index + 1
            const isActive = step <= level
            const isLineActive = step < level
            return (
                <div key={step} className="flex items-center flex-1 last:flex-none">
                  <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: isActive ? color : '#2a3032' }}
                  />
                  {step < 7 && (
                      <div
                          className="h-[2px] flex-1 mx-1 rounded-full"
                          style={{ backgroundColor: isLineActive ? color : '#2a3032' }}
                      />
                  )}
                </div>
            )
          })}
        </div>

        <p className="text-xs text-paper/60 text-center leading-relaxed px-2">{data.message}</p>
      </div>
  )
}