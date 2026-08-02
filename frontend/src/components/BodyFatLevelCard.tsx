import React from 'react'
import { BodyFatLevel } from '../types'
import { useAuth } from '../contexts/AuthContext'

interface Props {
  data: BodyFatLevel
}

// moss(muted green) / ember(muted amber) — 앱 전체에서 쓰는 톤과 동일하게 맞춤
const EMBER: [number, number, number] = [224, 164, 88]
const MOSS: [number, number, number] = [143, 174, 118]

interface FigureParams {
  bodyPath: string
  leftArmPath: string
  rightArmPath: string
  showAbs: boolean
  absOpacity: number
  browSlant: number
  mouthControlY: number
  baseColor: string
  lightColor: string
  glowColor: string
}

// 1(체지방 높음) ~ 7(목표치) 단계 + 성별에 따라 몸통 실루엣을 만드는 함수.
// 참고 이미지처럼 어깨~가슴~허리~골반 라인의 폭 변화로 체형을 표현하고,
// 저체지방 구간에서는 복근 라인이, 고체지방 구간에서는 허리가 배쪽으로 부푼 실루엣이 보이게 함.
function buildFigure(level: number, isFemale: boolean): FigureParams {
  const t = Math.max(0, Math.min(1, (level - 1) / 6))
  const lerp = (a: number, b: number) => a + (b - a) * t
  const clamp = (val: number) => Math.min(255, Math.max(0, Math.round(val)))
  const cx = 100

  const shoulderW = isFemale ? 38 : 50
  const chestW = isFemale ? lerp(42, 36) : lerp(46, 42)
  const waistW = isFemale ? lerp(52, 25) : lerp(66, 32)
  const hipW = isFemale ? lerp(50, 42) : lerp(50, 40)
  const armOut = lerp(14, 4)
  const bicepW = lerp(20, 14)
  const forearmW = lerp(14, 9)

  const bodyPath = `
    M ${cx - 14} 70
    C ${cx - shoulderW + 6} 74, ${cx - shoulderW} 78, ${cx - shoulderW} 86
    C ${cx - shoulderW - 2} 102, ${cx - chestW} 108, ${cx - chestW + 4} 116
    C ${cx - waistW + 8} 122, ${cx - waistW} 126, ${cx - waistW} 136
    C ${cx - waistW + 2} 148, ${cx - hipW} 152, ${cx - hipW} 162
    L ${cx - hipW} 174
    L ${cx + hipW} 174
    L ${cx + hipW} 162
    C ${cx + hipW} 152, ${cx + waistW - 2} 148, ${cx + waistW} 136
    C ${cx + waistW} 126, ${cx + waistW - 8} 122, ${cx + chestW - 4} 116
    C ${cx + chestW} 108, ${cx + shoulderW + 2} 102, ${cx + shoulderW} 86
    C ${cx + shoulderW} 78, ${cx + shoulderW - 6} 74, ${cx + 14} 70
    Z
  `

  const leftArmPath = `
    M ${cx - shoulderW - 2} 86
    L ${cx - shoulderW - armOut - 4} 150
    L ${cx - shoulderW - armOut - 4 + forearmW} 150
    L ${cx - shoulderW - 2 + bicepW} 86
    Z
  `
  const rightArmPath = `
    M ${cx + shoulderW + 2} 86
    L ${cx + shoulderW + armOut + 4} 150
    L ${cx + shoulderW + armOut + 4 - forearmW} 150
    L ${cx + shoulderW + 2 - bicepW} 86
    Z
  `

  const r = lerp(EMBER[0], MOSS[0])
  const g = lerp(EMBER[1], MOSS[1])
  const b = lerp(EMBER[2], MOSS[2])
  const baseColor = `rgb(${clamp(r)}, ${clamp(g)}, ${clamp(b)})`
  const lightColor = `rgb(${clamp(r + 40)}, ${clamp(g + 30)}, ${clamp(b + 25)})`
  const glowColor = `rgba(${clamp(r)}, ${clamp(g)}, ${clamp(b)}, 0.35)`

  // 표정: 체지방 높을수록(t=0) 처진 눈썹+찡그린 입, 낮을수록(t=1) 편안한 눈썹+웃는 입
  const browSlant = lerp(6, -3)
  const mouthControlY = lerp(46, 68)

  return {
    bodyPath, leftArmPath, rightArmPath,
    showAbs: t > 0.35,
    absOpacity: Math.max(0, (t - 0.35) / 0.65),
    browSlant, mouthControlY,
    baseColor, lightColor, glowColor
  }
}

export default function BodyFatLevelCard({ data }: Props) {
  const { user } = useAuth()
  const isFemale = user?.gender === 'FEMALE'
  const level = data.currentLevel ?? 1
  const { bodyPath, leftArmPath, rightArmPath, absOpacity, browSlant, mouthControlY, baseColor, lightColor, glowColor } = buildFigure(level, isFemale)
  const cx = 100

  return (
      <div className="bg-panel border border-line rounded-card p-6 flex flex-col w-full relative overflow-hidden">

        {/* 상단 헤더 */}
        <div className="flex items-start justify-between w-full relative z-10">
          <div className="flex flex-col gap-1">
            <h3 className="text-sm font-medium text-paper/70 mt-2">체지방 단계</h3>
            {data.levelLabel && (
                <span
                    className="text-xs font-medium px-2 py-0.5 rounded-full w-fit"
                    style={{ color: baseColor, backgroundColor: `${baseColor}22` }}
                >
              {data.levelLabel}
            </span>
            )}
          </div>
          <div className="flex items-baseline gap-1">
          <span
              className="text-5xl font-display font-bold tracking-tighter"
              style={{ color: baseColor, textShadow: `0 4px 12px ${glowColor}` }}
          >
            {level}
          </span>
            <span className="text-xs font-mono text-paper/40">/ 7단계</span>
          </div>
        </div>

        {/* 체형 일러스트 영역 */}
        <div className="w-full flex justify-center items-center mt-2 relative">
          <div
              className="absolute w-40 h-40 rounded-full blur-3xl opacity-40"
              style={{ backgroundColor: baseColor, top: '15%' }}
          />

          <svg width="180" height="200" viewBox="0 0 200 200" className="relative z-10">
            <defs>
              <radialGradient id="clay-grad" cx="35%" cy="25%" r="75%">
                <stop offset="0%" stopColor={lightColor} />
                <stop offset="85%" stopColor={baseColor} />
                <stop offset="100%" stopColor="rgba(0,0,0,0.25)" />
              </radialGradient>
              <clipPath id="torso-clip">
                <path d={bodyPath} />
              </clipPath>
              <filter id="drop-shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#000" floodOpacity="0.3" />
              </filter>
            </defs>

            <g filter="url(#drop-shadow)">
              <path d={leftArmPath} fill="url(#clay-grad)" />
              <path d={rightArmPath} fill="url(#clay-grad)" />
              <path d={bodyPath} fill="url(#clay-grad)" />
              <circle cx={cx} cy={48} r={22} fill="url(#clay-grad)" />
            </g>

            {/* 복근 라인 (체지방 낮을수록 선명해짐) */}
            <g clipPath="url(#torso-clip)" opacity={absOpacity}>
              <line x1={cx} y1="98" x2={cx} y2="140" stroke="#2a1f1b" strokeWidth={1.2} strokeOpacity={0.4} />
              <line x1={cx - 16} y1="106" x2={cx + 16} y2="106" stroke="#2a1f1b" strokeWidth={1.2} strokeOpacity={0.35} />
              <line x1={cx - 15} y1="118" x2={cx + 15} y2="118" stroke="#2a1f1b" strokeWidth={1.2} strokeOpacity={0.35} />
              <line x1={cx - 13} y1="130" x2={cx + 13} y2="130" stroke="#2a1f1b" strokeWidth={1.2} strokeOpacity={0.35} />
            </g>

            {/* 상의/하의 밑단 라인 (옷 경계 느낌) */}
            <g clipPath="url(#torso-clip)">
              {isFemale && <rect x="0" y="92" width="200" height="6" fill="rgba(0,0,0,0.18)" />}
              <rect x="0" y="160" width="200" height="6" fill="rgba(0,0,0,0.15)" />
            </g>

            {/* 얼굴 표정 */}
            <g fill="none" stroke="#2a1f1b" strokeWidth={2.5} strokeLinecap="round">
              <line x1={cx - 12} y1={38 + browSlant} x2={cx - 5} y2={38 - browSlant} />
              <line x1={cx + 5} y1={38 - browSlant} x2={cx + 12} y2={38 + browSlant} />
              <circle cx={cx - 8} cy={47} r={2.5} fill="#2a1f1b" stroke="none" />
              <circle cx={cx + 8} cy={47} r={2.5} fill="#2a1f1b" stroke="none" />
              <path d={`M ${cx - 8} 56 Q ${cx} ${mouthControlY} ${cx + 8} 56`} />
            </g>
          </svg>
        </div>

        {/* 하단 7단계 진행바 */}
        <div className="flex items-center justify-between w-full mt-4 mb-3 px-1">
          {[...Array(7)].map((_, index) => {
            const step = index + 1
            const isActive = step <= level
            const isLineActive = step < level

            return (
                <React.Fragment key={step}>
                  <div
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0 transition-all duration-300"
                      style={{
                        backgroundColor: isActive ? baseColor : '#2a3032',
                        boxShadow: isActive ? `0 0 8px ${baseColor}` : 'none'
                      }}
                  />
                  {step < 7 && (
                      <div
                          className="h-[2px] flex-1 mx-1 rounded-full transition-all duration-300"
                          style={{ backgroundColor: isLineActive ? baseColor : '#2a3032' }}
                      />
                  )}
                </React.Fragment>
            )
          })}
        </div>

        <p className="text-xs text-paper/60 text-center leading-relaxed px-2">{data.message}</p>
      </div>
  )
}