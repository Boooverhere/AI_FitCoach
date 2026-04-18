'use client'

import { DAY_LABELS } from '@/lib/exercises'
import type { ExerciseEntry } from '@/lib/exercises'
import { CheckCircle2, Minus } from 'lucide-react'

const TYPE_COLORS: Record<string, string> = {
  Strength: 'bg-orange-500/15 text-orange-400',
  Cardio:   'bg-red-500/15 text-red-400',
  HIIT:     'bg-rose-500/15 text-rose-400',
  Mobility: 'bg-blue-500/15 text-blue-400',
  Rest:     'bg-[var(--bg-hover)] text-[var(--fg-40)]',
}

export interface PlannedDay {
  id: string
  week_number: number
  day_of_week: number    // 0=Mon … 6=Sun
  workout_type: string
  exercises: ExerciseEntry[]
}

export interface WorkoutLogEntry {
  id: string
  date: string
  completed: boolean
  program_workout_id: string
  actual_performance: {
    sets_done: string
    reps_done: string
    weight_used: string
    notes: string
  }[]
}

interface Props {
  planned: PlannedDay[]
  logs: WorkoutLogEntry[]
  currentWeek: number
  programName: string
}

function fmtDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function ProgramPlanTab({ planned, logs, currentWeek, programName }: Props) {
  if (!planned.length) {
    return (
      <div className="p-10 text-center text-[var(--fg-30)] text-sm">
        No workout days configured for this program yet.
      </div>
    )
  }

  // Group planned days by week
  const weeks = [...new Set(planned.map((p) => p.week_number))].sort((a, b) => a - b)

  // Build a lookup: program_workout_id → most recent log
  const logByWorkoutId: Record<string, WorkoutLogEntry> = {}
  // logs are ordered desc by date, so first match wins (most recent)
  for (const log of logs) {
    if (!logByWorkoutId[log.program_workout_id]) {
      logByWorkoutId[log.program_workout_id] = log
    }
  }

  return (
    <div className="divide-y divide-[var(--border-5)]">
      {weeks.map((wk) => {
        const days = planned.filter((p) => p.week_number === wk).sort((a, b) => a.day_of_week - b.day_of_week)
        const isCurrent = wk === currentWeek

        return (
          <div key={wk}>
            {/* Week header */}
            <div className="flex items-center gap-3 px-5 py-3 bg-[var(--bg-subtle)]">
              <span className={`text-xs font-bold uppercase tracking-wider ${isCurrent ? 'text-[var(--accent-fg)]' : 'text-[var(--fg-40)]'}`}>
                Week {wk}
              </span>
              {isCurrent && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--accent-tint)] text-[var(--accent-fg)] border border-[var(--accent-border-sub)] font-semibold">
                  Current
                </span>
              )}
            </div>

            {/* Days */}
            {days.map((day) => (
              <DayRow
                key={`${wk}-${day.day_of_week}`}
                day={day}
                log={logByWorkoutId[day.id] ?? null}
              />
            ))}
          </div>
        )
      })}
    </div>
  )
}

function DayRow({ day, log }: { day: PlannedDay; log: WorkoutLogEntry | null }) {
  const hasLog = !!log

  return (
    <div className="px-5 py-4 hover:bg-[var(--bg-subtle)] transition-colors">
      {/* Day + type header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm font-semibold w-[88px]">{DAY_LABELS[day.day_of_week]}</span>
        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${TYPE_COLORS[day.workout_type] ?? TYPE_COLORS.Rest}`}>
          {day.workout_type}
        </span>
        {hasLog && log.completed && (
          <span className="flex items-center gap-1 text-[11px] text-[var(--accent-fg)] ml-auto">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Done {fmtDate(log.date)}
          </span>
        )}
        {hasLog && !log.completed && (
          <span className="text-[11px] text-yellow-400 ml-auto">In progress</span>
        )}
        {!hasLog && (
          <span className="text-[11px] text-[var(--fg-20)] ml-auto">Not logged</span>
        )}
      </div>

      {/* Exercises: planned vs actual */}
      {day.exercises.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {/* Column headers */}
          <div className="grid grid-cols-[1fr_80px_80px_100px] gap-2 px-2 mb-0.5">
            <span className="text-[10px] font-semibold text-[var(--fg-30)] uppercase tracking-wider">Exercise</span>
            <span className="text-[10px] font-semibold text-[var(--fg-30)] uppercase tracking-wider text-center">Sets</span>
            <span className="text-[10px] font-semibold text-[var(--fg-30)] uppercase tracking-wider text-center">Reps</span>
            <span className="text-[10px] font-semibold text-[var(--fg-30)] uppercase tracking-wider text-center">Weight</span>
          </div>

          {day.exercises.map((ex, i) => {
            const actual = log?.actual_performance?.[i]
            return (
              <div key={i} className="grid grid-cols-[1fr_80px_80px_100px] gap-2 bg-[var(--bg-elevated)] border border-[var(--border-5)] rounded-xl px-3 py-2 items-center">
                <div>
                  <p className="text-sm font-medium">{ex.name}</p>
                  {ex.coaching_note && <p className="text-[11px] text-[var(--fg-30)] italic">{ex.coaching_note}</p>}
                </div>
                <PlannedActualCell planned={String(ex.sets)} actual={actual?.sets_done} />
                <PlannedActualCell planned={ex.reps} actual={actual?.reps_done} />
                <PlannedActualCell planned={ex.weight_guidance} actual={actual?.weight_used} />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function PlannedActualCell({ planned, actual }: { planned: string; actual?: string }) {
  const hasActual = actual && actual.trim() !== ''
  return (
    <div className="text-center">
      <p className="text-xs text-[var(--fg-40)]">{planned || <Minus className="h-3 w-3 mx-auto opacity-30" />}</p>
      {hasActual && (
        <p className="text-xs font-semibold text-[var(--accent-fg)] mt-0.5">{actual}</p>
      )}
    </div>
  )
}
