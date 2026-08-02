import { Gender } from '../types'

const DEFAULT_AGE = 30 // 나이 미입력 시 가정하는 평균 성인 나이 (백엔드 BodyFatEstimationService와 동일)

// Deurenberg 공식: 체지방률(%) = 1.20 × BMI + 0.23 × 나이 − 10.8 × 성별계수 − 5.4
// 백엔드 저장 시 최종 계산은 서버가 다시 하지만, 입력 중 미리보기를 위해 프론트에서도 동일 공식 사용.
export function estimateBodyFatPercent(
    gender: Gender | null | undefined,
    age: number | null | undefined,
    heightCm: number,
    weightKg: number
): number {
    const heightM = heightCm / 100
    const bmi = weightKg / (heightM * heightM)
    const effectiveAge = age ?? DEFAULT_AGE
    const genderFactor = gender === 'MALE' ? 1 : 0

    const bodyFat = 1.2 * bmi + 0.23 * effectiveAge - 10.8 * genderFactor - 5.4
    const clamped = Math.max(3, Math.min(60, bodyFat))
    return Math.round(clamped * 10) / 10
}