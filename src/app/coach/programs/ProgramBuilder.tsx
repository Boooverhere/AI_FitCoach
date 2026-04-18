'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Plus, Trash2, ChevronRight, Check, CopyPlus, X } from 'lucide-react'

interface CoachHabit { id: string; label: string; icon: string }

interface WeekState {
  habitIds: string[]
  inheritPrev: boolean
  additions: string[] // habits added on top of prev week (only used when inheritPrev=true)
}

interface Props {
  coachHabits: CoachHabit[]
  existingProgram?: {
    id: string
    name: string
    description: string
    duration_weeks: number
    weeks: { week_number: number; habit_ids: string[] }[]
  }
}

const STEPS = ['Details', 'Weeks', 'Review'] as const

function HabitPicker({
  habits,
  selected,
  locked,
  onChange,
}: {
  habits: CoachHabit[]
  selected: string[]
  locked?: string[] // inherited habits (shown but not removable)
  onChange: (ids: string[]) => void
}) {
  const lockedSet = new Set(locked ?? [])
  const selectedSet = new Set(selected)

  function toggle(id: string) {
    if (lockedSet.has(id)) return
    const next = new Set(selectedSet)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    onChange([...next])
  }

  if (!habits.length) {
    return (
      <p className="text-sm text-[var(--fg-30)] italic">
        No habit templates yet — create some in the Habits section first.
      </p>
    )
  }

  return (
    <div className="flex flex-wrap gap-2">
      {habits.map((h) => {
        const isSelected = selectedSet.has(h.id)
        const isLocked = lockedSet.has(h.id)
        return (
          <button
            key={h.id}
            type="button"
            onClick={() => toggle(h.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium border transition-all ${
              isSelected
                ? isLocked
                  ? 'bg-[var(--accent-tint)] border-[var(--accent-border-sub)] text-[var(--accent-fg)] opacity-70 cursor-default'
                  : 'bg-[var(--accent-tint)] border-[var(--accent-border)] text-[var(--accent-fg)]'
                : 'bg-[var(--bg-hover)] border-[var(--border-8)] text-[var(--fg-50)] hover:text-[var(--fg)] hover:border-[var(--border)]'
            }`}
          >
            <span>{h.icon}</span>
            <span>{h.label}</span>
            {isSelected && !isLocked && <X className="h-3 w-3 ml-0.5 opacity-60" />}
            {isLocked && <Check className="h-3 w-3 ml-0.5" />}
          </button>
        )
      })}
    </div>
  )
}

export function ProgramBuilder({ coachHabits, existingProgram }: Props) {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Step 1: details
  const [name, setName] = useState(existingProgram?.name ?? '')
  const [description, setDescription] = useState(existingProgram?.description ?? '')
  const [durationWeeks, setDurationWeeks] = useState(existingProgram?.duration_weeks ?? 4)

  // Step 2: weeks — indexed 0..durationWeeks-1
  function buildInitialWeeks(n: number): WeekState[] {
    if (existingProgram) {
      return Array.from({ length: n }, (_, i) => {
        const w = existingProgram.weeks.find((w) => w.week_number === i + 1)
        return { habitIds: w?.habit_ids ?? [], inheritPrev: false, additions: [] }
      })
    }
    return Array.from({ length: n }, () => ({ habitIds: [], inheritPrev: false, additions: [] }))
  }
  const [weeks, setWeeks] = useState<WeekState[]>(() => buildInitialWeeks(durationWeeks))

  // Recompute weeks array when duration changes
  function handleDurationChange(n: number) {
    setDurationWeeks(n)
    setWeeks((prev) => {
      if (n > prev.length) {
        const extra = Array.from({ length: n - prev.length }, () => ({
          habitIds: [],
          inheritPrev: false,
          additions: [],
        }))
        return [...prev, ...extra]
      }
      return prev.slice(0, n)
    })
  }

  // Resolve a week's final habit_ids (including inheritance)
  function resolvedHabits(weekIdx: number): string[] {
    const w = weeks[weekIdx]
    if (!w.inheritPrev || weekIdx === 0) return w.habitIds
    const prev = resolvedHabits(weekIdx - 1)
    const merged = new Set([...prev, ...w.additions])
    return [...merged]
  }

  function updateWeek(idx: number, patch: Partial<WeekState>) {
    setWeeks((prev) => prev.map((w, i) => (i === idx ? { ...w, ...patch } : w)))
  }

  function toggleInherit(idx: number) {
    const w = weeks[idx]
    if (!w.inheritPrev) {
      // switching ON: current habitIds become additions; prev week's habits locked
      const prevResolved = resolvedHabits(idx - 1)
      const prevSet = new Set(prevResolved)
      const additions = w.habitIds.filter((id) => !prevSet.has(id))
      const combined = [...new Set([...prevResolved, ...additions])]
      updateWeek(idx, { inheritPrev: true, additions, habitIds: combined })
    } else {
      // switching OFF: keep current combined as flat list
      const current = resolvedHabits(idx)
      updateWeek(idx, { inheritPrev: false, additions: [], habitIds: current })
    }
  }

  function handleWeekHabitChange(idx: number, ids: string[]) {
    const w = weeks[idx]
    if (w.inheritPrev) {
      const prevResolved = resolvedHabits(idx - 1)
      const prevSet = new Set(prevResolved)
      const additions = ids.filter((id) => !prevSet.has(id))
      const combined = [...new Set([...prevResolved, ...additions])]
      updateWeek(idx, { additions, habitIds: combined })
    } else {
      updateWeek(idx, { habitIds: ids })
    }
  }

  async function handleSave() {
    setSaving(true)
    setError('')
    const supabase = createClient()

    // Resolve all weeks
    const resolvedWeeks = weeks.map((_, i) => resolvedHabits(i))

    if (existingProgram) {
      // Update
      const { error: e1 } = await supabase
        .from('programs')
        .update({ name, description, duration_weeks: durationWeeks })
        .eq('id', existingProgram.id)
      if (e1) { setError(e1.message); setSaving(false); return }

      // Delete old weeks + reinsert
      await supabase.from('program_weeks').delete().eq('program_id', existingProgram.id)
      const weekRows = resolvedWeeks.map((habitIds, i) => ({
        program_id: existingProgram.id,
        week_number: i + 1,
        habit_ids: habitIds,
      }))
      const { error: e2 } = await supabase.from('program_weeks').insert(weekRows)
      if (e2) { setError(e2.message); setSaving(false); return }
    } else {
      // Insert program
      const { data: prog, error: e1 } = await supabase
        .from('programs')
        .insert({ name, description, duration_weeks: durationWeeks })
        .select('id')
        .single()
      if (e1 || !prog) { setError(e1?.message ?? 'Failed to create program'); setSaving(false); return }

      const weekRows = resolvedWeeks.map((habitIds, i) => ({
        program_id: prog.id,
        week_number: i + 1,
        habit_ids: habitIds,
      }))
      const { error: e2 } = await supabase.from('program_weeks').insert(weekRows)
      if (e2) { setError(e2.message); setSaving(false); return }
    }

    setSaving(false)
    router.push('/coach/programs')
    router.refresh()
  }

  // ── Validation ─────────────────────────────────────────
  const step1Valid = name.trim().length >= 2 && durationWeeks >= 1 && durationWeeks <= 52

  // ── Render ─────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      {/* Step indicator */}
      <div className="flex items-center gap-0">
        {STEPS.map((label, i) => (
          <div key={i} className="flex items-center">
            <button
              type="button"
              onClick={() => { if (i < step || (i === 1 && step1Valid)) setStep(i) }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
                i === step
                  ? 'bg-[var(--accent-tint)] text-[var(--accent-fg)]'
                  : i < step
                  ? 'text-[var(--accent-fg)] hover:bg-[var(--bg-hover)]'
                  : 'text-[var(--fg-30)] cursor-default'
              }`}
            >
              <span className={`h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold ${
                i < step
                  ? 'bg-[var(--accent)] text-[var(--accent-on-solid)]'
                  : i === step
                  ? 'bg-[var(--accent-tint)] border-2 border-[var(--accent-border)] text-[var(--accent-fg)]'
                  : 'bg-[var(--bg-hover)] text-[var(--fg-30)]'
              }`}>
                {i < step ? <Check className="h-3 w-3" /> : i + 1}
              </span>
              {label}
            </button>
            {i < STEPS.length - 1 && (
              <ChevronRight className="h-4 w-4 text-[var(--fg-20)] mx-1" />
            )}
          </div>
        ))}
      </div>

      {/* ── Step 1: Details ── */}
      {step === 0 && (
        <div className="bg-[var(--bg-surface)] border border-[var(--border-8)] rounded-2xl p-6 flex flex-col gap-5">
          <div>
            <label className="text-xs font-semibold text-[var(--fg-40)] uppercase tracking-wider block mb-1.5">
              Program name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. 8-Week Fat Loss"
              className="w-full bg-[var(--bg-input)] border border-[var(--border-8)] rounded-xl px-4 py-3 text-sm text-[var(--fg)]
                placeholder:text-[var(--fg-30)] focus:outline-none focus:border-[var(--accent)] transition-colors"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[var(--fg-40)] uppercase tracking-wider block mb-1.5">
              Description <span className="normal-case font-normal text-[var(--fg-30)]">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief overview of the program goals and structure…"
              rows={3}
              className="w-full bg-[var(--bg-input)] border border-[var(--border-8)] rounded-xl px-4 py-3 text-sm text-[var(--fg)]
                placeholder:text-[var(--fg-30)] focus:outline-none focus:border-[var(--accent)] transition-colors resize-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[var(--fg-40)] uppercase tracking-wider block mb-1.5">
              Duration (weeks) *
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={1}
                max={52}
                value={durationWeeks}
                onChange={(e) => handleDurationChange(Math.max(1, Math.min(52, Number(e.target.value))))}
                className="w-24 bg-[var(--bg-input)] border border-[var(--border-8)] rounded-xl px-4 py-3 text-sm text-[var(--fg)]
                  focus:outline-none focus:border-[var(--accent)] transition-colors"
              />
              <span className="text-sm text-[var(--fg-40)]">weeks total</span>
            </div>
            <div className="flex gap-2 mt-2">
              {[4, 6, 8, 12].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => handleDurationChange(n)}
                  className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                    durationWeeks === n
                      ? 'bg-[var(--accent-tint)] border-[var(--accent-border-sub)] text-[var(--accent-fg)]'
                      : 'bg-[var(--bg-hover)] border-[var(--border-8)] text-[var(--fg-40)] hover:text-[var(--fg)]'
                  }`}
                >
                  {n}w
                </button>
              ))}
            </div>
          </div>

          <Button
            disabled={!step1Valid}
            onClick={() => setStep(1)}
            className="w-full sm:w-auto self-end"
          >
            Next: Set up weeks <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}

      {/* ── Step 2: Weeks ── */}
      {step === 1 && (
        <div className="flex flex-col gap-4">
          {weeks.map((w, idx) => {
            const prevResolved = idx > 0 ? resolvedHabits(idx - 1) : []
            const prevSet = new Set(prevResolved)
            const lockedHabits = w.inheritPrev ? prevResolved : []
            const displaySelected = w.habitIds

            return (
              <div
                key={idx}
                className="bg-[var(--bg-surface)] border border-[var(--border-8)] rounded-2xl overflow-hidden"
              >
                <div className="px-5 py-3.5 border-b border-[var(--border-5)] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-7 w-7 rounded-xl bg-[var(--accent-tint)] text-[var(--accent-fg)] text-xs font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="font-semibold">Week {idx + 1}</span>
                    {displaySelected.length > 0 && (
                      <span className="text-xs text-[var(--fg-40)]">
                        · {displaySelected.length} habit{displaySelected.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  {idx > 0 && (
                    <button
                      type="button"
                      onClick={() => toggleInherit(idx)}
                      className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl border transition-all ${
                        w.inheritPrev
                          ? 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                          : 'bg-[var(--bg-hover)] border-[var(--border-8)] text-[var(--fg-40)] hover:text-[var(--fg)]'
                      }`}
                    >
                      <CopyPlus className="h-3.5 w-3.5" />
                      Same as week {idx} + add more
                    </button>
                  )}
                </div>
                <div className="p-5">
                  {w.inheritPrev && prevResolved.length > 0 && (
                    <p className="text-xs text-[var(--fg-40)] mb-3">
                      Inheriting {prevResolved.length} habit{prevResolved.length !== 1 ? 's' : ''} from week {idx} (locked). Pick additional habits below:
                    </p>
                  )}
                  <HabitPicker
                    habits={coachHabits}
                    selected={displaySelected}
                    locked={lockedHabits}
                    onChange={(ids) => handleWeekHabitChange(idx, ids)}
                  />
                  {displaySelected.length === 0 && (
                    <p className="text-xs text-[var(--fg-30)] mt-2">
                      No habits selected — clients will see all assigned habits this week.
                    </p>
                  )}
                </div>
              </div>
            )
          })}

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
              const resolved = resolvedHabits(idx)
              return (
                <div
                  key={idx}
                  className="flex items-start gap-3 bg-[var(--bg-surface)] border border-[var(--border-8)] rounded-xl px-4 py-3"
                >
                  <span className="h-6 w-6 rounded-lg bg-[var(--accent-tint)] text-[var(--accent-fg)] text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-medium mb-1.5">Week {idx + 1}</p>
                    {resolved.length === 0 ? (
                      <p className="text-xs text-[var(--fg-30)]">No habits assigned — uses all client habits</p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {resolved.map((hid) => {
                          const h = coachHabits.find((ch) => ch.id === hid)
                          return h ? (
                            <span key={hid} className="text-xs px-2 py-0.5 rounded-full bg-[var(--bg-hover)] text-[var(--fg-60)]">
                              {h.icon} {h.label}
                            </span>
                          ) : null
                        })}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-xs text-[var(--fg-30)] hover:text-[var(--accent-fg)] transition-colors flex-shrink-0"
                  >
                    Edit
                  </button>
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
  )
}
