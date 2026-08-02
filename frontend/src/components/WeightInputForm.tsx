import { useState } from 'react'
import { Gender } from '../types'
import { estimateBodyFatPercent } from '../utils/bodyFat'

interface Props {
  defaultDate: string
  userHeightCm?: number | null
  userGender?: Gender | null
  userAge?: number | null
  onSubmit: (recordDate: string, weightKg: number, bodyFatPercent?: number) => Promise<void>
}

export default function WeightInputForm({ defaultDate, userHeightCm, userGender, userAge, onSubmit }: Props) {
  const [date, setDate] = useState(defaultDate)
  const [weight, setWeight] = useState('')
  const [bodyFat, setBodyFat] = useState('')
  // 지금 bodyFat 값이 "자동계산으로 채워진 값"인지, "사용자가 직접 수정한 값"인지 구분
  const [isBodyFatAuto, setIsBodyFatAuto] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [savedMessage, setSavedMessage] = useState('')

  function handleWeightBlur() {
    if (!isBodyFatAuto) return // 사용자가 체지방률을 직접 수정했으면 자동계산으로 덮어쓰지 않음
    if (!userHeightCm || !userGender) return // 마이페이지에 키/성별이 없으면 계산 불가

    const weightNum = parseFloat(weight)
    if (!weightNum || weightNum <= 0) return

    const estimated = estimateBodyFatPercent(userGender, userAge, userHeightCm, weightNum)
    setBodyFat(estimated.toString())
  }

  function handleBodyFatChange(value: string) {
    setBodyFat(value)
    setIsBodyFatAuto(false) // 사용자가 직접 건드리면 더 이상 자동계산 대상 아님
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const weightNum = parseFloat(weight)
    if (!weightNum || weightNum <= 0) return

    setIsSaving(true)
    setSavedMessage('')
    try {
      await onSubmit(date, weightNum, bodyFat ? parseFloat(bodyFat) : undefined)
      setSavedMessage('저장했어요.')
      setTimeout(() => setSavedMessage(''), 2000)
    } finally {
      setIsSaving(false)
    }
  }

  return (
      <form onSubmit={handleSubmit} className="bg-panel border border-line rounded-card p-4 flex flex-col gap-3">
        <h3 className="text-sm font-medium text-paper/70">오늘 몸무게 기록</h3>

        <div className="grid grid-cols-3 gap-2">
          <label className="col-span-1 flex flex-col gap-1">
            <span className="text-[11px] text-paper/40">날짜</span>
            <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-panelSoft border border-line rounded-lg px-2 py-2.5 text-sm text-paper focus:outline-none focus:border-moss min-h-[44px]"
            />
          </label>
          <label className="col-span-1 flex flex-col gap-1">
            <span className="text-[11px] text-paper/40">몸무게 (kg)</span>
            <input
                type="number"
                inputMode="decimal"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                onBlur={handleWeightBlur}
                placeholder="0.0"
                required
                className="bg-panelSoft border border-line rounded-lg px-2 py-2.5 text-sm text-paper placeholder:text-paper/30 focus:outline-none focus:border-moss min-h-[44px]"
            />
          </label>
          <label className="col-span-1 flex flex-col gap-1">
            <span className="text-[11px] text-paper/40">체지방률 (%)</span>
            <input
                type="number"
                inputMode="decimal"
                step="0.1"
                value={bodyFat}
                onChange={(e) => handleBodyFatChange(e.target.value)}
                placeholder="비워두면 자동계산"
                className="bg-panelSoft border border-line rounded-lg px-2 py-2.5 text-sm text-paper placeholder:text-paper/30 focus:outline-none focus:border-moss min-h-[44px]"
            />
          </label>
        </div>

        {isBodyFatAuto && bodyFat && (
            <p className="text-[11px] text-moss -mt-1">키·성별 기반 자동계산 값이에요. 직접 수정할 수도 있어요.</p>
        )}

        <button
            type="submit"
            disabled={isSaving}
            className="bg-ember text-ink font-medium rounded-card py-3 min-h-[44px] active:scale-95 transition disabled:opacity-50"
        >
          {isSaving ? '저장 중...' : savedMessage || '기록 저장'}
        </button>
      </form>
  )
}