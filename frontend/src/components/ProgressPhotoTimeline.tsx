import { useEffect, useState } from 'react'
import { MetricsEntry } from '../types'
import { getProgressPhotoUrl } from '../api/bodyMetrics'

interface Props {
    entries: MetricsEntry[]
}

// 사진이 있는 기록만 골라서 가로 스크롤 썸네일로 보여줌. 탭하면 크게 보기.
export default function ProgressPhotoTimeline({ entries }: Props) {
    const withPhoto = entries.filter((e) => e.hasPhoto)
    const [urls, setUrls] = useState<Record<string, string>>({})
    const [selected, setSelected] = useState<string | null>(null)

    useEffect(() => {
        let cancelled = false
        const objectUrls: string[] = []

        async function loadAll() {
            const entries = await Promise.all(
                withPhoto.map(async (e) => {
                    const url = await getProgressPhotoUrl(e.recordDate)
                    objectUrls.push(url)
                    return [e.recordDate, url] as const
                })
            )
            if (!cancelled) setUrls(Object.fromEntries(entries))
        }

        if (withPhoto.length > 0) loadAll()

        return () => {
            cancelled = true
            objectUrls.forEach((u) => URL.revokeObjectURL(u))
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [withPhoto.map((e) => e.recordDate).join(',')])

    if (withPhoto.length === 0) {
        return null
    }

    return (
        <div className="bg-panel border border-line rounded-card p-4">
            <h3 className="text-sm font-medium text-paper/70 mb-3">진행 사진</h3>
            <div className="flex gap-2 overflow-x-auto pb-1">
                {withPhoto.map((e) => (
                    <button
                        key={e.recordDate}
                        onClick={() => setSelected(e.recordDate)}
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

            {selected && urls[selected] && (
                <div
                    className="fixed inset-0 z-50 bg-ink/90 flex items-center justify-center p-6"
                    onClick={() => setSelected(null)}
                >
                    <img src={urls[selected]} alt={`${selected} 진행 사진 크게 보기`} className="max-w-full max-h-full rounded-lg" />
                </div>
            )}
        </div>
    )
}