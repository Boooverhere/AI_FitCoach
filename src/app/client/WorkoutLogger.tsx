'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Dumbbell, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'

const WORKOUT_TYPES = ['Strength', 'Cardio', 'HIIT', 'Yoga', 'Mobility', 'Other'] as const
type WorkoutType = (typeof WORKOUT_TYPES)[number]

const TYPE_STYLES: Record<WorkoutType, string> = {
  Strength:  'bg-orange-500/15 text-orange-400 border-orange-500/25',
  Cardio:    'bg-red-500/15 text-red-400 border-red-500/25',
  HIIT:      'bg-rose-500/15 text-rose-400 border-rose-500/25',
  Yoga:      'bg-purple-500/15 text-purple-400 border-purple-500/25',
  Mobility:  'bg-blue-500/15 text-blue-400 border-blue-500/25',
  Other:     'bg-[var(--bg-hover)] text-[var(--fg-50)] border-[var(--border-8)]',
}

const EFFORT_LABELS: Record<number, string> = {
  1: 'Very easy', 2: 'Easy', 3: 'Light', 4: 'Moderate', 5: 'Somewhat hard',
  6: 'Hard', 7: 'Very hard', 8: 'Very hard', 9: 'Extremely hard', 10: 'Max effort',
}

const EFFORT_COLOR = (e: number) =>
  e <= 3 ? 'text-green-400' : e <= 6 ? 'text-yellow-400' : 'text-red-400'

interface Exercise {
  name: string
  sets: string
  reps: string
  weight: string
}

const blankExercise = (): Exercise => ({ name: '', sets: '', reps: '', weight: '' })

interface Props {
  clientId: string
}

export function WorkoutLogger({ clientId }: Props) {
  const [open, setOpen] = useState(false)
  const [type, setType] = useState<WorkoutType>('Strength')
  const [duration, setDuration] = useState('')
  const [effort, setEffort] = useState(5)
  const [exercises, setExercises] = useState<Exercise[]>([blankExercise()])
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  function resetForm() {
    setType('Strength')
    setDuration('')
    setEffort(5)
    setExercises([blankExercise()])
    setNotes('')
    setError('')
  }

  function openModal() { resetForm(); setOpen(true) }
  function closeModal() { setOpen(false) }

  function updateExercise(i: number, field: keyof Exercise, value: string) {
    setExercises((prev) => prev.map((ex, idx) => idx === i ? { ...ex, [field]: value } : ex))
  }

  function addExercise() { setExercises((prev) => [...prev, blankExercise()]) }

  function removeExercise(i: number) {
    setExercises((prev) => prev.length === 1 ? prev : prev.filter((_, idx) => idx !== i))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const dur = parseInt(duration)
    if (!dur || dur <= 0) { setError('Please enter a valid duration.'); return }

    setLoading(true)
    setError('')

    const cleanExercises = exercises
      .filter((ex) => ex.name.trim())
      .map((ex) => ({
        name: ex.name.trim(),
        sets:   ex.sets   ? Number(ex.sets)   : null,
        reps:   ex.reps   ? Number(ex.reps)   : null,
        weight: ex.weight ? Number(ex.weight) : null,
      }))

    const supabase = createClient()
    const { error: dbError } = await supabase.from('workouts').insert({
      client_id:     clientId,
      date:          new Date().toISOString().slice(0, 10),
      type,
      duration_mins: dur,
      effort,
      exercises:     cleanExercises,
      notes:         notes.trim() || null,
    })

    if (dbError) {
      setError(dbError.message)
      setLoading(false)
      return
    }

    setLoading(false)
    closeModal()
    router.refresh()
  }

  return (
    <>
      {/* Trigger */}
      <button
        onClick={openModal}
        className="w-full flex items-center justify-between gap-3 px-5 py-4 bg-[var(--bg-surface)] border border-[var(--border-8)] rounded-2xl hover:border-[var(--accent-border-sub)] hover:bg-[var(--bg-hover)] transition-all group"
      >
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-[var(--bg-hover)] group-hover:bg-[var(--accent-tint)] flex items-center justify-center transition-colors shrink-0">
            <Dumbbell className="h-5 w-5 text-[var(--fg-40)] group-hover:text-[var(--accent-fg)] transition-colors" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold">Log a workout</p>
            <p className="text-xs text-[var(--fg-40)]">Track exercises, duration &amp; effort</p>
          </div>
        </div>
        <div className="h-8 px-3 rounded-lg bg-[var(--accent-tint)] text-[var(--accent-fg)] text-xs font-semibold flex items-center gap-1 shrink-0">
          <Plus className="h-3.5 w-3.5" /> Log
        </div>
      </button>

      {/* Modal overlay */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeModal}
          />

          <div className="relative z-10 w-full sm:max-w-lg bg-[var(--bg-surface)] sm:rounded-2xl rounded-t-2xl border border-[var(--border-8)] overflow-hidden flex flex-col max-h-[92dvh]">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-8)] shrink-0">
              <div className="flex items-center gap-2">
                <Dumbbell className="h-5 w-5 text-[var(--accent-fg)]" />
                <h2 className="font-bold text-lg">Log Workout</h2>
              </div>
              <button
                onClick={closeModal}
                className="h-8 w-8 rounded-full flex items-center justify-center text-[var(--fg-40)] hover:text-[var(--fg)] hover:bg-[var(--bg-hover)] transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Scrollable form */}
            <form onSubmit={handleSubmit} className="overflow-y-auto flex flex-col gap-5 px-5 py-5">

              {/* Workout type */}
              <div>
                <label className="text-xs font-semibold text-[var(--fg-50)] uppercase tracking-wider block mb-2">
                  Workout Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {WORKOUT_TYPES.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                        type === t
                          ? TYPE_STYLES[t] + ' ring-2 ring-offset-1 ring-offset-[var(--bg-surface)] ring-current/40'
                          : 'bg-[var(--bg-input)] border-[var(--border-8)] text-[var(--fg-50)] hover:bg-[var(--bg-hover)]'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration + Effort in one row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[var(--fg-50)] uppercase tracking-wider block mb-2">
                    Duration
                  </label>
                  <div className="flex items-center gap-2 bg-[var(--bg-input)] border border-[var(--border-8)] rounded-xl px-3 py-2.5 focus-within:border-[var(--accent)] transition-colors">
                    <input
                      type="number"
                      min={1}
                      max={300}
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      placeholder="45"
                      className="flex-1 bg-transparent text-sm text-[var(--fg)] placeholder:text-[var(--fg-30)] focus:outline-none w-0"
                    />
                    <span className="text-xs text-[var(--fg-40)] shrink-0">min</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[var(--fg-50)] uppercase tracking-wider block mb-2">
                    Effort
                  </label>
                  <div className="bg-[var(--bg-input)] border border-[var(--border-8)] rounded-xl px-3 py-2.5">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-[var(--fg-40)]">1</span>
                      <span className={`text-sm font-bold tabular-nums ${EFFORT_COLOR(effort)}`}>{effort}</span>
                      <span className="text-xs text-[var(--fg-40)]">10</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={10}
                      value={effort}
                      onChange={(e) => setEffort(Number(e.target.value))}
                      className="w-full h-1.5 rounded-full cursor-pointer"
                      style={{ accentColor: 'var(--accent)' }}
                    />
                  </div>
                </div>
              </div>

              {/* Effort label */}
              <p className={`-mt-3 text-xs ${EFFORT_COLOR(effort)}`}>
                {effort}/10 — {EFFORT_LABELS[effort]}
              </p>

              {/* Exercises */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-[var(--fg-50)] uppercase tracking-wider">
                    Exercises
                  </label>
                  <button
                    type="button"
                    onClick={addExercise}
                    className="flex items-center gap-1 text-xs text-[var(--accent-fg)] hover:text-[var(--accent-fg-muted)] transition-colors font-medium"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add
                  </button>
                </div>

                <div className="flex flex-col gap-2">
                  {/* Column headers */}
                  <div className="grid grid-cols-[1fr_52px_52px_60px_28px] gap-1.5 px-0.5">
                    {['Exercise', 'Sets', 'Reps', 'kg', ''].map((h, i) => (
                      <span key={i} className="text-[10px] text-[var(--fg-30)] font-medium">{h}</span>
                    ))}
                  </div>

                  {exercises.map((ex, i) => (
                    <div key={i} className="grid grid-cols-[1fr_52px_52px_60px_28px] gap-1.5 items-center">
                      <input
                        type="text"
                        value={ex.name}
                        onChange={(e) => updateExercise(i, 'name', e.target.value)}
                        placeholder="e.g. Squat"
                        className="bg-[var(--bg-input)] border border-[var(--border-8)] rounded-lg px-2.5 py-2 text-sm text-[var(--fg)] placeholder:text-[var(--fg-20)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                      />
                      <input
                        type="number"
                        min={1}
                        value={ex.sets}
                        onChange={(e) => updateExercise(i, 'sets', e.target.value)}
                        placeholder="3"
                        className="bg-[var(--bg-input)] border border-[var(--border-8)] rounded-lg px-2 py-2 text-sm text-[var(--fg)] placeholder:text-[var(--fg-20)] focus:outline-none focus:border-[var(--accent)] transition-colors text-center"
                      />
                      <input
                        type="number"
                        min={1}
                        value={ex.reps}
                        onChange={(e) => updateExercise(i, 'reps', e.target.value)}
                        placeholder="10"
                        className="bg-[var(--bg-input)] border border-[var(--border-8)] rounded-lg px-2 py-2 text-sm text-[var(--fg)] placeholder:text-[var(--fg-20)] focus:outline-none focus:border-[var(--accent)] transition-colors text-center"
                      />
                      <input
                        type="number"
                        min={0}
                        step={0.5}
                        value={ex.weight}
                        onChange={(e) => updateExercise(i, 'weight', e.target.value)}
                        placeholder="—"
                        className="bg-[var(--bg-input)] border border-[var(--border-8)] rounded-lg px-2 py-2 text-sm text-[var(--fg)] placeholder:text-[var(--fg-20)] focus:outline-none focus:border-[var(--accent)] transition-colors text-center"
                      />
                      <button
                        type="button"
                        onClick={() => removeExercise(i)}
                        disabled={exercises.length === 1}
                        className="flex items-center justify-center h-8 w-7 rounded-lg text-[var(--fg-30)] hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs font-semibold text-[var(--fg-50)] uppercase tracking-wider block mb-2">
                  Notes <span className="text-[var(--fg-30)] normal-case font-normal">(optional)</span>
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="How did it go? Any PRs or observations…"
                  rows={3}
                  className="w-full bg-[var(--bg-input)] border border-[var(--border-8)] rounded-xl px-4 py-3 text-sm text-[var(--fg)] placeholder:text-[var(--fg-30)] focus:outline-none focus:border-[var(--accent)] transition-colors resize-none"
                />
              </div>

              {error && (
                <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2">
                  {error}
                </p>
              )}

              {/* Actions */}
              <div className="flex gap-3 pb-1">
                <Button type="button" variant="secondary" className="flex-1" onClick={closeModal}>
                  Cancel
                </Button>
                <Button type="submit" loading={loading} className="flex-1">
                  Save workout
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
