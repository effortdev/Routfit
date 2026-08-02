import { useState } from 'react'

interface Props {
  defaultDate: string
  onSubmit: (recordDate: string, weightKg: number, bodyFatPercent?: number) => Promise<void>
}

export default function WeightInputForm({ defaultDate, onSubmit }: Props) {
  const [date, setDate] = useState(defaultDate)
  const [weight, setWeight] = useState('')
  const [bodyFat, setBodyFat] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [savedMessage, setSavedMessage] = useState('')

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
            onChange={(e) => setBodyFat(e.target.value)}
            placeholder="선택"
            className="bg-panelSoft border border-line rounded-lg px-2 py-2.5 text-sm text-paper placeholder:text-paper/30 focus:outline-none focus:border-moss min-h-[44px]"
          />
        </label>
      </div>

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
