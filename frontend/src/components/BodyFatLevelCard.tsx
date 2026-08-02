import React from 'react'
import { BodyFatLevel } from '../types'

interface Props {
  data: BodyFatLevel
}

interface FigureParams {
  headR: number
  chestW: number
  bellyW: number
  pelvisW: number
  legW: number
  armW: number
  armRot: number
  mouthYStart: number
  mouthYControl: number
  browYOuter: number
  browYInner: number
  baseColor: string
  lightColor: string
  glowColor: string
}

// moss(muted green) / ember(muted amber) — 앱 전체에서 쓰는 톤과 동일하게 맞춤
const EMBER: [number, number, number] = [224, 164, 88]
const MOSS: [number, number, number] = [143, 174, 118]

// 1(체지방 높음) ~ 7(목표치) 단계에 따른 보간 함수
function buildFigure(level: number): FigureParams {
  const t = Math.max(0, Math.min(1, (level - 1) / 6))
  const lerp = (a: number, b: number) => a + (b - a) * t
  const clamp = (val: number) => Math.min(255, Math.max(0, Math.round(val)))

  // 체형 변화 (통통함 -> 슬림함)
  const headR = lerp(26, 22)
  const chestW = lerp(45, 26)
  const bellyW = lerp(58, 24)
  const pelvisW = lerp(42, 24)
  const legW = lerp(20, 13)
  const armW = lerp(16, 11)
  const armRot = lerp(15, 4) // 통통할수록 팔이 몸통에 밀려 벌어짐

  // 표정 변화 (우울/처짐 -> 웃음/편안함)
  const mouthYStart = lerp(63, 58) // 입꼬리
  const mouthYControl = lerp(52, 67) // 입술 중앙 (endpoint보다 위=찡그림, 아래=웃음)

  // 눈썹: 레벨1(inner 높고 outer 낮음=처진 인상) -> 레벨7(거의 평평=편안한 인상)
  const browYOuter = lerp(44, 40)
  const browYInner = lerp(32, 40)

  // 색상: ember(주의, 체지방 높음) -> moss(목표, 체지방 낮음)
  const r = lerp(EMBER[0], MOSS[0])
  const g = lerp(EMBER[1], MOSS[1])
  const b = lerp(EMBER[2], MOSS[2])

  const baseColor = `rgb(${clamp(r)}, ${clamp(g)}, ${clamp(b)})`
  const lightColor = `rgb(${clamp(r + 40)}, ${clamp(g + 30)}, ${clamp(b + 25)})`
  const glowColor = `rgba(${clamp(r)}, ${clamp(g)}, ${clamp(b)}, 0.35)`

  return {
    headR, chestW, bellyW, pelvisW, legW, armW, armRot,
    mouthYStart, mouthYControl, browYOuter, browYInner,
    baseColor, lightColor, glowColor
  }
}

export default function BodyFatLevelCard({ data }: Props) {
  const level = data.currentLevel ?? 1
  const {
    headR, chestW, bellyW, pelvisW, legW, armW, armRot,
    mouthYStart, mouthYControl, browYOuter, browYInner,
    baseColor, lightColor, glowColor
  } = buildFigure(level)

  const cx = 100

  // 부드러운 몸통 곡선 생성
  const bodyPath = `
    M ${cx - 14} 70
    C ${cx - chestW} 90, ${cx - bellyW} 130, ${cx - pelvisW} 160
    C ${cx} 170, ${cx} 170, ${cx + pelvisW} 160
    C ${cx + bellyW} 130, ${cx + chestW} 90, ${cx + 14} 70
    Z
  `

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

        {/* 캐릭터 일러스트 영역 */}
        <div className="w-full flex justify-center items-center mt-2 relative">
          <div
              className="absolute w-40 h-40 rounded-full blur-3xl opacity-50"
              style={{ backgroundColor: baseColor, top: '20%' }}
          />

          <svg width="200" height="240" viewBox="0 0 200 240" className="relative z-10">
            <defs>
              <radialGradient id="clay-grad" cx="35%" cy="30%" r="70%">
                <stop offset="0%" stopColor={lightColor} />
                <stop offset="80%" stopColor={baseColor} />
                <stop offset="100%" stopColor="rgba(0,0,0,0.3)" />
              </radialGradient>

              <filter id="drop-shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="6" stdDeviation="5" floodColor="#000" floodOpacity="0.35" />
              </filter>
            </defs>

            <g filter="url(#drop-shadow)">
              {/* 왼쪽 팔 */}
              <line
                  x1={cx - chestW + 2} y1={85}
                  x2={cx - chestW - 5} y2={140}
                  stroke="url(#clay-grad)" strokeWidth={armW} strokeLinecap="round"
                  transform={`rotate(${armRot}, ${cx - chestW}, 85)`}
              />
              {/* 오른쪽 팔 */}
              <line
                  x1={cx + chestW - 2} y1={85}
                  x2={cx + chestW + 5} y2={140}
                  stroke="url(#clay-grad)" strokeWidth={armW} strokeLinecap="round"
                  transform={`rotate(${-armRot}, ${cx + chestW}, 85)`}
              />
              {/* 왼쪽 다리 */}
              <line x1={cx - 14} y1={155} x2={cx - 16} y2={205} stroke="url(#clay-grad)" strokeWidth={legW} strokeLinecap="round" />
              {/* 오른쪽 다리 */}
              <line x1={cx + 14} y1={155} x2={cx + 16} y2={205} stroke="url(#clay-grad)" strokeWidth={legW} strokeLinecap="round" />
              {/* 몸통 */}
              <path d={bodyPath} fill="url(#clay-grad)" />
              {/* 머리 */}
              <circle cx={cx} cy={50} r={headR} fill="url(#clay-grad)" />
            </g>

            {/* 얼굴 표정 */}
            <g fill="none" stroke="#2a1f1b" strokeWidth={3} strokeLinecap="round">
              <line x1={cx - 14} y1={browYOuter} x2={cx - 6} y2={browYInner} />
              <line x1={cx + 6} y1={browYInner} x2={cx + 14} y2={browYOuter} />
              <circle cx={cx - 10} cy={48} r={3} fill="#2a1f1b" stroke="none" />
              <circle cx={cx + 10} cy={48} r={3} fill="#2a1f1b" stroke="none" />
              <path d={`M ${cx - 9} ${mouthYStart} Q ${cx} ${mouthYControl} ${cx + 9} ${mouthYStart}`} />
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