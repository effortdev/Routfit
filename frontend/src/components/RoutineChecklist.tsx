import { useState } from 'react'
import { Routine } from '../types'

interface Props {
  routines: Routine[]
  onToggle: (id: number, completed: boolean) => void
  onAdd: (title: string) => void
  onDelete: (id: number) => void
}

export default function RoutineChecklist({ routines, onToggle, onAdd, onDelete }: Props) {
  const [newTitle, setNewTitle] = useState('')

  function handleAdd() {
    const trimmed = newTitle.trim()
    if (!trimmed) return
    onAdd(trimmed)
    setNewTitle('')
  }

  return (
    <div className="flex flex-col gap-2">
      {routines.length === 0 && (
        <div className="bg-panel border border-line rounded-card p-6 text-center text-paper/40 text-sm">
          아직 등록된 루틴이 없어요. 아래에서 첫 루틴을 추가해보세요.
        </div>
      )}

      {routines.map((routine) => (
        <div
          key={routine.id}
          className="bg-panel border border-line rounded-card px-4 py-3 flex items-center gap-3"
        >
          <button
            onClick={() => onToggle(routine.id, !routine.completedToday)}
            className={`w-6 h-6 min-w-[24px] rounded-full border-2 flex items-center justify-center transition active:scale-90 ${
              routine.completedToday ? 'bg-moss border-moss' : 'border-line'
            }`}
            aria-label={routine.completedToday ? '완료 취소' : '완료 처리'}
          >
            {routine.completedToday && (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#101314" strokeWidth={3}>
                <path d="m5 13 4 4 10-10" />
              </svg>
            )}
          </button>
          <span className={`flex-1 text-sm ${routine.completedToday ? 'text-paper/40 line-through' : 'text-paper'}`}>
            {routine.title}
          </span>
          <button
            onClick={() => onDelete(routine.id)}
            className="text-paper/30 active:text-paper/60 text-xs px-2 py-1"
            aria-label="루틴 삭제"
          >
            삭제
          </button>
        </div>
      ))}

      <div className="flex gap-2 mt-1">
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="새 루틴 이름 (예: 물 2L 마시기)"
          className="flex-1 bg-panelSoft border border-line rounded-card px-4 py-3 text-sm text-paper placeholder:text-paper/30 focus:outline-none focus:border-moss min-h-[44px]"
        />
        <button
          onClick={handleAdd}
          className="bg-moss text-ink font-medium rounded-card px-4 min-h-[44px] active:scale-95 transition"
        >
          추가
        </button>
      </div>
    </div>
  )
}
