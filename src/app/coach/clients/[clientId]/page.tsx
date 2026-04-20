import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Flame, Heart, AlertTriangle } from 'lucide-react'
import { AssignHabitPanel } from './AssignHabitPanel'
import { ClientDetailTabs } from './ClientDetailTabs'
import { ProgramControls } from './ProgramControls'
import { AIAdjustProgramModal } from './AIAdjustProgramModal'
import type { PhotoRecord } from './ProgressTab'
import type { PlannedDay, WorkoutLogEntry } from './ProgramPlanTab'

type HabitRef = { id: string; label: string; icon: string }

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ clientId: string }>
}) {
  const { clientId } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Verify this client belongs to this coach
  const { data: client } = await supabase
    .from('profiles')
    .select('id, full_name, coach_id')
    .eq('id', clientId)
    .eq('coach_id', user.id)
    .single()

  if (!client) notFound()

  // Client's assigned habits — cast the joined relation to known type
  const { data: rawClientHabits } = await supabase
    .from('client_habits')
    .select('id, streak, habit:habits(id, label, icon)')
    .eq('client_id', clientId)

  const clientHabits: { id: string; streak: number; habit: HabitRef | null }[] = (
    rawClientHabits ?? []
  ).map((ch) => ({
    id: ch.id,
    streak: ch.streak,
    habit: (ch.habit as unknown as HabitRef | null),
  }))

  // Coach's habit templates for assigning
  const { data: coachHabits } = await supabase
    .from('habits')
    .select('id, label, icon')
    .eq('coach_id', user.id)

  // Client's health profile
  const { data: healthProfile } = await supabase
    .from('health_profiles')
    .select('data, updated_at')
    .eq('client_id', clientId)
    .single()

  const hp = healthProfile?.data as Record<string, string> | null

  // Last 30 checkins
  const { data: checkins } = await supabase
    .from('checkins')
    .select('date, note, completed_habits')
    .eq('client_id', clientId)
    .order('date', { ascending: false })
    .limit(30)

  // Workout history (last 60 entries, enough for the 8-week chart + list)
  let workouts: {
    id: string; date: string; type: string; duration_mins: number
    effort: number; exercises: unknown; notes: string | null
  }[] = []
  try {
    const { data } = await supabase
      .from('workouts')
      .select('id, date, type, duration_mins, effort, exercises, notes')
      .eq('client_id', clientId)
      .order('date', { ascending: false })
      .limit(60)
    workouts = data ?? []
  } catch {
    // workouts table not yet created
  }

  // Progress photos
  let photos: PhotoRecord[] = []
  try {
    const { data: rows } = await supabase
      .from('progress_photos')
      .select('id, date, storage_path, weight_kg')
      .eq('client_id', clientId)
      .order('date', { ascending: false })

    if (rows?.length) {
      const paths = rows.map((r) => r.storage_path)
      const { data: signed } = await supabase.storage
        .from('progress-photos')
        .createSignedUrls(paths, 3600)

      photos = rows.map((r, i) => ({
        id:         r.id,
        date:       r.date,
        weight_kg:  r.weight_kg ?? null,
        signed_url: signed?.[i]?.signedUrl ?? '',
      }))
    }
  } catch {
    // progress_photos table or bucket not yet created
  }

  // Active program assignment
  type ActiveProgramType = {
    id: string; program_id: string; current_week: number; status: string
    start_date: string; program: { name: string; duration_weeks: number }
  }
  let activeProgram: ActiveProgramType | null = null
  try {
    const { data: cp } = await supabase
      .from('client_programs')
      .select('id, program_id, current_week, status, start_date, program:programs(name, duration_weeks)')
      .eq('client_id', clientId)
      .single()
    if (cp) {
      activeProgram = cp as unknown as ActiveProgramType
    }
  } catch { /* no program assigned */ }

  // Program workout plan + client logs (for Plan tab)
  let plannedDays: PlannedDay[] = []
  let workoutLogs: WorkoutLogEntry[] = []
  if (activeProgram) {
    try {
      const [{ data: pwRows }, { data: logRows }] = await Promise.all([
        supabase
          .from('program_workouts')
          .select('id, week_number, day_of_week, workout_type, exercises')
          .eq('program_id', activeProgram.program_id)
          .order('week_number').order('day_of_week'),
        supabase
          .from('workout_logs')
          .select('id, date, completed, program_workout_id, actual_performance')
          .eq('client_id', clientId)
          .order('date', { ascending: false })
          .limit(100),
      ])
      plannedDays = (pwRows ?? []).map((r) => ({
        id: r.id,
        week_number: r.week_number,
        day_of_week: r.day_of_week,
        workout_type: r.workout_type,
        exercises: (r.exercises ?? []) as PlannedDay['exercises'],
      }))
      workoutLogs = (logRows ?? []) as unknown as WorkoutLogEntry[]
    } catch { /* tables may not exist yet */ }
  }

  const assignedHabitIds = clientHabits
    .map((ch) => ch.habit?.id)
    .filter((id): id is string => Boolean(id))

  return (
    <div className="flex flex-col gap-6">
      {/* Back + header */}
      <div>
        <Link
          href="/coach"
          className="flex items-center gap-1.5 text-sm text-[var(--fg-40)] hover:text-[var(--fg-70)] transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[var(--accent-wash)] to-[var(--accent-tint)] border border-[var(--accent-border-sub)] flex items-center justify-center">
            <span className="text-2xl font-bold text-[var(--accent-fg)]">
              {client.full_name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-bold">{client.full_name}</h1>
            <p className="text-[var(--fg-40)] text-sm">{checkins?.length ?? 0} check-ins recorded</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: program + habits + assign */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          {/* Active program */}
          {activeProgram && (
            <ProgramControls
              assignmentId={activeProgram.id}
              programName={(activeProgram.program as { name: string; duration_weeks: number }).name}
              durationWeeks={(activeProgram.program as { name: string; duration_weeks: number }).duration_weeks}
              currentWeek={activeProgram.current_week}
              status={activeProgram.status as 'active' | 'paused' | 'completed'}
            />
          )}

          {/* AI program adjuster */}
          <AIAdjustProgramModal clientId={clientId} clientName={client.full_name} />

          {/* Current habits */}
          <div className="bg-[var(--bg-surface)] border border-[var(--border-8)] rounded-2xl p-5">
            <h2 className="font-semibold mb-4">Assigned habits</h2>
            {!clientHabits.length ? (
              <p className="text-sm text-[var(--fg-30)]">No habits assigned yet.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {clientHabits.map((ch) => {
                  if (!ch.habit) return null
                  return (
                    <div
                      key={ch.id}
                      className="flex items-center justify-between bg-[var(--bg-subtle)] rounded-xl px-3 py-2.5"
                    >
                      <div className="flex items-center gap-2">
                        <span>{ch.habit.icon}</span>
                        <span className="text-sm">{ch.habit.label}</span>
                      </div>
                      <div className="flex items-center gap-1 text-orange-400">
                        <Flame className="h-3.5 w-3.5" />
                        <span className="text-xs font-semibold">{ch.streak}d</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Assign habits panel */}
          <AssignHabitPanel
            clientId={clientId}
            coachHabits={coachHabits ?? []}
            assignedHabitIds={assignedHabitIds}
          />
        </div>

        {/* Right: tabbed check-in + workout history */}
        <div className="lg:col-span-2">
          <ClientDetailTabs
            checkins={(checkins ?? []) as { date: string; note: string | null; completed_habits: string[] }[]}
            workouts={workouts as Parameters<typeof ClientDetailTabs>[0]['workouts']}
            clientHabits={clientHabits}
            photos={photos}
            plannedDays={plannedDays}
            workoutLogs={workoutLogs}
            programCurrentWeek={activeProgram?.current_week}
            programName={(activeProgram?.program as { name: string } | undefined)?.name}
          />
        </div>
      </div>

      {/* Health Profile */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-8)] rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--border-8)] flex items-center gap-2">
          <Heart className="h-4 w-4 text-red-400" />
          <h2 className="font-semibold">Health Profile</h2>
          {hp && healthProfile?.updated_at && (
            <span className="ml-auto text-xs text-[var(--fg-40)]">
              Updated {new Date(healthProfile.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          )}
        </div>

        {!hp || !Object.values(hp).some(Boolean) ? (
          <div className="p-8 text-center text-[var(--fg-30)] text-sm flex flex-col items-center gap-2">
            <Heart className="h-8 w-8 text-[var(--fg-20)]" />
            Client hasn&apos;t submitted a health profile yet.
          </div>
        ) : (
          <div className="p-6 flex flex-col gap-6">

            {/* Personal Stats */}
            {(hp.weight || hp.height || hp.age || hp.gender || hp.bodyFat) && (
              <div>
                <p className="text-xs font-semibold text-[var(--fg-40)] uppercase tracking-wider mb-3">Personal Stats</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {hp.weight && (
                    <Stat label="Weight" value={`${hp.weight} kg`} />
                  )}
                  {hp.height && (
                    <Stat label="Height" value={`${hp.height} cm`} />
                  )}
                  {hp.weight && hp.height && (
                    <Stat
                      label="BMI"
                      value={(Number(hp.weight) / Math.pow(Number(hp.height) / 100, 2)).toFixed(1)}
                      highlight
                    />
                  )}
                  {hp.age && <Stat label="Age" value={`${hp.age} yrs`} />}
                  {hp.gender && (
                    <Stat label="Gender" value={hp.gender.replace('_', ' ')} capitalize />
                  )}
                  {hp.bodyFat && <Stat label="Body Fat" value={`${hp.bodyFat}%`} />}
                </div>
              </div>
            )}

            {/* Medical Data */}
            {(hp.bpSystolic || hp.heartRate || hp.bloodSugar || hp.cholesterol) && (
              <div>
                <p className="text-xs font-semibold text-[var(--fg-40)] uppercase tracking-wider mb-3">Medical Data</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {hp.bpSystolic && hp.bpDiastolic && (
                    <Stat label="Blood Pressure" value={`${hp.bpSystolic}/${hp.bpDiastolic}`} unit="mmHg" />
                  )}
                  {hp.heartRate && <Stat label="Resting HR" value={hp.heartRate} unit="bpm" />}
                  {hp.bloodSugar && <Stat label="Blood Sugar" value={hp.bloodSugar} unit="mg/dL" />}
                  {hp.cholesterol && <Stat label="Cholesterol" value={hp.cholesterol} unit="mg/dL" />}
                </div>
              </div>
            )}

            {/* Lifestyle */}
            {(hp.activityLevel || hp.primaryGoal) && (
              <div>
                <p className="text-xs font-semibold text-[var(--fg-40)] uppercase tracking-wider mb-3">Lifestyle</p>
                <div className="flex flex-wrap gap-2">
                  {hp.activityLevel && (
                    <span className="text-sm px-3 py-1.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 capitalize">
                      {hp.activityLevel.replace('_', ' ')}
                    </span>
                  )}
                  {hp.primaryGoal && (
                    <span className="text-sm px-3 py-1.5 rounded-xl bg-[var(--accent-tint)] text-[var(--accent-fg)] border border-[var(--accent-border-sub)] capitalize">
                      {hp.primaryGoal.replace('_', ' ')}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Injuries / Medications */}
            {(hp.injuries || hp.medications) && (
              <div className="flex flex-col gap-3">
                {hp.injuries && (
                  <div className="bg-yellow-500/8 border border-yellow-500/20 rounded-xl px-4 py-3">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className="h-3.5 w-3.5 text-yellow-400" />
                      <p className="text-xs font-semibold text-yellow-400 uppercase tracking-wider">Injuries / Limitations</p>
                    </div>
                    <p className="text-sm text-[var(--fg-70)]">{hp.injuries}</p>
                  </div>
                )}
                {hp.medications && (
                  <div className="bg-red-500/8 border border-red-500/20 rounded-xl px-4 py-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Heart className="h-3.5 w-3.5 text-red-400" />
                      <p className="text-xs font-semibold text-red-400 uppercase tracking-wider">Medications / Conditions</p>
                    </div>
                    <p className="text-sm text-[var(--fg-70)]">{hp.medications}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function Stat({
  label,
  value,
  unit,
  highlight,
  capitalize,
}: {
  label: string
  value: string
  unit?: string
  highlight?: boolean
  capitalize?: boolean
}) {
  return (
    <div className="bg-[var(--bg-elevated)] border border-[var(--border-8)] rounded-xl px-4 py-3">
      <p className="text-xs text-[var(--fg-40)] mb-1">{label}</p>
      <p className={`font-bold text-lg ${highlight ? 'text-[var(--accent-fg)]' : 'text-[var(--fg)]'} ${capitalize ? 'capitalize' : ''}`}>
        {value}
        {unit && <span className="text-xs font-normal text-[var(--fg-40)] ml-1">{unit}</span>}
      </p>
    </div>
  )
}
