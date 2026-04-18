'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  assignmentId: string
  programName: string
  durationWeeks: number
  currentWeek: number
  status: 'active' | 'paused' | 'completed'
}

export function ProgramControls({
  assignmentId,
  programName,
  durationWeeks,
  currentWeek,
  status,
}: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  async function update(patch: Record<string, unknown>) {
    setLoading(Object.keys(patch)[0])
    const supabase = createClient()
    await supabase.from('client_programs').update(patch).eq('id', assignmentId)
    setLoading(null)
    router.refresh()
  }

  async function handleReset() {
    if (!confirm(`Reset "${programName}" back to Week 1?`)) return
    update({ current_week: 1, status: 'active', start_date: new Date().toISOString().slice(0, 10) })
  }

  const isPaused = status === 'paused'

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-8)] rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="font-semibold">{programName}</p>
          <p className="text-xs text-[var(--fg-40)] mt-0.5">
            Week {currentWeek} of {durationWeeks}
            {isPaused && (
              <span className="ml-2 text-yellow-400 font-medium">· Paused</span>
            )}
            {status === 'completed' && (
              <span className="ml-2 text-[var(--accent-fg)] font-medium">· Completed</span>
            )}
          </p>
        </div>

        {/* Pause / resume */}
        {status !== 'completed' && (
          <button
            onClick={() => update({ status: isPaused ? 'active' : 'paused' })}
            disabled={loading === 'status'}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl border transition-colors ${
              isPaused
                ? 'bg-[var(--accent-tint)] border-[var(--accent-border-sub)] text-[var(--accent-fg)]'
                : 'bg-[var(--bg-hover)] border-[var(--border-8)] text-[var(--fg-50)] hover:text-[var(--fg)]'
            }`}
          >
            {isPaused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
            {isPaused ? 'Resume' : 'Pause'}
          </button>
        )}
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-[var(--border)] rounded-full overflow-hidden mb-3">
        <div
          className="h-full bg-[var(--accent)] rounded-full transition-all"
          style={{ width: `${(currentWeek / durationWeeks) * 100}%` }}
        />
      </div>

      {/* Week dots */}
      <div className="flex gap-1 mb-4 flex-wrap">
        {Array.from({ length: durationWeeks }, (_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 min-w-[6px] rounded-full transition-colors ${
              i + 1 < currentWeek
                ? 'bg-[var(--accent)]'
                : i + 1 === currentWeek
                ? isPaused
                  ? 'bg-yellow-400'
                  : 'bg-[var(--accent)] opacity-60'
                : 'bg-[var(--border)]'
            }`}
          />
        ))}
      </div>

      {/* Manual week controls + reset */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => update({ current_week: Math.max(1, currentWeek - 1) })}
          disabled={currentWeek <= 1 || loading === 'current_week'}
          className="h-8 w-8 rounded-xl flex items-center justify-center bg-[var(--bg-hover)] text-[var(--fg-40)] hover:text-[var(--fg)] disabled:opacity-30 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-medium flex-1 text-center">
          Week {currentWeek}
        </span>
        <button
          onClick={() => update({ current_week: Math.min(durationWeeks, currentWeek + 1), status: Math.min(durationWeeks, currentWeek + 1) > durationWeeks ? 'completed' : status })}
          disabled={currentWeek >= durationWeeks || loading === 'current_week'}
          className="h-8 w-8 rounded-xl flex items-center justify-center bg-[var(--bg-hover)] text-[var(--fg-40)] hover:text-[var(--fg)] disabled:opacity-30 transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
        <button
          onClick={handleReset}
          disabled={loading === 'start_date'}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl bg-[var(--bg-hover)] border border-[var(--border-8)] text-[var(--fg-40)] hover:text-[var(--fg)] transition-colors"
        >
          <RotateCcw className="h-3 w-3" />
          Reset
        </button>
      </div>
    </div>
  )
}
