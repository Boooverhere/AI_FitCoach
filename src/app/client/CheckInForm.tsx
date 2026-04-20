'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { CheckCircle2, Dumbbell, BedDouble, Pencil } from 'lucide-react'

interface TodayCheckin {
  id: string
  completed_habits: string[]
  note: string | null
}

interface Props {
  clientId: string
  todayCheckin: TodayCheckin | null
  today: string
  programName?: string
  todaysWorkoutType?: string
}

export function CheckInForm({ clientId, todayCheckin, today, programName, todaysWorkoutType }: Props) {
  const isRestDay = !todaysWorkoutType || todaysWorkoutType === 'Rest'

  const [note, setNote] = useState(todayCheckin?.note ?? '')
  const [submitted, setSubmitted] = useState(!!todayCheckin)
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saveError, setSaveError] = useState('')
  const supabase = createClient()
  const router = useRouter()

  const isLocked = submitted && !editing

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setSaveError('')

    let error
    if (todayCheckin && editing) {
      const res = await supabase
        .from('checkins')
        .update({ note })
        .eq('id', todayCheckin.id)
      error = res.error
    } else {
      const res = await supabase.from('checkins').upsert({
        client_id: clientId,
        date: today,
        completed_habits: [],
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

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">

      {/* Session card */}
      <div className={`rounded-2xl border-2 p-5 transition-all ${
        submitted && !editing
          ? 'bg-[var(--accent-wash)] border-[var(--accent-border-sub)]'
          : 'bg-[var(--bg-surface)] border-[var(--border-8)]'
      }`}>
        <div className="flex items-center justify-between">
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
                {submitted && !editing
                  ? (isRestDay ? 'Rest day logged ✓' : 'Checked in ✓')
                  : (isRestDay ? 'Rest day' : todaysWorkoutType)}
              </p>
              <p className="text-xs text-[var(--fg-40)]">
                {programName
                  ? `${programName} · ${isRestDay ? 'Recovery' : 'Today'}`
                  : isRestDay ? 'Recovery day' : "Today's session"}
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
            : 'How did the session go? Any feedback for your coach?'}
          rows={3}
          className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--fg)] placeholder:text-[var(--fg-30)]
            focus:outline-none focus:ring-2 focus:ring-[var(--accent-ring)] focus:border-[var(--accent-border)]
            transition-all resize-none disabled:opacity-50"
        />
      </div>

      {saveError && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400">
          {saveError}
        </div>
      )}

      {!isLocked && (
        <Button type="submit" loading={loading} size="lg" className="w-full">
          {editing ? 'Update check-in' : isRestDay ? 'Log rest day' : 'Check in'}
        </Button>
      )}

      {isLocked && (
        <div className="flex items-center justify-center gap-2 py-2 text-[var(--accent-fg)] text-sm font-medium">
          <CheckCircle2 className="h-4 w-4" />
          {isRestDay ? 'Rest day logged' : 'Checked in for today'}
        </div>
      )}
    </form>
  )
}
