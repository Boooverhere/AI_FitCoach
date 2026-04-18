import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CheckInForm } from './CheckInForm'
import { WorkoutLogger } from './WorkoutLogger'
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

  // Active program
  type ActiveProgram = {
    id: string; current_week: number; status: string; start_date: string
    program: { name: string; duration_weeks: number }
    weekHabitIds: string[]
  }
  let activeProgram: ActiveProgram | null = null
  try {
    const { data: cp } = await supabase
      .from('client_programs')
      .select('id, program_id, current_week, status, start_date, program:programs(name, duration_weeks)')
      .eq('client_id', user.id)
      .eq('status', 'active')
      .single()

    if (cp) {
      type RawCP = {
        id: string; program_id: string; current_week: number
        status: string; start_date: string
        program: { name: string; duration_weeks: number }
      }
      const raw = cp as unknown as RawCP

      // Advance week if needed (time-based)
      const daysSinceStart = Math.floor(
        (Date.now() - new Date(raw.start_date).getTime()) / (1000 * 60 * 60 * 24)
      )
      const expectedWeek = Math.min(
        Math.floor(daysSinceStart / 7) + 1,
        raw.program.duration_weeks
      )
      if (expectedWeek !== raw.current_week) {
        await supabase
          .from('client_programs')
          .update({ current_week: expectedWeek })
          .eq('id', raw.id)
        raw.current_week = expectedWeek
      }

      // Get current week's habit_ids
      const { data: weekRow } = await supabase
        .from('program_weeks')
        .select('habit_ids')
        .eq('program_id', raw.program_id)
        .eq('week_number', raw.current_week)
        .single()

      activeProgram = {
        id: raw.id,
        current_week: raw.current_week,
        status: raw.status,
        start_date: raw.start_date,
        program: raw.program,
        weekHabitIds: (weekRow?.habit_ids as string[]) ?? [],
      }
    }
  } catch { /* no active program */ }

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

      {/* Workout logger */}
      <WorkoutLogger clientId={user.id} />
    </div>
  )
}
