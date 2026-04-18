'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { ChevronRight, Check } from 'lucide-react'
import { WeekEditor, makeWeekDays, type WeekState } from './WeekEditor'
import { ExerciseDatalist } from './WorkoutDayEditor'
import type { DayState } from '@/lib/exercises'
import { DAY_LABELS } from '@/lib/exercises'

interface CoachHabit { id: string; label: string; icon: string }

interface Props {
  coachHabits: CoachHabit[]
  existingProgram?: {
    id: string
    name: string
    description: string
    duration_weeks: number
    weeks: { week_number: number; habit_ids: string[] }[]
    workouts: { week_number: number; day_of_week: number; workout_type: string; exercises: unknown[] }[]
  }
}

const STEPS = ['Details', 'Weeks', 'Review'] as const

export function ProgramBuilder({ coachHabits, existingProgram }: Props) {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Step 1
  const [name, setName] = useState(existingProgram?.name ?? '')
  const [description, setDescription] = useState(existingProgram?.description ?? '')
  const [durationWeeks, setDurationWeeks] = useState(existingProgram?.duration_weeks ?? 4)

  // Build initial week states
  function buildInitialWeeks(n: number): WeekState[] {
    return Array.from({ length: n }, (_, i) => {
      const habitRow = existingProgram?.weeks.find((w) => w.week_number === i + 1)
      const days = makeWeekDays()
      if (existingProgram) {
        existingProgram.workouts
          .filter((w) => w.week_number === i + 1)
          .forEach((w) => {
            if (w.day_of_week >= 0 && w.day_of_week < 7) {
              days[w.day_of_week] = {
                workout_type: w.workout_type as DayState['workout_type'],
                exercises: (w.exercises ?? []) as DayState['exercises'],
              }
            }
          })
      }
      return {
        habitIds: (habitRow?.habit_ids ?? []) as string[],
        inheritPrev: false,
        additions: [],
        days,
      }
    })
  }

  const [weeks, setWeeks] = useState<WeekState[]>(() => buildInitialWeeks(durationWeeks))

  function handleDurationChange(n: number) {
    setDurationWeeks(n)
    setWeeks((prev) => {
      if (n > prev.length) {
        const extra = Array.from({ length: n - prev.length }, () => ({
          habitIds: [], inheritPrev: false, additions: [], days: makeWeekDays(),
        }))
        return [...prev, ...extra]
      }
      return prev.slice(0, n)
    })
  }

  function resolvedHabitIds(weekIdx: number): string[] {
    const w = weeks[weekIdx]
    if (!w.inheritPrev || weekIdx === 0) return w.habitIds
    const prev = resolvedHabitIds(weekIdx - 1)
    return [...new Set([...prev, ...w.additions])]
  }

  function updateWeek(idx: number, patch: Partial<WeekState>) {
    setWeeks((prev) => prev.map((w, i) => i === idx ? { ...w, ...patch } : w))
  }

  function updateDay(weekIdx: number, dayIdx: number, day: DayState) {
    setWeeks((prev) => prev.map((w, i) => {
      if (i !== weekIdx) return w
      const days = [...w.days]
      days[dayIdx] = day
      return { ...w, days }
    }))
  }

  function copyDay(weekIdx: number, fromDay: number, toDay: number) {
    setWeeks((prev) => prev.map((w, i) => {
      if (i !== weekIdx) return w
      const days = [...w.days]
      days[toDay] = { ...days[fromDay], exercises: days[fromDay].exercises.map((ex) => ({ ...ex })) }
      return { ...w, days }
    }))
  }

  function copyWeekToNext(fromIdx: number) {
    if (fromIdx + 1 >= weeks.length) return
    setWeeks((prev) => prev.map((w, i) => {
      if (i !== fromIdx + 1) return w
      const src = prev[fromIdx]
      return {
        ...src,
        inheritPrev: false,
        additions: [],
        days: src.days.map((d) => ({ ...d, exercises: d.exercises.map((ex) => ({ ...ex })) })),
      }
    }))
  }

  function toggleInherit(idx: number) {
    const w = weeks[idx]
    if (!w.inheritPrev) {
      const prevResolved = resolvedHabitIds(idx - 1)
      const prevSet = new Set(prevResolved)
      const additions = w.habitIds.filter((id) => !prevSet.has(id))
      const combined = [...new Set([...prevResolved, ...additions])]
      updateWeek(idx, { inheritPrev: true, additions, habitIds: combined })
    } else {
      updateWeek(idx, { inheritPrev: false, additions: [], habitIds: resolvedHabitIds(idx) })
    }
  }

  async function handleSave() {
    setSaving(true)
    setError('')
    const supabase = createClient()

    let progId: string

    if (existingProgram) {
      const { error: e1 } = await supabase
        .from('programs')
        .update({ name, description, duration_weeks: durationWeeks })
        .eq('id', existingProgram.id)
      if (e1) { setError(e1.message); setSaving(false); return }
      progId = existingProgram.id
    } else {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setError('Not authenticated'); setSaving(false); return }
      const { data: prog, error: e1 } = await supabase
        .from('programs')
        .insert({ name, description, duration_weeks: durationWeeks, coach_id: user.id })
        .select('id')
        .single()
      if (e1 || !prog) { setError(e1?.message ?? 'Failed to create program'); setSaving(false); return }
      progId = (prog as { id: string }).id
    }

    // Save habit weeks
    await supabase.from('program_weeks').delete().eq('program_id', progId)
    const weekRows = weeks.map((_, i) => ({
      program_id: progId,
      week_number: i + 1,
      habit_ids: resolvedHabitIds(i),
    }))
    const { error: e2 } = await supabase.from('program_weeks').insert(weekRows)
    if (e2) { setError(e2.message); setSaving(false); return }

    // Save workout days
    await supabase.from('program_workouts').delete().eq('program_id', progId)
    const workoutRows = weeks.flatMap((week, wi) =>
      week.days
        .map((day, di) => ({ day, di }))
        .filter(({ day }) => day.workout_type !== 'Rest' || day.exercises.length > 0)
        .map(({ day, di }) => ({
          program_id: progId,
          week_number: wi + 1,
          day_of_week: di,
          workout_type: day.workout_type,
          exercises: day.exercises,
        }))
    )
    if (workoutRows.length > 0) {
      const { error: e3 } = await supabase.from('program_workouts').insert(workoutRows)
      if (e3) { setError(e3.message); setSaving(false); return }
    }

    setSaving(false)
    router.push('/coach/programs')
    router.refresh()
  }

  const step1Valid = name.trim().length >= 2 && durationWeeks >= 1 && durationWeeks <= 52

  return (
    <>
      <ExerciseDatalist />
      <div className="flex flex-col gap-6 max-w-3xl">

        {/* Step indicator */}
        <div className="flex items-center gap-0">
          {STEPS.map((label, i) => (
            <div key={i} className="flex items-center">
              <button
                type="button"
                onClick={() => { if (i < step || (i === 1 && step1Valid)) setStep(i) }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
                  i === step ? 'bg-[var(--accent-tint)] text-[var(--accent-fg)]'
                  : i < step ? 'text-[var(--accent-fg)] hover:bg-[var(--bg-hover)]'
                  : 'text-[var(--fg-30)] cursor-default'
                }`}
              >
                <span className={`h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold ${
                  i < step ? 'bg-[var(--accent)] text-[var(--accent-on-solid)]'
                  : i === step ? 'bg-[var(--accent-tint)] border-2 border-[var(--accent-border)] text-[var(--accent-fg)]'
                  : 'bg-[var(--bg-hover)] text-[var(--fg-30)]'
                }`}>
                  {i < step ? <Check className="h-3 w-3" /> : i + 1}
                </span>
                {label}
              </button>
              {i < STEPS.length - 1 && <ChevronRight className="h-4 w-4 text-[var(--fg-20)] mx-1" />}
            </div>
          ))}
        </div>

        {/* ── Step 1: Details ── */}
        {step === 0 && (
          <div className="bg-[var(--bg-surface)] border border-[var(--border-8)] rounded-2xl p-6 flex flex-col gap-5">
            <div>
              <label className="text-xs font-semibold text-[var(--fg-40)] uppercase tracking-wider block mb-1.5">Program name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. 8-Week Fat Loss"
                className="w-full bg-[var(--bg-input)] border border-[var(--border-8)] rounded-xl px-4 py-3 text-sm text-[var(--fg)] placeholder:text-[var(--fg-30)] focus:outline-none focus:border-[var(--accent)] transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--fg-40)] uppercase tracking-wider block mb-1.5">
                Description <span className="normal-case font-normal text-[var(--fg-30)]">(optional)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief overview of goals and structure…"
                rows={3}
                className="w-full bg-[var(--bg-input)] border border-[var(--border-8)] rounded-xl px-4 py-3 text-sm text-[var(--fg)] placeholder:text-[var(--fg-30)] focus:outline-none focus:border-[var(--accent)] transition-colors resize-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--fg-40)] uppercase tracking-wider block mb-1.5">Duration (weeks) *</label>
              <div className="flex items-center gap-3">
                <input
                  type="number" min={1} max={52} value={durationWeeks}
                  onChange={(e) => handleDurationChange(Math.max(1, Math.min(52, Number(e.target.value))))}
                  className="w-24 bg-[var(--bg-input)] border border-[var(--border-8)] rounded-xl px-4 py-3 text-sm text-[var(--fg)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                />
                <span className="text-sm text-[var(--fg-40)]">weeks total</span>
              </div>
              <div className="flex gap-2 mt-2">
                {[4, 6, 8, 12].map((n) => (
                  <button key={n} type="button" onClick={() => handleDurationChange(n)}
                    className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                      durationWeeks === n
                        ? 'bg-[var(--accent-tint)] border-[var(--accent-border-sub)] text-[var(--accent-fg)]'
                        : 'bg-[var(--bg-hover)] border-[var(--border-8)] text-[var(--fg-40)] hover:text-[var(--fg)]'
                    }`}
                  >{n}w</button>
                ))}
              </div>
            </div>
            <Button disabled={!step1Valid} onClick={() => setStep(1)} className="w-full sm:w-auto self-end">
              Next: Set up weeks <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}

        {/* ── Step 2: Weeks ── */}
        {step === 1 && (
          <div className="flex flex-col gap-4">
            {weeks.map((week, idx) => (
              <WeekEditor
                key={idx}
                weekIdx={idx}
                week={week}
                coachHabits={coachHabits}
                lockedHabitIds={idx > 0 && week.inheritPrev ? resolvedHabitIds(idx - 1) : []}
                isFirst={idx === 0}
                hasNext={idx < weeks.length - 1}
                onUpdate={(patch) => updateWeek(idx, patch)}
                onUpdateDay={(dayIdx, day) => updateDay(idx, dayIdx, day)}
                onCopyDay={(from, to) => copyDay(idx, from, to)}
                onCopyToNext={() => copyWeekToNext(idx)}
                onToggleInherit={() => toggleInherit(idx)}
              />
            ))}
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setStep(0)}>Back</Button>
              <Button onClick={() => setStep(2)} className="flex-1 sm:flex-none">
                Review program <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 3: Review ── */}
        {step === 2 && (
          <div className="flex flex-col gap-4">
            <div className="bg-[var(--bg-surface)] border border-[var(--border-8)] rounded-2xl p-6">
              <h3 className="font-bold text-lg mb-1">{name}</h3>
              {description && <p className="text-sm text-[var(--fg-50)] mb-3">{description}</p>}
              <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-[var(--accent-tint)] text-[var(--accent-fg)] border border-[var(--accent-border-sub)]">
                {durationWeeks} week{durationWeeks !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="flex flex-col gap-2">
              {weeks.map((_, idx) => {
                const habits = resolvedHabitIds(idx)
                const activeDays = weeks[idx].days.filter((d) => d.workout_type !== 'Rest' || d.exercises.length > 0)
                const workoutDays = weeks[idx].days
                  .map((d, di) => ({ d, di }))
                  .filter(({ d }) => d.workout_type !== 'Rest' || d.exercises.length > 0)

                return (
                  <div key={idx} className="bg-[var(--bg-surface)] border border-[var(--border-8)] rounded-xl px-4 py-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="h-6 w-6 rounded-lg bg-[var(--accent-tint)] text-[var(--accent-fg)] text-xs font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="font-medium text-sm">Week {idx + 1}</span>
                      </div>
                      <button type="button" onClick={() => setStep(1)} className="text-xs text-[var(--fg-30)] hover:text-[var(--accent-fg)]">Edit</button>
                    </div>

                    {habits.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {habits.map((hid) => {
                          const h = coachHabits.find((ch) => ch.id === hid)
                          return h ? (
                            <span key={hid} className="text-xs px-2 py-0.5 rounded-full bg-[var(--accent-tint)] text-[var(--accent-fg)]">
                              {h.icon} {h.label}
                            </span>
                          ) : null
                        })}
                      </div>
                    )}

                    {workoutDays.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {workoutDays.map(({ d, di }) => (
                          <span key={di} className="text-xs px-2 py-0.5 rounded-full bg-[var(--bg-hover)] text-[var(--fg-50)]">
                            {DAY_LABELS[di].slice(0, 3)}: {d.workout_type} ({d.exercises.length} ex)
                          </span>
                        ))}
                      </div>
                    )}

                    {habits.length === 0 && workoutDays.length === 0 && (
                      <p className="text-xs text-[var(--fg-30)]">No habits or workouts configured</p>
                    )}
                  </div>
                )
              })}
            </div>

            {error && (
              <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2">{error}</p>
            )}

            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setStep(1)}>Back</Button>
              <Button loading={saving} onClick={handleSave} className="flex-1 sm:flex-none">
                {existingProgram ? 'Save changes' : 'Create program'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
