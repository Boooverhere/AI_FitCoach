'use client'

import { useState } from 'react'
import { CalendarDays, Dumbbell, CheckCircle2, XCircle, Camera, ClipboardList } from 'lucide-react'
import { ProgressTab, type PhotoRecord } from './ProgressTab'
import { ProgramPlanTab, type PlannedDay, type WorkoutLogEntry } from './ProgramPlanTab'

/* ── Types ─────────────────────────────────────────────── */

interface HabitRef { id: string; label: string; icon: string }
interface ClientHabit { id: string; streak: number; habit: HabitRef | null }

interface CheckIn {
  date: string
  note: string | null
  completed_habits: string[]
}

interface ExerciseEntry {
  name: string
  sets: number | null
  reps: number | null
  weight: number | null
}

interface Workout {
  id: string
  date: string
  type: string
  duration_mins: number
  effort: number
  exercises: ExerciseEntry[]
  notes: string | null
}

interface Props {
  checkins: CheckIn[]
  workouts: Workout[]
  clientHabits: ClientHabit[]
  photos: PhotoRecord[]
  plannedDays?: PlannedDay[]
  workoutLogs?: WorkoutLogEntry[]
  programCurrentWeek?: number
  programName?: string
}

/* ── Helpers ───────────────────────────────────────────── */

const TYPE_STYLES: Record<string, string> = {
  Strength:  'bg-orange-500/15 text-orange-400',
  Cardio:    'bg-red-500/15 text-red-400',
  HIIT:      'bg-rose-500/15 text-rose-400',
  Yoga:      'bg-purple-500/15 text-purple-400',
  Mobility:  'bg-blue-500/15 text-blue-400',
  Other:     'bg-[var(--bg-hover)] text-[var(--fg-50)]',
}

const EFFORT_COLOR = (e: number) =>
  e <= 3 ? 'text-green-400 bg-green-500/10' : e <= 6 ? 'text-yellow-400 bg-yellow-500/10' : 'text-red-400 bg-red-500/10'

function fmtDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
  })
}

/* ── Weekly volume chart (pure SVG, no deps) ───────────── */

interface WeekBucket { label: string; count: number }

function getWeekBuckets(workouts: Workout[], n = 8): WeekBucket[] {
  const now = new Date()
  // Align to Monday of current week
  const dayOfWeek = (now.getDay() + 6) % 7 // Mon=0 … Sun=6
  const thisMonday = new Date(now)
  thisMonday.setDate(now.getDate() - dayOfWeek)
  thisMonday.setHours(0, 0, 0, 0)

  return Array.from({ length: n }, (_, i) => {
    const weekStart = new Date(thisMonday)
    weekStart.setDate(thisMonday.getDate() - (n - 1 - i) * 7)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 7)

    const count = workouts.filter((w) => {
      const d = new Date(w.date + 'T00:00:00')
      return d >= weekStart && d < weekEnd
    }).length

    const label =
      i === n - 1
        ? 'This wk'
        : weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

    return { label, count }
  })
}

function WeeklyChart({ workouts }: { workouts: Workout[] }) {
  const weeks = getWeekBuckets(workouts)
  const maxCount = Math.max(...weeks.map((w) => w.count), 1)
  const BAR_W = 32
  const GAP = 10
  const CHART_H = 72
  const LABEL_H = 24
  const SVG_W = weeks.length * (BAR_W + GAP) - GAP

  return (
    <div className="px-4 pt-4 pb-3">
      <p className="text-xs font-semibold text-[var(--fg-40)] uppercase tracking-wider mb-3">
        Weekly Volume — last 8 weeks
      </p>
      <div className="overflow-x-auto">
        <svg
          viewBox={`-4 0 ${SVG_W + 8} ${CHART_H + LABEL_H}`}
          style={{ minWidth: SVG_W + 8, height: CHART_H + LABEL_H }}
          className="w-full"
        >
          {weeks.map((week, i) => {
            const x = i * (BAR_W + GAP)
            const barH = week.count === 0 ? 3 : Math.max(6, (week.count / maxCount) * CHART_H)
            const y = CHART_H - barH

            return (
              <g key={i}>
                <rect
                  x={x} y={y} width={BAR_W} height={barH} rx={5}
                  fill={week.count > 0 ? 'var(--accent)' : 'var(--bg-hover)'}
                  opacity={week.count > 0 ? 0.85 : 1}
                />
                {week.count > 0 && (
                  <text
                    x={x + BAR_W / 2} y={y - 5}
                    textAnchor="middle" fontSize={10}
                    fill="var(--fg-50)"
                  >
                    {week.count}
                  </text>
                )}
                <text
                  x={x + BAR_W / 2} y={CHART_H + LABEL_H - 4}
                  textAnchor="middle" fontSize={9}
                  fill="var(--fg-30)"
                >
                  {week.label}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
    </div>
  )
}

/* ── Component ─────────────────────────────────────────── */

export function ClientDetailTabs({ checkins, workouts, clientHabits, photos, plannedDays, workoutLogs, programCurrentWeek, programName }: Props) {
  const [tab, setTab] = useState<'checkins' | 'workouts' | 'progress' | 'plan'>('checkins')
  const hasPlan = (plannedDays?.length ?? 0) > 0

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-8)] rounded-2xl overflow-hidden">
      {/* Tab switcher */}
      <div className="flex border-b border-[var(--border-8)]">
        <TabBtn
          active={tab === 'checkins'}
          onClick={() => setTab('checkins')}
          icon={<CalendarDays className="h-4 w-4" />}
          label="Check-ins"
          count={checkins.length}
        />
        <TabBtn
          active={tab === 'workouts'}
          onClick={() => setTab('workouts')}
          icon={<Dumbbell className="h-4 w-4" />}
          label="Workouts"
          count={workouts.length}
        />
        <TabBtn
          active={tab === 'progress'}
          onClick={() => setTab('progress')}
          icon={<Camera className="h-4 w-4" />}
          label="Progress"
          count={photos.length}
        />
        {hasPlan && (
          <TabBtn
            active={tab === 'plan'}
            onClick={() => setTab('plan')}
            icon={<ClipboardList className="h-4 w-4" />}
            label="Plan"
          />
        )}
      </div>

      {/* ── Check-in tab ──────────────────────── */}
      {tab === 'checkins' && (
        <>
          <div className="px-4 py-2.5 border-b border-[var(--border-5)]">
            <span className="text-xs text-[var(--fg-40)]">Last 30 days</span>
          </div>
          {!checkins.length ? (
            <div className="p-12 text-center text-[var(--fg-30)] text-sm">No check-ins yet.</div>
          ) : (
            <div className="divide-y divide-[var(--border-5)] max-h-[600px] overflow-y-auto">
              {checkins.map((ci) => {
                const habitIds: string[] = ci.completed_habits ?? []
                return (
                  <div key={ci.date} className="px-6 py-4 hover:bg-[var(--bg-subtle)] transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{fmtDate(ci.date)}</span>
                          {habitIds.length > 0
                            ? <CheckCircle2 className="h-3.5 w-3.5 text-[var(--accent-fg)]" />
                            : <XCircle className="h-3.5 w-3.5 text-[var(--fg-20)]" />
                          }
                        </div>
                        {ci.note && (
                          <p className="text-sm text-[var(--fg-50)] italic line-clamp-2">
                            &ldquo;{ci.note}&rdquo;
                          </p>
                        )}
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {clientHabits.map((ch) => {
                            if (!ch.habit) return null
                            const done = habitIds.includes(ch.habit.id)
                            return (
                              <span
                                key={ch.habit.id}
                                className={`text-xs px-2 py-0.5 rounded-full ${
                                  done
                                    ? 'bg-[var(--accent-tint)] text-[var(--accent-fg)]'
                                    : 'bg-[var(--bg-input)] text-[var(--fg-30)]'
                                }`}
                              >
                                {ch.habit.icon} {ch.habit.label}
                              </span>
                            )
                          })}
                        </div>
                      </div>
                      <span className="text-xs text-[var(--fg-30)] shrink-0">
                        {habitIds.length}/{clientHabits.length}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      {/* ── Workout tab ───────────────────────── */}
      {tab === 'workouts' && (
        <>
          <WeeklyChart workouts={workouts} />

          {!workouts.length ? (
            <div className="px-6 pb-12 pt-4 text-center text-[var(--fg-30)] text-sm flex flex-col items-center gap-2">
              <Dumbbell className="h-8 w-8 text-[var(--fg-20)]" />
              No workouts logged yet.
            </div>
          ) : (
            <div className="divide-y divide-[var(--border-5)] max-h-[600px] overflow-y-auto border-t border-[var(--border-8)]">
              {workouts.map((w) => (
                <div key={w.id} className="px-5 py-4 hover:bg-[var(--bg-subtle)] transition-colors">
                  {/* Row header */}
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className="font-medium text-sm">{fmtDate(w.date)}</span>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${TYPE_STYLES[w.type] ?? TYPE_STYLES.Other}`}>
                      {w.type}
                    </span>
                    <span className="text-xs text-[var(--fg-40)]">{w.duration_mins} min</span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${EFFORT_COLOR(w.effort)}`}>
                      RPE {w.effort}
                    </span>
                  </div>

                  {/* Exercises */}
                  {w.exercises?.length > 0 && (
                    <div className="flex flex-col gap-1 mb-2">
                      {w.exercises.map((ex, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-[var(--fg-60)]">
                          <span className="font-medium text-[var(--fg)]">{ex.name}</span>
                          {ex.sets != null && <span>{ex.sets} sets</span>}
                          {ex.reps != null && <span>× {ex.reps}</span>}
                          {ex.weight != null && ex.weight > 0 && (
                            <span className="text-[var(--fg-40)]">@ {ex.weight} kg</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {w.notes && (
                    <p className="text-xs text-[var(--fg-40)] italic mt-1.5">
                      &ldquo;{w.notes}&rdquo;
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── Progress tab ──────────────────────── */}
      {tab === 'progress' && <ProgressTab photos={photos} />}

      {/* ── Plan tab ──────────────────────────── */}
      {tab === 'plan' && (
        <ProgramPlanTab
          planned={plannedDays ?? []}
          logs={workoutLogs ?? []}
          currentWeek={programCurrentWeek ?? 1}
          programName={programName ?? ''}
        />
      )}
    </div>
  )
}

function TabBtn({
  active, onClick, icon, label, count,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
  count?: number
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3.5 text-sm font-medium transition-colors border-b-2 ${
        active
          ? 'border-[var(--accent)] text-[var(--accent-fg)] bg-[var(--accent-tint)]'
          : 'border-transparent text-[var(--fg-50)] hover:text-[var(--fg)] hover:bg-[var(--bg-hover)]'
      }`}
    >
      {icon}
      <span>{label}</span>
      {count !== undefined && (
        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
          active ? 'bg-[var(--accent)] text-[var(--accent-on-solid)]' : 'bg-[var(--bg-hover)] text-[var(--fg-40)]'
        }`}>
          {count}
        </span>
      )}
    </button>
  )
}
