'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Flame, CheckCircle2, Circle } from 'lucide-react'

interface Habit {
  id: string
  label: string
  icon: string
}

interface ClientHabit {
  clientHabitId: string
  streak: number
  habit: Habit
}

interface TodayCheckin {
  id: string
  completed_habits: string[]
  note: string
}

interface Props {
  clientId: string
  habits: ClientHabit[]
  todayCheckin: TodayCheckin | null
  today: string
}

export function CheckInForm({ clientId, habits, todayCheckin, today }: Props) {
  const [checked, setChecked] = useState<Set<string>>(
    new Set(todayCheckin?.completed_habits ?? [])
  )
  const [note, setNote] = useState(todayCheckin?.note ?? '')
  const [submitted, setSubmitted] = useState(!!todayCheckin)
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  function toggle(habitId: string) {
    if (submitted && !editing) return
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(habitId)) next.delete(habitId)
      else next.add(habitId)
      return next
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const completedHabits = [...checked]

    if (todayCheckin && editing) {
      // Update existing
      await supabase
        .from('checkins')
        .update({ completed_habits: completedHabits, note })
        .eq('id', todayCheckin.id)
    } else {
      // Insert new
      await supabase.from('checkins').upsert({
        client_id: clientId,
        date: today,
        completed_habits: completedHabits,
        note,
      })

      // Update streaks for completed habits
      for (const ch of habits) {
        const wasDone = completedHabits.includes(ch.habit.id)
        await supabase
          .from('client_habits')
          .update({ streak: wasDone ? ch.streak + 1 : 0 })
          .eq('id', ch.clientHabitId)
      }
    }

    setSubmitted(true)
    setEditing(false)
    setLoading(false)
    router.refresh()
  }

  const allDone = habits.length > 0 && habits.every((h) => checked.has(h.habit.id))
  const doneFraction = `${checked.size}/${habits.length}`

  if (!habits.length) {
    return (
      <div className="bg-[var(--bg-surface)] border border-[var(--border-8)] rounded-2xl p-10 text-center flex flex-col items-center gap-3">
        <span className="text-4xl">🏋️</span>
        <h3 className="font-semibold">No habits assigned yet</h3>
        <p className="text-sm text-[var(--fg-40)]">
          Your coach hasn&apos;t assigned any habits yet. Check back soon!
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header card */}
      <div
        className={`rounded-2xl p-5 border ${
          submitted && !editing
            ? 'bg-[var(--accent-wash)] border-[var(--accent-border-sub)]'
            : 'bg-[var(--bg-surface)] border-[var(--border-8)]'
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-bold text-lg">
              {submitted && !editing ? "Today's check-in ✓" : "Today's check-in"}
            </h2>
            <p className="text-sm text-[var(--fg-40)]">
              {submitted && !editing
                ? `${doneFraction} habits completed`
                : `Complete your ${habits.length} habits`}
            </p>
          </div>
          {submitted && !editing && (
            <button
              onClick={() => setEditing(true)}
              className="text-xs px-3 py-1.5 rounded-lg bg-[var(--bg-hover)] hover:bg-[var(--bg-surface)] text-[var(--fg-50)] hover:text-[var(--fg)] transition-colors"
            >
              Edit
            </button>
          )}
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-[var(--border)] rounded-full overflow-hidden mb-1">
          <div
            className="h-full bg-[var(--accent)] rounded-full transition-all duration-500"
            style={{ width: habits.length ? `${(checked.size / habits.length) * 100}%` : '0%' }}
          />
        </div>
        <p className="text-xs text-[var(--fg-30)] text-right">{doneFraction}</p>
      </div>

      {/* Habit checkboxes */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {habits.map(({ habit, streak, clientHabitId }) => {
          const done = checked.has(habit.id)
          const isDisabled = submitted && !editing
          return (
            <button
              key={clientHabitId}
              type="button"
              disabled={isDisabled}
              onClick={() => toggle(habit.id)}
              className={`
                w-full flex items-center gap-4 px-5 py-4 rounded-2xl border-2 text-left transition-all duration-150
                ${isDisabled ? 'cursor-default' : 'cursor-pointer'}
                ${
                  done
                    ? 'bg-[var(--accent-tint)] border-[var(--accent-border)]'
                    : 'bg-[var(--bg-surface)] border-[var(--border-8)] hover:border-[var(--border)]'
                }
              `}
            >
              {/* Check icon */}
              <div className={`flex-shrink-0 ${done ? 'text-[var(--accent-fg)]' : 'text-[var(--fg-20)]'}`}>
                {done ? (
                  <CheckCircle2 className="h-6 w-6" />
                ) : (
                  <Circle className="h-6 w-6" />
                )}
              </div>

              {/* Icon + label */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="text-2xl">{habit.icon}</span>
                <span
                  className={`font-medium ${
                    done ? 'text-[var(--accent-fg-muted)] line-through decoration-[var(--accent-border-sub)]' : 'text-[var(--fg)]'
                  }`}
                >
                  {habit.label}
                </span>
              </div>

              {/* Streak */}
              {streak > 0 && (
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Flame className="h-4 w-4 text-orange-400" />
                  <span className="text-sm font-semibold text-orange-400">{streak}</span>
                </div>
              )}
            </button>
          )
        })}

        {/* Daily note */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-8)] rounded-2xl p-5">
          <label className="text-sm font-medium text-[var(--fg-70)] block mb-2">
            Daily note <span className="text-[var(--fg-30)] font-normal">(optional)</span>
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            disabled={submitted && !editing}
            placeholder="How are you feeling today? Any wins or challenges?"
            rows={3}
            className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--fg)] placeholder:text-[var(--fg-30)]
              focus:outline-none focus:ring-2 focus:ring-[var(--accent-ring)] focus:border-[var(--accent-border)]
              transition-all resize-none disabled:opacity-50"
          />
        </div>

        {/* Submit / update */}
        {(!submitted || editing) && (
          <Button
            type="submit"
            loading={loading}
            size="lg"
            className="w-full"
          >
            {editing ? 'Update check-in' : allDone ? '🎉 Submit check-in' : 'Submit check-in'}
          </Button>
        )}

        {submitted && !editing && (
          <div className="flex items-center justify-center gap-2 py-2 text-[var(--accent-fg)] text-sm font-medium">
            <CheckCircle2 className="h-4 w-4" />
            Check-in submitted for today
          </div>
        )}
      </form>
    </div>
  )
}
