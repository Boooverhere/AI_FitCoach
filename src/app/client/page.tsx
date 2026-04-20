import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CheckInForm } from './CheckInForm'
import { WorkoutLogger } from './WorkoutLogger'
import { TodaysWorkout, type PlannedWorkout } from './TodaysWorkout'
import { Flame, Calendar, TrendingUp, Heart, ChevronRight, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

export default async function ClientDashboard() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const today = new Date().toISOString().slice(0, 10)

  // Get client profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, coach_id')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/onboarding')

  // Get assigned habits with streaks
  const { data: clientHabits } = await supabase
    .from('client_habits')
    .select('id, streak, habit:habits(id, label, icon)')
    .eq('client_id', user.id)

  // Today's check-in
  const { data: todayCheckin } = await supabase
    .from('checkins')
    .select('id, completed_habits, note')
    .eq('client_id', user.id)
    .eq('date', today)
    .single()

  // 30-day completion stats
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10)
  const { data: recentCheckins } = await supabase
    .from('checkins')
    .select('date')
    .eq('client_id', user.id)
    .gte('date', thirtyDaysAgo)

  const completionRate = Math.round(((recentCheckins?.length ?? 0) / 30) * 100)

  // Health profile completion
  const { data: healthProfile } = await supabase
    .from('health_profiles')
    .select('data')
    .eq('client_id', user.id)
    .single()

  const profileData = healthProfile?.data as Record<string, string> | null
  const profileComplete = !!(
    profileData?.weight &&
    profileData?.height &&
    profileData?.age &&
    profileData?.primaryGoal
  )

  // Active program — fetch client_programs and programs separately to avoid
  // RLS join failures (programs table may restrict direct client reads)
  type ActiveProgram = {
    id: string; current_week: number; status: string; start_date: string
    program: { name: string; duration_weeks: number }
    weekHabitIds: string[]
  }
  let activeProgram: ActiveProgram | null = null
  try {
    const { data: cp } = await supabase
      .from('client_programs')
      .select('id, program_id, current_week, status, start_date')
      .eq('client_id', user.id)
      .eq('status', 'active')
      .order('start_date', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (cp) {
      // Fetch the program details separately
      const { data: prog } = await supabase
        .from('programs')
        .select('name, duration_weeks')
        .eq('id', cp.program_id)
        .single()

      const programInfo = prog ?? { name: 'My Program', duration_weeks: 1 }

      // Advance week if needed (time-based)
      const daysSinceStart = Math.floor(
        (Date.now() - new Date(cp.start_date).getTime()) / (1000 * 60 * 60 * 24)
      )
      const expectedWeek = Math.min(
        Math.floor(daysSinceStart / 7) + 1,
        programInfo.duration_weeks
      )
      if (expectedWeek !== cp.current_week) {
        await supabase
          .from('client_programs')
          .update({ current_week: expectedWeek })
          .eq('id', cp.id)
        cp.current_week = expectedWeek
      }

      // Get current week's habit_ids
      const { data: weekRow } = await supabase
        .from('program_weeks')
        .select('habit_ids')
        .eq('program_id', cp.program_id)
        .eq('week_number', cp.current_week)
        .maybeSingle()

      activeProgram = {
        id: cp.id,
        current_week: cp.current_week,
        status: cp.status,
        start_date: cp.start_date,
        program: programInfo,
        weekHabitIds: (weekRow?.habit_ids as string[]) ?? [],
      }
    }
  } catch { /* no active program */ }

  // Today's planned workout (from program)
  let todayPlannedWorkout: PlannedWorkout | null = null
  let todayWorkoutLog: { id: string; completed: boolean; actual_performance: unknown[] } | null = null
  if (activeProgram) {
    try {
      // day_of_week: Mon=0 … Sun=6 (JS getDay: Sun=0, so remap)
      const jsDay = new Date(today + 'T00:00:00').getDay() // 0=Sun
      const dayOfWeek = jsDay === 0 ? 6 : jsDay - 1       // Mon=0 … Sun=6

      const { data: pw } = await supabase
        .from('program_workouts')
        .select('id, workout_type, exercises')
        .eq('program_id', (await supabase
          .from('client_programs')
          .select('program_id')
          .eq('client_id', user.id)
          .single()
        ).data?.program_id ?? '')
        .eq('week_number', activeProgram.current_week)
        .eq('day_of_week', dayOfWeek)
        .single()

      if (pw && pw.workout_type !== 'Rest') {
        todayPlannedWorkout = {
          id: (pw as { id: string }).id,
          workout_type: pw.workout_type,
          exercises: (pw.exercises as unknown as PlannedWorkout['exercises']) ?? [],
        }

        // Check if already logged today
        const { data: log } = await supabase
          .from('workout_logs')
          .select('id, completed, actual_performance')
          .eq('client_id', user.id)
          .eq('date', today)
          .single()

        if (log) {
          todayWorkoutLog = log as unknown as typeof todayWorkoutLog
        }
      }
    } catch { /* no workout today */ }
  }

  // Best streak across habits
  const maxStreak = Math.max(0, ...(clientHabits?.map((ch) => ch.streak) ?? [0]))

  type HabitRef = { id: string; label: string; icon: string }
  const allHabits = (clientHabits ?? [])
    .map((ch) => ({
      clientHabitId: ch.id,
      streak: ch.streak,
      habit: (ch.habit as unknown as HabitRef | null),
    }))
    .filter((ch): ch is { clientHabitId: string; streak: number; habit: HabitRef } =>
      ch.habit !== null
    )

  // Filter to current week's habits if on a program
  const habits =
    activeProgram && activeProgram.weekHabitIds.length > 0
      ? allHabits.filter((h) => activeProgram!.weekHabitIds.includes(h.habit.id))
      : allHabits

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">
          Hey, <span className="text-[var(--accent-fg)]">{profile.full_name.split(' ')[0]}</span> 👋
        </h1>
        <p className="text-[var(--fg-40)] text-sm mt-0.5">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>

      {/* Health profile banner */}
      {profileComplete ? (
        <Link
          href="/client/profile"
          className="flex items-center gap-3 bg-[var(--accent-wash)] border border-[var(--accent-border-sub)] rounded-2xl px-5 py-3 hover:bg-[var(--accent-tint)] transition-colors"
        >
          <CheckCircle2 className="h-5 w-5 text-[var(--accent-fg)] flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-[var(--accent-fg)]">Health profile complete</p>
            <p className="text-xs text-[var(--fg-40)]">Your coach can see your health data</p>
          </div>
          <ChevronRight className="h-4 w-4 text-[var(--accent-fg)] opacity-50" />
        </Link>
      ) : (
        <Link
          href="/client/profile"
          className="flex items-center gap-3 bg-[var(--bg-surface)] border border-[var(--border-8)] rounded-2xl px-5 py-3 hover:border-[var(--accent-border-sub)] transition-colors group"
        >
          <div className="h-9 w-9 rounded-xl bg-[var(--bg-hover)] flex items-center justify-center flex-shrink-0 group-hover:bg-[var(--accent-tint)] transition-colors">
            <Heart className="h-4 w-4 text-[var(--fg-40)] group-hover:text-[var(--accent-fg)] transition-colors" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Complete your health profile</p>
            <p className="text-xs text-[var(--fg-40)]">Help your coach personalise your plan</p>
          </div>
          <ChevronRight className="h-4 w-4 text-[var(--fg-30)]" />
        </Link>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[var(--bg-surface)] border border-[var(--border-8)] rounded-2xl p-4 text-center">
          <Flame className="h-5 w-5 text-orange-400 mx-auto mb-1" />
          <p className="text-xl font-bold">{maxStreak}</p>
          <p className="text-xs text-[var(--fg-40)]">Best streak</p>
        </div>
        <div className="bg-[var(--bg-surface)] border border-[var(--border-8)] rounded-2xl p-4 text-center">
          <TrendingUp className="h-5 w-5 text-[var(--accent-fg)] mx-auto mb-1" />
          <p className="text-xl font-bold">{completionRate}%</p>
          <p className="text-xs text-[var(--fg-40)]">30-day rate</p>
        </div>
        <div className="bg-[var(--bg-surface)] border border-[var(--border-8)] rounded-2xl p-4 text-center">
          <Calendar className="h-5 w-5 text-blue-400 mx-auto mb-1" />
          <p className="text-xl font-bold">{recentCheckins?.length ?? 0}</p>
          <p className="text-xs text-[var(--fg-40)]">Days logged</p>
        </div>
      </div>

      {/* Active program banner */}
      {activeProgram && (
        <div className="bg-[var(--bg-surface)] border border-[var(--border-8)] rounded-2xl px-5 py-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="font-semibold text-sm">{activeProgram.program.name}</p>
              <p className="text-xs text-[var(--fg-40)]">
                Week {activeProgram.current_week} of {activeProgram.program.duration_weeks}
              </p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-[var(--accent-tint)] text-[var(--accent-fg)] border border-[var(--accent-border-sub)] font-semibold">
              {activeProgram.current_week}/{activeProgram.program.duration_weeks}
            </span>
          </div>
          <div className="h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--accent)] rounded-full transition-all"
              style={{ width: `${(activeProgram.current_week / activeProgram.program.duration_weeks) * 100}%` }}
            />
          </div>
          <div className="flex gap-0.5 mt-2">
            {Array.from({ length: activeProgram.program.duration_weeks }, (_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full ${
                  i + 1 < activeProgram!.current_week
                    ? 'bg-[var(--accent)]'
                    : i + 1 === activeProgram!.current_week
                    ? 'bg-[var(--accent)] opacity-50'
                    : 'bg-[var(--border)]'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Check-in form */}
      <CheckInForm
        clientId={user.id}
        habits={habits as { clientHabitId: string; streak: number; habit: { id: string; label: string; icon: string } }[]}
        todayCheckin={todayCheckin ?? null}
        today={today}
      />

      {/* Today's program workout */}
      {todayPlannedWorkout && (
        <TodaysWorkout
          clientId={user.id}
          today={today}
          planned={todayPlannedWorkout}
          existingLog={todayWorkoutLog as Parameters<typeof TodaysWorkout>[0]['existingLog']}
        />
      )}

      {/* Free-form workout logger */}
      <WorkoutLogger clientId={user.id} />
    </div>
  )
}
