'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Dumbbell, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react'
import type { ExerciseEntry } from '@/lib/exercises'

const TYPE_COLORS: Record<string, string> = {
  Strength: 'bg-orange-500/15 text-orange-400',
  Cardio:   'bg-red-500/15 text-red-400',
  HIIT:     'bg-rose-500/15 text-rose-400',
  Mobility: 'bg-blue-500/15 text-blue-400',
  Rest:     'bg-[var(--bg-hover)] text-[var(--fg-40)]',
}

export interface PlannedWorkout {
  id: string          // program_workouts.id
  workout_type: string
  exercises: ExerciseEntry[]
}

interface ActualEntry {
  sets_done: string
  reps_done: string
  weight_used: string
  notes: string
}

interface Props {
  clientId: string
  today: string
  planned: PlannedWorkout
  existingLog: {
    id: string
    completed: boolean
    actual_performance: ActualEntry[]
  } | null
}

export function TodaysWorkout({ clientId, today, planned, existingLog }: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [expanded, setExpanded] = useState(true)
  const [completed, setCompleted] = useState(existingLog?.completed ?? false)
  const [saving, setSaving] = useState(false)
  const [actuals, setActuals] = useState<ActualEntry[]>(() => {
    if (existingLog?.actual_performance?.length) return existingLog.actual_performance
    return planned.exercises.map(() => ({ sets_done: '', reps_done: '', weight_used: '', notes: '' }))
  })

  function updateActual(i: number, patch: Partial<ActualEntry>) {
    setActuals((prev) => prev.map((a, idx) => idx === i ? { ...a, ...patch } : a))
  }

  async function handleComplete() {
    setSaving(true)
    const payload = {
      client_id: clientId,
      program_workout_id: planned.id,
      date: today,
      actual_performance: actuals,
      completed: true,
    }

    if (existingLog) {
      await supabase
        .from('workout_logs')
        .update({ actual_performance: actuals, completed: true })
        .eq('id', existingLog.id)
    } else {
      await supabase.from('workout_logs').insert(payload)
    }

    setCompleted(true)
    setSaving(false)
    router.refresh()
  }

  async function handleSaveProgress() {
    setSaving(true)
    const payload = {
      client_id: clientId,
      program_workout_id: planned.id,
      date: today,
      actual_performance: actuals,
      completed: false,
    }

    if (existingLog) {
      await supabase
        .from('workout_logs')
        .update({ actual_performance: actuals })
        .eq('id', existingLog.id)
    } else {
      await supabase.from('workout_logs').upsert(payload, { onConflict: 'client_id,date' })
    }

    setSaving(false)
    router.refresh()
  }

  if (planned.exercises.length === 0) return null

  return (
    <div className={`rounded-2xl border overflow-hidden ${
      completed
        ? 'bg-[var(--accent-wash)] border-[var(--accent-border-sub)]'
        : 'bg-[var(--bg-surface)] border-[var(--border-8)]'
    }`}>
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4"
      >
        <div className="flex items-center gap-3">
          <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${
            completed ? 'bg-[var(--accent)] text-[var(--accent-on-solid)]' : 'bg-[var(--bg-hover)]'
          }`}>
            {completed
              ? <CheckCircle2 className="h-5 w-5" />
              : <Dumbbell className="h-5 w-5 text-[var(--fg-40)]" />
            }
          </div>
          <div className="text-left">
            <p className="font-bold text-sm">
              {completed ? "Today's workout complete ✓" : "Today's workout"}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${TYPE_COLORS[planned.workout_type] ?? TYPE_COLORS.Rest}`}>
                {planned.workout_type}
              </span>
              <span className="text-xs text-[var(--fg-40)]">{planned.exercises.length} exercise{planned.exercises.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>
        {expanded ? <ChevronUp className="h-4 w-4 text-[var(--fg-30)]" /> : <ChevronDown className="h-4 w-4 text-[var(--fg-30)]" />}
      </button>

      {/* Exercise list */}
      {expanded && (
        <div className="border-t border-[var(--border-8)] px-5 py-4 flex flex-col gap-3">
          {planned.exercises.map((ex, i) => (
            <div key={i} className="bg-[var(--bg-elevated)] border border-[var(--border-5)] rounded-xl p-4">
              {/* Exercise name, badges, coaching note — stacked so nothing gets squeezed */}
              <div className="mb-3">
                <p className="font-semibold text-sm leading-snug">{ex.name}</p>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {ex.sets && (
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-[var(--bg-hover)] text-[var(--fg-50)]">
                      {ex.sets} sets
                    </span>
                  )}
                  {ex.reps && (
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-[var(--bg-hover)] text-[var(--fg-50)]">
                      {ex.reps} reps
                    </span>
                  )}
                  {ex.weight_guidance && (
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-[var(--bg-hover)] text-[var(--fg-50)]">
                      {ex.weight_guidance}
                    </span>
                  )}
                  {ex.rest_seconds > 0 && (
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-[var(--bg-hover)] text-[var(--fg-30)]">
                      {ex.rest_seconds}s rest
                    </span>
                  )}
                </div>
                {ex.coaching_note && (
                  <p className="text-xs text-[var(--fg-40)] italic mt-1.5 leading-snug">{ex.coaching_note}</p>
                )}
              </div>

              {/* Actual performance inputs */}
              <div className="grid grid-cols-3 gap-2">
                <ActualField
                  label="Sets done"
                  value={actuals[i]?.sets_done ?? ''}
                  placeholder={String(ex.sets)}
                  onChange={(v) => updateActual(i, { sets_done: v })}
                  disabled={completed}
                />
                <ActualField
                  label="Reps done"
                  value={actuals[i]?.reps_done ?? ''}
                  placeholder={ex.reps}
                  onChange={(v) => updateActual(i, { reps_done: v })}
                  disabled={completed}
                />
                <ActualField
                  label="Weight used"
                  value={actuals[i]?.weight_used ?? ''}
                  placeholder={ex.weight_guidance || 'kg'}
                  onChange={(v) => updateActual(i, { weight_used: v })}
                  disabled={completed}
                />
              </div>
              <input
                type="text"
                value={actuals[i]?.notes ?? ''}
                onChange={(e) => updateActual(i, { notes: e.target.value })}
                disabled={completed}
                placeholder="Notes (optional)"
                className="mt-2 w-full bg-[var(--bg-input)] border border-[var(--border-8)] rounded-lg px-3 py-1.5 text-xs text-[var(--fg-60)] placeholder:text-[var(--fg-20)] focus:outline-none focus:border-[var(--accent)] disabled:opacity-40 transition-colors"
              />
            </div>
          ))}

          {!completed && (
            <div className="flex gap-2 pt-1">
              <button
                onClick={handleSaveProgress}
                disabled={saving}
                className="text-xs px-3 py-1.5 rounded-lg bg-[var(--bg-hover)] text-[var(--fg-50)] hover:text-[var(--fg)] border border-[var(--border-8)] transition-colors disabled:opacity-50"
              >
                Save progress
              </button>
              <Button loading={saving} onClick={handleComplete} className="flex-1">
                Complete workout ✓
              </Button>
            </div>
          )}

          {completed && (
            <div className="flex items-center justify-center gap-2 py-1 text-[var(--accent-fg)] text-sm font-medium">
              <CheckCircle2 className="h-4 w-4" />
              Workout logged for today
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ActualField({
  label, value, placeholder, onChange, disabled,
}: {
  label: string; value: string; placeholder: string
  onChange: (v: string) => void; disabled: boolean
}) {
  return (
    <div>
      <p className="text-[10px] font-semibold text-[var(--fg-30)] uppercase tracking-wider mb-1">{label}</p>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full bg-[var(--bg-input)] border border-[var(--border-8)] rounded-lg px-2 py-1.5 text-xs text-[var(--fg)] placeholder:text-[var(--fg-20)] focus:outline-none focus:border-[var(--accent)] disabled:opacity-40 transition-colors"
      />
    </div>
  )
}
