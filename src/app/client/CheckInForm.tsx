'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { CheckCircle2, Dumbbell, BedDouble, Pencil } from 'lucide-react'

interface TodayCheckin {
  id: string
  completed_habits: string[]
  note: string
}

interface Props {
  clientId: string
  todayCheckin: TodayCheckin | null
  today: string
  programName?: string
  todaysWorkoutType?: string
}

const EFFORT_LABELS: Record<number, string> = {
  1: 'Very easy', 2: 'Easy', 3: 'Moderate', 4: 'Somewhat hard',
  5: 'Hard', 6: 'Hard+', 7: 'Very hard', 8: 'Very hard+',
  9: 'Max effort', 10: 'All out',
}

export function CheckInForm({ clientId, todayCheckin, today, programName, todaysWorkoutType }: Props) {
  const isRestDay = !todaysWorkoutType || todaysWorkoutType === 'Rest'

  const initialDone = todayCheckin?.completed_habits?.includes('workout_done') ?? false
  const initialEffort = parseInt(
    todayCheckin?.completed_habits?.find((h) => h.startsWith('rpe:'))?.split(':')[1] ?? '0'
  ) || 0

  const [workoutDone, setWorkoutDone] = useState(initialDone)
  const [effort, setEffort] = useState(initialEffort)
  const [note, setNote] = useState(todayCheckin?.note ?? '')
  const [submitted, setSubmitted] = useState(!!todayCheckin)
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saveError, setSaveError] = useState('')
  const supabase = createClient()
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setSaveError('')

    const completedHabits: string[] = ['checked_in']
    if (workoutDone) completedHabits.push('workout_done')
    if (effort > 0) completedHabits.push(`rpe:${effort}`)

    let error
    if (todayCheckin && editing) {
      const res = await supabase
        .from('checkins')
        .update({ completed_habits: completedHabits, note })
        .eq('id', todayCheckin.id)
      error = res.error
    } else {
      const res = await supabase.from('checkins').upsert({
        client_id: clientId,
        date: today,
        completed_habits: completedHabits,
        note,
      })
      error = res.error
    }

    if (error) {
      setSaveError(error.message)
      setLoading(false)
      return
    }

    setSubmitted(true)
    setEditing(false)
    setLoading(false)
    router.refresh()
  }

  const isLocked = submitted && !editing

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">

      {/* Workout completion card */}
      <div className={`rounded-2xl border-2 transition-all ${
        isRestDay
          ? 'bg-[var(--bg-surface)] border-[var(--border-8)]'
          : workoutDone
            ? 'bg-[var(--accent-tint)] border-[var(--accent)]'
            : 'bg-[var(--bg-surface)] border-[var(--border-8)]'
      }`}>
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                isRestDay ? 'bg-blue-500/10' : 'bg-[var(--accent-tint)]'
              }`}>
                {isRestDay
                  ? <BedDouble className="h-5 w-5 text-blue-400" />
                  : <Dumbbell className="h-5 w-5 text-[var(--accent-fg)]" />
                }
              </div>
              <div>
                <p className="font-semibold text-sm">
                  {isRestDay ? 'Rest day' : todaysWorkoutType}
                </p>
                <p className="text-xs text-[var(--fg-40)]">
                  {programName
                    ? isRestDay ? `${programName} · Recovery` : `${programName} · Today`
                    : isRestDay ? 'Recovery day' : 'Today\'s session'}
                </p>
              </div>
            </div>
            {submitted && !editing && (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-[var(--bg-hover)] hover:bg-[var(--bg-surface)] text-[var(--fg-50)] hover:text-[var(--fg)] transition-colors"
              >
                <Pencil className="h-3 w-3" />
                Edit
              </button>
            )}
          </div>

          {/* Completion toggle — only for workout days */}
          {!isRestDay && (
            <button
              type="button"
              disabled={isLocked}
              onClick={() => !isLocked && setWorkoutDone((v) => !v)}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl border-2 text-left transition-all ${
                isLocked ? 'cursor-default' : 'cursor-pointer'
              } ${
                workoutDone
                  ? 'bg-[var(--accent-wash)] border-[var(--accent-border-sub)]'
                  : 'bg-[var(--bg-elevated)] border-[var(--border-5)] hover:border-[var(--border)]'
              }`}
            >
              <CheckCircle2 className={`h-6 w-6 flex-shrink-0 ${workoutDone ? 'text-[var(--accent-fg)]' : 'text-[var(--fg-20)]'}`} />
              <div>
                <p className={`font-medium text-sm ${workoutDone ? 'text-[var(--accent-fg)]' : 'text-[var(--fg)]'}`}>
                  {workoutDone ? 'Workout completed ✓' : 'Mark workout as complete'}
                </p>
                <p className="text-xs text-[var(--fg-40)] mt-0.5">
                  {workoutDone ? 'Nice work — keep the streak going' : 'Tap to confirm you completed today\'s session'}
                </p>
              </div>
            </button>
          )}

          {/* Effort rating */}
          {!isRestDay && (workoutDone || editing) && (
            <div className="mt-4">
              <p className="text-xs font-medium text-[var(--fg-50)] mb-2">
                Effort level (RPE) {effort > 0 && <span className="text-[var(--fg-40)]">— {EFFORT_LABELS[effort]}</span>}
              </p>
              <div className="flex gap-1.5">
                {[1,2,3,4,5,6,7,8,9,10].map((n) => (
                  <button
                    key={n}
                    type="button"
                    disabled={isLocked}
                    onClick={() => !isLocked && setEffort(n === effort ? 0 : n)}
                    className={`flex-1 h-8 rounded-lg text-xs font-semibold transition-all ${
                      n === effort
                        ? n <= 4 ? 'bg-green-500 text-white'
                          : n <= 7 ? 'bg-yellow-500 text-white'
                          : 'bg-red-500 text-white'
                        : 'bg-[var(--bg-elevated)] text-[var(--fg-40)] hover:bg-[var(--bg-hover)]'
                    } disabled:cursor-default`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Note */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-8)] rounded-2xl p-5">
        <label className="text-sm font-medium text-[var(--fg-70)] block mb-2">
          Note <span className="text-[var(--fg-30)] font-normal">(optional)</span>
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          disabled={isLocked}
          placeholder={isRestDay
            ? 'How are you feeling today? Any soreness or energy notes?'
            : 'How did the session go? Any PRs, struggles, or feedback for your coach?'}
          rows={3}
          className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--fg)] placeholder:text-[var(--fg-30)]
            focus:outline-none focus:ring-2 focus:ring-[var(--accent-ring)] focus:border-[var(--accent-border)]
            transition-all resize-none disabled:opacity-50"
        />
      </div>

      {/* Save error */}
      {saveError && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400">
          {saveError}
        </div>
      )}

      {/* Submit */}
      {!isLocked && (
        <Button type="submit" loading={loading} size="lg" className="w-full">
          {editing ? 'Update check-in' : workoutDone ? '🎉 Submit check-in' : 'Submit check-in'}
        </Button>
      )}

      {isLocked && (
        <div className="flex items-center justify-center gap-2 py-2 text-[var(--accent-fg)] text-sm font-medium">
          <CheckCircle2 className="h-4 w-4" />
          Check-in submitted for today
        </div>
      )}
    </form>
  )
}
