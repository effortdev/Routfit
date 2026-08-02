import { BodyFatLevel } from '../types'

interface Props {
  data: BodyFatLevel
}

interface FigureParams {
  bodyPath: string
  browSlant: number
  mouthControlY: number
  fill: string
}

const EMBER: [number, number, number] = [224, 164, 88]
const MOSS: [number, number, number] = [143, 174, 118]

// 레벨(1~10)에 따라 체형 실루엣 + 표정을 보간해서 만드는 함수.
// t=0(레벨 1, 체지방 높음) -> 통통한 체형 + 처진 표정
// t=1(레벨 10, 체지방 낮음/목표) -> 슬림한 체형 + 웃는 표정
function buildFigure(level: number): FigureParams {
  const t = Math.max(0, Math.min(1, (level - 1) / 9))
  const lerp = (a: number, b: number) => a + (b - a) * t
  const cx = 100

  const shoulderW = lerp(80, 44)
  const waistW = lerp(104, 48)
  const hipW = lerp(84, 46)
  const legW = lerp(30, 16)

  const bodyPath = `
    M ${cx - shoulderW / 2} 78
    C ${cx - shoulderW / 2 - 4} 68, ${cx - shoulderW / 2 + 4} 68, ${cx - shoulderW / 2} 78
    C ${cx - shoulderW / 2 - 10} 100, ${cx - waistW / 2 - 8} 118, ${cx - waistW / 2} 138
    C ${cx - waistW / 2 + 4} 156, ${cx - hipW / 2} 168, ${cx - hipW / 2} 186
    L ${cx - legW / 2} 186
    L ${cx - legW / 2} 232
    L ${cx + legW / 2} 232
    L ${cx + legW / 2} 186
    L ${cx + hipW / 2} 186
    C ${cx + hipW / 2} 168, ${cx + waistW / 2 - 4} 156, ${cx + waistW / 2} 138
    C ${cx + waistW / 2 + 8} 118, ${cx + shoulderW / 2 + 10} 100, ${cx + shoulderW / 2} 78
    Z
  `

  const browSlant = lerp(6, -3)
  const mouthControlY = lerp(48, 74)

  const mix = EMBER.map((c, i) => Math.round(c + (MOSS[i] - c) * t))
  const fill = `rgb(${mix[0]}, ${mix[1]}, ${mix[2]})`

  return { bodyPath, browSlant, mouthControlY, fill }
}

export default function BodyFatLevelCard({ data }: Props) {
  const level = data.currentLevel ?? 1
  const { bodyPath, browSlant, mouthControlY, fill } = buildFigure(level)
  const cx = 100

  return (
    <div className="bg-panel border border-line rounded-card p-5 flex flex-col items-center gap-3">
      <div className="w-full flex items-center justify-between">
        <h3 className="text-sm font-medium text-paper/70">체지방 단계</h3>
        <span className="text-xs font-mono text-paper/40">10단계 중 {data.currentLevel ?? '–'}</span>
      </div>

      <svg width="160" height="230" viewBox="0 0 200 240">
        {/* 몸통 */}
        <path d={bodyPath} fill={fill} opacity={0.92} />
        {/* 머리 */}
        <circle cx={cx} cy={50} r={28} fill={fill} opacity={0.92} />
        {/* 눈썹 (체지방 높을수록 처진 인상, 낮을수록 편안한 인상) */}
        <line
          x1={cx - 20} y1={38 + browSlant}
          x2={cx - 8} y2={38 - browSlant}
          stroke="#171b1c" strokeWidth={3} strokeLinecap="round"
        />
        <line
          x1={cx + 8} y1={38 - browSlant}
          x2={cx + 20} y2={38 + browSlant}
          stroke="#171b1c" strokeWidth={3} strokeLinecap="round"
        />
        {/* 눈 */}
        <circle cx={cx - 12} cy={50} r={3} fill="#171b1c" />
        <circle cx={cx + 12} cy={50} r={3} fill="#171b1c" />
        {/* 입 (체지방 높을수록 처진 입, 낮을수록 웃는 입) */}
        <path
          d={`M ${cx - 12} 60 Q ${cx} ${mouthControlY} ${cx + 12} 60`}
          fill="none" stroke="#171b1c" strokeWidth={3} strokeLinecap="round"
        />
      </svg>

      <p className="text-xs text-paper/60 text-center leading-relaxed px-2">{data.message}</p>
    </div>
  )
}