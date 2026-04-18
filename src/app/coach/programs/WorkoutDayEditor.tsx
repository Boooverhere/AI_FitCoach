'use client'

import { Plus, Trash2, Copy } from 'lucide-react'
import {
  DAY_LABELS, WORKOUT_TYPES, EXERCISE_NAMES,
  type DayState, type ExerciseEntry, blankExercise,
} from '@/lib/exercises'

const TYPE_COLORS: Record<string, string> = {
  Rest:      'bg-[var(--bg-hover)] text-[var(--fg-40)]',
  Strength:  'bg-orange-500/15 text-orange-400',
  Cardio:    'bg-red-500/15 text-red-400',
  HIIT:      'bg-rose-500/15 text-rose-400',
  Mobility:  'bg-blue-500/15 text-blue-400',
}

interface Props {
  dayIdx: number          // 0=Mon … 6=Sun
  day: DayState
  otherDays: number[]     // day indices available as copy targets
  onChange: (day: DayState) => void
  onCopyTo: (toDayIdx: number) => void
}

export function WorkoutDayEditor({ dayIdx, day, otherDays, onChange, onCopyTo }: Props) {
  const isRest = day.workout_type === 'Rest'

  function setType(type: DayState['workout_type']) {
    onChange({ ...day, workout_type: type, exercises: type === 'Rest' ? [] : day.exercises })
  }

  function updateExercise(i: number, patch: Partial<ExerciseEntry>) {
    const next = day.exercises.map((ex, idx) => idx === i ? { ...ex, ...patch } : ex)
    onChange({ ...day, exercises: next })
  }

  function addExercise() {
    onChange({ ...day, exercises: [...day.exercises, blankExercise()] })
  }

  function removeExercise(i: number) {
    onChange({ ...day, exercises: day.exercises.filter((_, idx) => idx !== i) })
  }

  return (
    <div className="border border-[var(--border-8)] rounded-xl overflow-hidden">
      {/* Day header */}
      <div className="flex items-center gap-3 px-4 py-2.5 bg-[var(--bg-subtle)]">
        <span className="text-xs font-bold text-[var(--fg-40)] w-[68px]">{DAY_LABELS[dayIdx]}</span>

        {/* Type pills */}
        <div className="flex gap-1 flex-wrap flex-1">
          {WORKOUT_TYPES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border transition-all ${
                day.workout_type === t
                  ? `${TYPE_COLORS[t]} border-current/30`
                  : 'bg-transparent border-[var(--border-8)] text-[var(--fg-30)] hover:text-[var(--fg-60)]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Copy to another day */}
        {otherDays.length > 0 && (
          <select
            title="Copy this day to…"
            onChange={(e) => { if (e.target.value !== '') { onCopyTo(Number(e.target.value)); e.target.value = '' } }}
            defaultValue=""
            className="text-[11px] bg-[var(--bg-hover)] border border-[var(--border-8)] rounded-lg px-1.5 py-1 text-[var(--fg-40)] focus:outline-none cursor-pointer"
          >
            <option value="" disabled>Copy to…</option>
            {otherDays.map((d) => (
              <option key={d} value={d}>{DAY_LABELS[d]}</option>
            ))}
          </select>
        )}
      </div>

      {/* Exercises */}
      {!isRest && (
        <div className="p-3 flex flex-col gap-2">
          {day.exercises.map((ex, i) => (
            <ExerciseRow
              key={i}
              exercise={ex}
              onChange={(patch) => updateExercise(i, patch)}
              onRemove={() => removeExercise(i)}
            />
          ))}
          <button
            type="button"
            onClick={addExercise}
            className="flex items-center gap-1.5 text-xs text-[var(--fg-40)] hover:text-[var(--accent-fg)] transition-colors py-1 self-start"
          >
            <Plus className="h-3.5 w-3.5" />
            Add exercise
          </button>
        </div>
      )}
    </div>
  )
}

function ExerciseRow({
  exercise,
  onChange,
  onRemove,
}: {
  exercise: ExerciseEntry
  onChange: (patch: Partial<ExerciseEntry>) => void
  onRemove: () => void
}) {
  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-5)] rounded-xl p-3 flex flex-col gap-2">
      {/* Row 1: name */}
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <input
            type="text"
            list="exercise-lib"
            value={exercise.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="Exercise name…"
            className="w-full bg-[var(--bg-input)] border border-[var(--border-8)] rounded-lg px-3 py-1.5 text-sm text-[var(--fg)] placeholder:text-[var(--fg-30)] focus:outline-none focus:border-[var(--accent)] transition-colors"
          />
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="h-7 w-7 flex items-center justify-center rounded-lg text-[var(--fg-30)] hover:text-red-400 hover:bg-red-500/10 transition-colors flex-shrink-0"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Row 2: sets / reps / weight / rest */}
      <div className="grid grid-cols-4 gap-1.5">
        <Field
          label="Sets"
          type="number"
          value={String(exercise.sets)}
          onChange={(v) => onChange({ sets: Number(v) })}
          placeholder="3"
          min="1"
        />
        <Field
          label="Reps"
          value={exercise.reps}
          onChange={(v) => onChange({ reps: v })}
          placeholder="8-12"
        />
        <Field
          label="Weight"
          value={exercise.weight_guidance}
          onChange={(v) => onChange({ weight_guidance: v })}
          placeholder="RPE 7"
        />
        <Field
          label="Rest (s)"
          type="number"
          value={String(exercise.rest_seconds)}
          onChange={(v) => onChange({ rest_seconds: Number(v) })}
          placeholder="60"
          min="0"
        />
      </div>

      {/* Row 3: coaching note */}
      <input
        type="text"
        value={exercise.coaching_note}
        onChange={(e) => onChange({ coaching_note: e.target.value })}
        placeholder="Coaching note (optional) — e.g. keep core tight, controlled eccentric"
        className="w-full bg-[var(--bg-input)] border border-[var(--border-8)] rounded-lg px-3 py-1.5 text-xs text-[var(--fg-60)] placeholder:text-[var(--fg-20)] focus:outline-none focus:border-[var(--accent)] transition-colors"
      />
    </div>
  )
}

function Field({
  label, value, onChange, placeholder, type = 'text', min,
}: {
  label: string; value: string; onChange: (v: string) => void
  placeholder: string; type?: string; min?: string
}) {
  return (
    <div>
      <p className="text-[10px] font-semibold text-[var(--fg-30)] uppercase tracking-wider mb-1">{label}</p>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        min={min}
        className="w-full bg-[var(--bg-input)] border border-[var(--border-8)] rounded-lg px-2 py-1.5 text-xs text-[var(--fg)] placeholder:text-[var(--fg-30)] focus:outline-none focus:border-[var(--accent)] transition-colors"
      />
    </div>
  )
}

// Datalist rendered once globally — must be in the DOM somewhere
export function ExerciseDatalist() {
  return (
    <datalist id="exercise-lib">
      {EXERCISE_NAMES.map((n) => <option key={n} value={n} />)}
    </datalist>
  )
}
