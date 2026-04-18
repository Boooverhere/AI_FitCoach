'use client'

import { useState } from 'react'
import { CopyPlus, Copy, ChevronDown, ChevronUp, X, Check } from 'lucide-react'
import { WorkoutDayEditor } from './WorkoutDayEditor'
import { DAY_LABELS, type DayState, blankDay } from '@/lib/exercises'

interface CoachHabit { id: string; label: string; icon: string }

export interface WeekState {
  habitIds: string[]
  inheritPrev: boolean
  additions: string[]
  days: DayState[]    // 7 entries, Mon=0 … Sun=6
}

interface Props {
  weekIdx: number
  week: WeekState
  coachHabits: CoachHabit[]
  lockedHabitIds: string[]           // inherited from prev week
  isFirst: boolean
  hasNext: boolean
  onUpdate: (patch: Partial<WeekState>) => void
  onUpdateDay: (dayIdx: number, day: DayState) => void
  onCopyDay: (fromDay: number, toDay: number) => void
  onCopyToNext: () => void
  onToggleInherit: () => void
}

export function WeekEditor({
  weekIdx, week, coachHabits, lockedHabitIds, isFirst, hasNext,
  onUpdate, onUpdateDay, onCopyDay, onCopyToNext, onToggleInherit,
}: Props) {
  const [expanded, setExpanded] = useState(weekIdx === 0)
  const [habitsOpen, setHabitsOpen] = useState(false)

  const lockedSet = new Set(lockedHabitIds)
  const selectedSet = new Set(week.habitIds)

  function toggleHabit(id: string) {
    if (lockedSet.has(id)) return
    const next = new Set(selectedSet)
    if (next.has(id)) next.delete(id)
    else next.add(id)

    if (week.inheritPrev) {
      const additions = [...next].filter((hid) => !lockedSet.has(hid))
      onUpdate({ habitIds: [...next], additions })
    } else {
      onUpdate({ habitIds: [...next] })
    }
  }

  // Count non-rest days
  const activeDays = week.days.filter((d) => d.workout_type !== 'Rest' && d.exercises.length > 0).length
  const totalExercises = week.days.reduce((sum, d) => sum + d.exercises.length, 0)

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-8)] rounded-2xl overflow-hidden">
      {/* Week header */}
      <div className="flex items-center gap-3 px-5 py-3.5 cursor-pointer hover:bg-[var(--bg-hover)] transition-colors"
        onClick={() => setExpanded((o) => !o)}>
        <span className="h-7 w-7 rounded-xl bg-[var(--accent-tint)] text-[var(--accent-fg)] text-xs font-bold flex items-center justify-center flex-shrink-0">
          {weekIdx + 1}
        </span>
        <div className="flex-1">
          <span className="font-semibold">Week {weekIdx + 1}</span>
          <span className="text-xs text-[var(--fg-40)] ml-2">
            {week.habitIds.length > 0 && `${week.habitIds.length} habit${week.habitIds.length !== 1 ? 's' : ''}`}
            {activeDays > 0 && ` · ${activeDays} workout day${activeDays !== 1 ? 's' : ''} · ${totalExercises} exercise${totalExercises !== 1 ? 's' : ''}`}
          </span>
        </div>
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          {!isFirst && (
            <button
              type="button"
              onClick={onToggleInherit}
              className={`flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-xl border transition-all ${
                week.inheritPrev
                  ? 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                  : 'bg-[var(--bg-hover)] border-[var(--border-8)] text-[var(--fg-40)] hover:text-[var(--fg)]'
              }`}
            >
              <CopyPlus className="h-3 w-3" />
              Same as wk {weekIdx}
            </button>
          )}
          {hasNext && (
            <button
              type="button"
              onClick={onCopyToNext}
              className="flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-xl border bg-[var(--bg-hover)] border-[var(--border-8)] text-[var(--fg-40)] hover:text-[var(--fg)] transition-all"
            >
              <Copy className="h-3 w-3" />
              Copy to wk {weekIdx + 2}
            </button>
          )}
        </div>
        {expanded ? <ChevronUp className="h-4 w-4 text-[var(--fg-30)] flex-shrink-0" /> : <ChevronDown className="h-4 w-4 text-[var(--fg-30)] flex-shrink-0" />}
      </div>

      {expanded && (
        <div className="border-t border-[var(--border-8)] p-4 flex flex-col gap-4">

          {/* ── Habits (collapsible) ── */}
          <div className="border border-[var(--border-8)] rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setHabitsOpen((o) => !o)}
              className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-[var(--bg-hover)] transition-colors"
            >
              <span className="text-xs font-semibold text-[var(--fg-50)] uppercase tracking-wider">
                Habits {week.habitIds.length > 0 ? `(${week.habitIds.length})` : ''}
              </span>
              {habitsOpen ? <ChevronUp className="h-3.5 w-3.5 text-[var(--fg-30)]" /> : <ChevronDown className="h-3.5 w-3.5 text-[var(--fg-30)]" />}
            </button>

            {habitsOpen && (
              <div className="px-4 pb-4 pt-1">
                {week.inheritPrev && lockedHabitIds.length > 0 && (
                  <p className="text-xs text-[var(--fg-40)] mb-2">
                    Inheriting {lockedHabitIds.length} habit{lockedHabitIds.length !== 1 ? 's' : ''} from previous week.
                  </p>
                )}
                {coachHabits.length === 0 ? (
                  <p className="text-sm text-[var(--fg-30)] italic">No habit templates — create some first.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {coachHabits.map((h) => {
                      const isSelected = selectedSet.has(h.id)
                      const isLocked = lockedSet.has(h.id)
                      return (
                        <button
                          key={h.id}
                          type="button"
                          onClick={() => toggleHabit(h.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium border transition-all ${
                            isSelected
                              ? isLocked
                                ? 'bg-[var(--accent-tint)] border-[var(--accent-border-sub)] text-[var(--accent-fg)] opacity-70 cursor-default'
                                : 'bg-[var(--accent-tint)] border-[var(--accent-border)] text-[var(--accent-fg)]'
                              : 'bg-[var(--bg-hover)] border-[var(--border-8)] text-[var(--fg-50)] hover:text-[var(--fg)]'
                          }`}
                        >
                          <span>{h.icon}</span>
                          <span>{h.label}</span>
                          {isSelected && !isLocked && <X className="h-3 w-3 opacity-60" />}
                          {isLocked && <Check className="h-3 w-3" />}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Workout days ── */}
          <div>
            <p className="text-xs font-semibold text-[var(--fg-40)] uppercase tracking-wider mb-2">Workout Plan</p>
            <div className="flex flex-col gap-2">
              {week.days.map((day, dayIdx) => (
                <WorkoutDayEditor
                  key={dayIdx}
                  dayIdx={dayIdx}
                  day={day}
                  otherDays={[0, 1, 2, 3, 4, 5, 6].filter((d) => d !== dayIdx)}
                  onChange={(d) => onUpdateDay(dayIdx, d)}
                  onCopyTo={(to) => onCopyDay(dayIdx, to)}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export function makeWeekDays(): DayState[] {
  return Array.from({ length: 7 }, () => blankDay())
}
