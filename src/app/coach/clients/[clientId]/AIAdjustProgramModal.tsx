'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import {
  X, Sparkles, ChevronDown, ChevronUp, AlertTriangle,
  CheckCircle2, ArrowRight, Wand2, ClipboardList,
} from 'lucide-react'
import type { AdjustResult, AdjustedProgram, AdjustedWeek } from '@/app/api/programs/ai-adjust/route'

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

/* ─── Props ─────────────────────────────────────────────── */
interface Props {
  clientId: string
  clientName: string
}

/* ─── Step types ────────────────────────────────────────── */
type Step = 'input' | 'loading' | 'review' | 'save'

/* ─── Program preview component ─────────────────────────── */
function ProgramPreview({ program }: { program: AdjustedProgram }) {
  const [openWeeks, setOpenWeeks] = useState<number[]>([1])

  function toggle(n: number) {
    setOpenWeeks((prev) => prev.includes(n) ? prev.filter((w) => w !== n) : [...prev, n])
  }

  return (
    <div className="flex flex-col gap-2">
      {program.weeks.map((week) => {
        const workouts = week.workouts.filter((w) => w.workoutType !== 'Rest' && w.exercises.length > 0)
        const isOpen = openWeeks.includes(week.weekNumber)
        return (
          <div key={week.weekNumber} className="border border-[var(--border-8)] rounded-xl overflow-hidden">
            <button
              onClick={() => toggle(week.weekNumber)}
              className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-[var(--bg-hover)] transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[var(--accent-fg)] w-14">Week {week.weekNumber}</span>
                {week.theme && <span className="text-xs text-[var(--fg-40)]">{week.theme}</span>}
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--bg-hover)] text-[var(--fg-40)]">
                  {workouts.length} workout{workouts.length !== 1 ? 's' : ''}
                </span>
              </div>
              {isOpen ? <ChevronUp className="h-3.5 w-3.5 text-[var(--fg-30)]" /> : <ChevronDown className="h-3.5 w-3.5 text-[var(--fg-30)]" />}
            </button>

            {isOpen && (
              <div className="border-t border-[var(--border-5)] px-4 py-3 flex flex-col gap-3">
                {week.workouts.map((day) => (
                  <div key={day.dayOfWeek}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[11px] font-semibold text-[var(--fg-60)] w-8">{DAY_LABELS[day.dayOfWeek]}</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        day.workoutType === 'Rest' ? 'bg-[var(--bg-hover)] text-[var(--fg-30)]' :
                        day.workoutType === 'Strength' ? 'bg-orange-500/15 text-orange-400' :
                        day.workoutType === 'Cardio' ? 'bg-red-500/15 text-red-400' :
                        day.workoutType === 'HIIT' ? 'bg-rose-500/15 text-rose-400' :
                        'bg-blue-500/15 text-blue-400'
                      }`}>
                        {day.workoutType}
                      </span>
                    </div>
                    {day.exercises.length > 0 && (
                      <div className="ml-10 flex flex-col gap-1">
                        {day.exercises.map((ex, i) => (
                          <div key={i} className="flex items-baseline gap-1.5 text-xs">
                            <span className="text-[var(--fg-70)] font-medium">{ex.name}</span>
                            <span className="text-[var(--fg-40)]">{ex.sets}×{ex.reps}</span>
                            {ex.weight_guidance && <span className="text-[var(--fg-30)]">@ {ex.weight_guidance}</span>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ─── Main component ────────────────────────────────────── */
export function AIAdjustProgramModal({ clientId, clientName }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<Step>('input')

  // Step 1
  const [programText, setProgramText] = useState('')

  // Step 2/3 — results
  const [result, setResult] = useState<AdjustResult | null>(null)
  const [error, setError] = useState('')
  const [chosen, setChosen] = useState<'adjusted' | 'original'>('adjusted')
  const [showOriginalPreview, setShowOriginalPreview] = useState(false)
  const [showAdjustedPreview, setShowAdjustedPreview] = useState(false)

  // Step 4 — save
  const [programName, setProgramName] = useState('')
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10))
  const [assignNow, setAssignNow] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  function handleClose() {
    if (step === 'loading') return
    setOpen(false)
    setTimeout(() => {
      setStep('input')
      setProgramText('')
      setResult(null)
      setError('')
      setChosen('adjusted')
      setSaveError('')
    }, 300)
  }

  async function handleAnalyse() {
    if (!programText.trim()) return
    setStep('loading')
    setError('')

    try {
      const res = await fetch('/api/programs/ai-adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ programText, clientId }),
      })

      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error(json.error ?? `Server error ${res.status}`)
      }

      const data: AdjustResult = await res.json()
      setResult(data)
      setProgramName(data.adjusted.name)
      setChosen(data.changes.length > 0 ? 'adjusted' : 'original')
      setStep('review')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setStep('input')
    }
  }

  async function handleSave() {
    if (!result) return
    setSaving(true)
    setSaveError('')

    const program: AdjustedProgram = chosen === 'adjusted' ? result.adjusted : result.original
    const supabase = createClient()

    try {
      // 1. Create program
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: prog, error: e1 } = await supabase
        .from('programs')
        .insert({
          name: programName || program.name,
          description: `AI-adjusted for ${clientName}${chosen === 'original' ? ' (coach original)' : ''}`,
          duration_weeks: program.durationWeeks,
          coach_id: user.id,
        })
        .select('id')
        .single()
      if (e1 || !prog) throw new Error(e1?.message ?? 'Failed to create program')

      const programId = prog.id

      // 2. Create program_weeks (habit_ids empty — coach can add later)
      const weekInserts = program.weeks.map((w) => ({
        program_id: programId,
        week_number: w.weekNumber,
        habit_ids: [] as string[],
      }))
      const { error: e2 } = await supabase.from('program_weeks').insert(weekInserts)
      if (e2) throw new Error(e2.message)

      // 3. Create program_workouts (only non-rest days with exercises)
      const workoutInserts = program.weeks.flatMap((w) =>
        w.workouts
          .filter((d) => d.workoutType !== 'Rest' && d.exercises.length > 0)
          .map((d) => ({
            program_id: programId,
            week_number: w.weekNumber,
            day_of_week: d.dayOfWeek,
            workout_type: d.workoutType,
            exercises: d.exercises,
          }))
      )
      if (workoutInserts.length > 0) {
        const { error: e3 } = await supabase.from('program_workouts').insert(workoutInserts)
        if (e3) throw new Error(e3.message)
      }

      // 4. Optionally assign to client
      if (assignNow) {
        const { error: e4 } = await supabase.from('client_programs').upsert(
          {
            client_id: clientId,
            program_id: programId,
            status: 'active',
            current_week: 1,
            start_date: startDate,
          },
          { onConflict: 'client_id' }
        )
        if (e4) throw new Error(e4.message)
      }

      handleClose()
      router.refresh()
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save program')
    } finally {
      setSaving(false)
    }
  }

  const selectedProgram = result ? (chosen === 'adjusted' ? result.adjusted : result.original) : null

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 w-full px-4 py-3 rounded-xl text-sm font-medium transition-all
          bg-[var(--accent-tint)] border border-[var(--accent-border-sub)] text-[var(--accent-fg)]
          hover:bg-[var(--accent-border-sub)] hover:border-[var(--accent-border)]"
      >
        <Wand2 className="h-4 w-4 flex-shrink-0" />
        AI-Adjust My Program
      </button>

      {!open ? null : (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Sheet */}
          <div className="relative w-full sm:max-w-2xl bg-[var(--bg-elevated)] border border-[var(--border)] sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col max-h-[94vh] sm:max-h-[88vh]">

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-8)] flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-[var(--accent-tint)] flex items-center justify-center flex-shrink-0">
                  <Wand2 className="h-4 w-4 text-[var(--accent-fg)]" />
                </div>
                <div>
                  <h2 className="font-semibold text-sm">AI Program Adjuster</h2>
                  <p className="text-xs text-[var(--fg-40)]">Personalise for {clientName}</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                disabled={step === 'loading'}
                className="p-1.5 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--fg-40)] disabled:opacity-30 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Step indicator */}
            <div className="flex items-center gap-1 px-5 py-3 border-b border-[var(--border-5)] flex-shrink-0">
              {(['input', 'review', 'save'] as const).map((s, i) => {
                const labels = ['Paste program', 'Review', 'Save']
                const stepOrder = { input: 0, loading: 0, review: 1, save: 2 }
                const current = stepOrder[step]
                const isDone = current > i
                const isActive = current === i
                return (
                  <div key={s} className="flex items-center gap-1">
                    {i > 0 && <div className={`h-px w-6 ${isDone ? 'bg-[var(--accent)]' : 'bg-[var(--border)]'}`} />}
                    <div className={`flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full transition-colors ${
                      isActive ? 'bg-[var(--accent-tint)] text-[var(--accent-fg)]' :
                      isDone ? 'text-[var(--accent-fg)]' : 'text-[var(--fg-30)]'
                    }`}>
                      {isDone ? <CheckCircle2 className="h-3 w-3" /> : <span className="h-3 w-3 rounded-full border border-current flex items-center justify-center text-[8px]">{i+1}</span>}
                      <span className="hidden sm:inline">{labels[i]}</span>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Body */}
            <div className="overflow-y-auto flex-1 px-5 py-5">

              {/* ── Step 1: Input ── */}
              {(step === 'input') && (
                <div className="flex flex-col gap-4">
                  <div>
                    <p className="text-sm text-[var(--fg-60)] mb-3 leading-relaxed">
                      Paste your program below — any format works. The AI will structure it, then produce a version adjusted for <strong className="text-[var(--fg)]">{clientName}</strong>&apos;s health profile and goals.
                    </p>
                    <div className="bg-[var(--accent-tint)] border border-[var(--accent-border-sub)] rounded-xl px-4 py-3 text-xs text-[var(--fg-50)] leading-relaxed mb-4">
                      <strong className="text-[var(--fg-60)]">Tip:</strong> You can paste anything — a spreadsheet copy, a notes app export, a PDF paste, or plain text like &ldquo;Week 1 Monday: Squats 3×10, Bench 4×8…&rdquo;
                    </div>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                      <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0" />
                      <p className="text-sm text-red-400">{error}</p>
                    </div>
                  )}

                  <textarea
                    value={programText}
                    onChange={(e) => setProgramText(e.target.value)}
                    placeholder={`Week 1
Monday – Strength
  Squat 3×10 @ 70% 1RM
  Bench Press 4×8 @ RPE 7
  Romanian Deadlift 3×12

Wednesday – Cardio
  30 min moderate pace run

Friday – Strength
  Deadlift 4×5 @ 80% 1RM
  Overhead Press 3×10
  Pull-ups 3×8

Week 2
...`}
                    rows={14}
                    className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--fg)] placeholder:text-[var(--fg-20)] resize-none focus:outline-none focus:ring-2 focus:ring-[var(--accent-ring)] focus:border-[var(--accent-border)] font-mono leading-relaxed"
                  />
                </div>
              )}

              {/* ── Step 2: Loading ── */}
              {step === 'loading' && (
                <div className="flex flex-col items-center justify-center py-16 gap-5">
                  <div className="relative">
                    <div className="h-14 w-14 rounded-full border-2 border-[var(--accent-border-sub)] border-t-[var(--accent)] animate-spin" />
                    <Sparkles className="h-6 w-6 text-[var(--accent-fg)] absolute inset-0 m-auto" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-sm mb-1">Analysing your program…</p>
                    <p className="text-xs text-[var(--fg-40)]">Cross-referencing with {clientName}&apos;s health profile</p>
                  </div>
                </div>
              )}

              {/* ── Step 3: Review ── */}
              {step === 'review' && result && (
                <div className="flex flex-col gap-5">

                  {/* Summary banner */}
                  <div className={`rounded-xl px-4 py-4 border ${
                    result.changes.length > 0
                      ? 'bg-[var(--accent-tint)] border-[var(--accent-border-sub)]'
                      : 'bg-green-500/8 border-green-500/20'
                  }`}>
                    <div className="flex items-start gap-2">
                      {result.changes.length > 0
                        ? <Wand2 className="h-4 w-4 text-[var(--accent-fg)] mt-0.5 flex-shrink-0" />
                        : <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                      }
                      <div>
                        <p className="text-sm font-semibold text-[var(--fg)] mb-0.5">
                          {result.changes.length > 0
                            ? `${result.changes.length} adjustment${result.changes.length !== 1 ? 's' : ''} suggested`
                            : 'Program looks great as-is'}
                        </p>
                        <p className="text-xs text-[var(--fg-50)] leading-relaxed">{result.adjustmentSummary}</p>
                      </div>
                    </div>
                  </div>

                  {/* Changes list */}
                  {result.changes.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-[var(--fg-40)] uppercase tracking-wider mb-2">What the AI changed</p>
                      <div className="flex flex-col gap-2">
                        {result.changes.map((c, i) => (
                          <div key={i} className="bg-[var(--bg-surface)] border border-[var(--border-5)] rounded-xl px-4 py-3">
                            <p className="text-sm font-medium text-[var(--fg)] mb-0.5">{c.description}</p>
                            <p className="text-xs text-[var(--fg-40)] leading-relaxed">{c.reason}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Choice */}
                  <div>
                    <p className="text-xs font-semibold text-[var(--fg-40)] uppercase tracking-wider mb-2">Choose a version to save</p>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setChosen('adjusted')}
                        className={`flex flex-col items-start gap-1.5 p-4 rounded-xl border text-left transition-all ${
                          chosen === 'adjusted'
                            ? 'border-[var(--accent)] bg-[var(--accent-tint)]'
                            : 'border-[var(--border-8)] hover:border-[var(--border)] bg-[var(--bg-surface)]'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Sparkles className={`h-4 w-4 ${chosen === 'adjusted' ? 'text-[var(--accent-fg)]' : 'text-[var(--fg-40)]'}`} />
                          <span className="text-sm font-semibold">AI Adjusted</span>
                        </div>
                        <p className="text-xs text-[var(--fg-40)] leading-relaxed">Personalised for {clientName}&apos;s health profile and goals</p>
                        {chosen === 'adjusted' && <CheckCircle2 className="h-3.5 w-3.5 text-[var(--accent-fg)] self-end" />}
                      </button>

                      <button
                        onClick={() => setChosen('original')}
                        className={`flex flex-col items-start gap-1.5 p-4 rounded-xl border text-left transition-all ${
                          chosen === 'original'
                            ? 'border-[var(--accent)] bg-[var(--accent-tint)]'
                            : 'border-[var(--border-8)] hover:border-[var(--border)] bg-[var(--bg-surface)]'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <ClipboardList className={`h-4 w-4 ${chosen === 'original' ? 'text-[var(--accent-fg)]' : 'text-[var(--fg-40)]'}`} />
                          <span className="text-sm font-semibold">My Original</span>
                        </div>
                        <p className="text-xs text-[var(--fg-40)] leading-relaxed">Your program as-is, structured by AI</p>
                        {chosen === 'original' && <CheckCircle2 className="h-3.5 w-3.5 text-[var(--accent-fg)] self-end" />}
                      </button>
                    </div>
                  </div>

                  {/* Preview toggles */}
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => setShowAdjustedPreview((v) => !v)}
                      className="flex items-center gap-2 text-xs text-[var(--fg-40)] hover:text-[var(--fg-60)] transition-colors"
                    >
                      {showAdjustedPreview ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                      Preview AI adjusted program
                    </button>
                    {showAdjustedPreview && <ProgramPreview program={result.adjusted} />}

                    {result.changes.length > 0 && (
                      <>
                        <button
                          onClick={() => setShowOriginalPreview((v) => !v)}
                          className="flex items-center gap-2 text-xs text-[var(--fg-40)] hover:text-[var(--fg-60)] transition-colors"
                        >
                          {showOriginalPreview ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                          Preview original program
                        </button>
                        {showOriginalPreview && <ProgramPreview program={result.original} />}
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* ── Step 4: Save ── */}
              {step === 'save' && selectedProgram && (
                <div className="flex flex-col gap-5">
                  <div className={`rounded-xl px-4 py-3 border flex items-center gap-3 ${
                    chosen === 'adjusted'
                      ? 'bg-[var(--accent-tint)] border-[var(--accent-border-sub)]'
                      : 'bg-[var(--bg-surface)] border-[var(--border-8)]'
                  }`}>
                    {chosen === 'adjusted'
                      ? <Sparkles className="h-4 w-4 text-[var(--accent-fg)] flex-shrink-0" />
                      : <ClipboardList className="h-4 w-4 text-[var(--fg-40)] flex-shrink-0" />
                    }
                    <p className="text-sm text-[var(--fg-60)]">
                      Saving <strong className="text-[var(--fg)]">{chosen === 'adjusted' ? 'AI adjusted' : 'original'}</strong> version
                      {' '}({selectedProgram.durationWeeks} weeks)
                    </p>
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-[var(--fg-70)]">Program name</label>
                      <input
                        type="text"
                        value={programName}
                        onChange={(e) => setProgramName(e.target.value)}
                        className="bg-[var(--bg-input)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--fg)] placeholder:text-[var(--fg-30)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-ring)]"
                      />
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex flex-col gap-1.5 flex-1">
                        <label className="text-sm font-medium text-[var(--fg-70)]">Start date for {clientName}</label>
                        <input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          disabled={!assignNow}
                          className="bg-[var(--bg-input)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--fg)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-ring)] disabled:opacity-40"
                        />
                      </div>
                    </div>

                    <label className="flex items-center gap-3 cursor-pointer select-none">
                      <div
                        onClick={() => setAssignNow((v) => !v)}
                        className={`h-5 w-9 rounded-full transition-colors relative flex-shrink-0 ${
                          assignNow ? 'bg-[var(--accent)]' : 'bg-[var(--border)]'
                        }`}
                      >
                        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                          assignNow ? 'translate-x-4' : 'translate-x-0.5'
                        }`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Assign to {clientName} now</p>
                        <p className="text-xs text-[var(--fg-40)]">Client will see this program immediately</p>
                      </div>
                    </label>
                  </div>

                  {saveError && (
                    <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                      <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0" />
                      <p className="text-sm text-red-400">{saveError}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-[var(--border-8)] flex items-center justify-between gap-3 flex-shrink-0">
              {step === 'input' && (
                <>
                  <button onClick={handleClose} className="text-sm text-[var(--fg-40)] hover:text-[var(--fg-60)] transition-colors">
                    Cancel
                  </button>
                  <Button
                    onClick={handleAnalyse}
                    disabled={!programText.trim()}
                    size="md"
                    className="gap-2"
                  >
                    <Sparkles className="h-4 w-4" />
                    Analyse for {clientName}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </>
              )}

              {step === 'review' && result && (
                <>
                  <button
                    onClick={() => setStep('input')}
                    className="text-sm text-[var(--fg-40)] hover:text-[var(--fg-60)] transition-colors"
                  >
                    ← Edit program
                  </button>
                  <Button onClick={() => setStep('save')} size="md" className="gap-2">
                    Use {chosen === 'adjusted' ? 'AI version' : 'my original'}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </>
              )}

              {step === 'save' && (
                <>
                  <button
                    onClick={() => setStep('review')}
                    className="text-sm text-[var(--fg-40)] hover:text-[var(--fg-60)] transition-colors"
                  >
                    ← Back
                  </button>
                  <Button
                    onClick={handleSave}
                    loading={saving}
                    disabled={!programName.trim()}
                    size="md"
                    className="gap-2"
                  >
                    Create program
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
