import { useEffect, useRef, useState } from 'react'
import { MetricsEntry } from '../types'
import { getMetricsRange, getProgressPhotoUrl, uploadProgressPhoto, deleteProgressPhoto } from '../api/bodyMetrics'
import { compressImage } from '../utils/imageCompress'

interface Props {
    refreshTrigger: number // 부모(몸무게 폼)에서 저장할 때마다 값이 바뀌어서 재조회를 유발
}

const WINDOW_DAYS = 30

function toIsoDate(d: Date): string {
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

function formatShort(dateStr: string): string {
    const d = new Date(dateStr)
    return `${d.getMonth() + 1}/${d.getDate()}`
}

function defaultRangeStart(): Date {
    const d = new Date()
    d.setDate(d.getDate() - (WINDOW_DAYS - 1))
    return d
}

// 사진 있는 날짜만 골라 가로 스크롤 썸네일로 보여줌. 날짜를 직접 골라서 그 날짜부터 이어서 볼 수 있고,
// 크게 보기 화면에서 사진 교체/삭제도 가능함.
export default function ProgressPhotoTimeline({ refreshTrigger }: Props) {
    const [rangeStart, setRangeStart] = useState<Date>(defaultRangeStart())
    const [entries, setEntries] = useState<MetricsEntry[]>([])
    const [urls, setUrls] = useState<Record<string, string>>({})
    const [selectedDate, setSelectedDate] = useState<string | null>(null)
    const [isReplacing, setIsReplacing] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const today = new Date()
    const rangeEnd = new Date(Math.min(
        new Date(rangeStart).setDate(rangeStart.getDate() + (WINDOW_DAYS - 1)),
        today.getTime()
    ))
    const isDefaultRange = toIsoDate(rangeStart) === toIsoDate(defaultRangeStart())

    async function loadEntries() {
        const data = await getMetricsRange(toIsoDate(rangeStart), toIsoDate(rangeEnd))
        setEntries(data)

        const withPhoto = data.filter((e) => e.hasPhoto)
        const pairs = await Promise.all(
            withPhoto.map(async (e) => [e.recordDate, await getProgressPhotoUrl(e.recordDate)] as const)
        )
        setUrls((prev) => {
            Object.values(prev).forEach((u) => URL.revokeObjectURL(u))
            return Object.fromEntries(pairs)
        })
    }

    useEffect(() => {
        loadEntries()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [toIsoDate(rangeStart), refreshTrigger])

    const withPhoto = entries.filter((e) => e.hasPhoto)
    const selectedUrl = selectedDate ? urls[selectedDate] : null

    function handleJumpToDate(dateStr: string) {
        setRangeStart(new Date(dateStr))
    }

    function handleResetRange() {
        setRangeStart(defaultRangeStart())
    }

    async function handleReplace(file: File) {
        if (!selectedDate) return
        setIsReplacing(true)
        try {
            const compressed = await compressImage(file)
            await uploadProgressPhoto(selectedDate, compressed)
            await loadEntries()
        } finally {
            setIsReplacing(false)
        }
    }

    async function handleDelete() {
        if (!selectedDate) return
        if (!confirm('이 사진을 삭제할까요?')) return
        setIsDeleting(true)
        try {
            await deleteProgressPhoto(selectedDate)
            setSelectedDate(null)
            await loadEntries()
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <div className="bg-panel border border-line rounded-card p-4">
            <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
                <h3 className="text-sm font-medium text-paper/70">진행 사진</h3>
                <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-mono text-paper/40">
            {formatShort(toIsoDate(rangeStart))} ~ {formatShort(toIsoDate(rangeEnd))}
          </span>
                    <input
                        type="date"
                        onChange={(e) => e.target.value && handleJumpToDate(e.target.value)}
                        title="이 날짜부터 사진 보기"
                        className="bg-panelSoft border border-line rounded-lg px-2 py-1 text-[11px] text-paper focus:outline-none focus:border-moss"
                    />
                    {!isDefaultRange && (
                        <button onClick={handleResetRange} className="text-[11px] text-moss px-1 py-1">
                            최근으로
                        </button>
                    )}
                </div>
            </div>

            {withPhoto.length === 0 ? (
                <p className="text-xs text-paper/30 py-2">이 기간에 등록된 사진이 없어요.</p>
            ) : (
                <div className="flex gap-2 overflow-x-auto pb-1">
                    {withPhoto.map((e) => (
                        <button
                            key={e.recordDate}
                            onClick={() => setSelectedDate(e.recordDate)}
                            className="flex-shrink-0 flex flex-col items-center gap-1"
                        >
                            <div className="w-16 h-16 rounded-lg overflow-hidden bg-panelSoft border border-line">
                                {urls[e.recordDate] && (
                                    <img src={urls[e.recordDate]} alt={`${e.recordDate} 진행 사진`} className="w-full h-full object-cover" />
                                )}
                            </div>
                            <span className="text-[10px] text-paper/40 font-mono">{e.recordDate.slice(5)}</span>
                        </button>
                    ))}
                </div>
            )}

            {selectedDate && selectedUrl && (
                <div
                    className="fixed inset-0 z-50 bg-ink/90 flex flex-col items-center justify-center p-6 gap-4"
                    onClick={() => setSelectedDate(null)}
                >
                    <span className="text-sm text-paper/70 font-mono">{formatShort(selectedDate)}</span>
                    <img
                        src={selectedUrl}
                        alt={`${selectedDate} 진행 사진 크게 보기`}
                        className="max-w-full max-h-[65vh] rounded-lg"
                        onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            className="hidden"
                            onChange={(e) => e.target.files?.[0] && handleReplace(e.target.files[0])}
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isReplacing || isDeleting}
                            className="bg-panelSoft text-paper text-xs font-medium rounded-lg px-3 py-2 disabled:opacity-50"
                        >
                            {isReplacing ? '교체 중...' : '사진 교체'}
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={isReplacing || isDeleting}
                            className="bg-ember/20 text-ember text-xs font-medium rounded-lg px-3 py-2 disabled:opacity-50"
                        >
                            {isDeleting ? '삭제 중...' : '삭제'}
                        </button>
                        <button
                            onClick={() => setSelectedDate(null)}
                            className="text-paper/50 text-xs px-3 py-2"
                        >
                            닫기
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}