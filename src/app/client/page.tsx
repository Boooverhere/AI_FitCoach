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

  // Best streak across habits
  const maxStreak = Math.max(0, ...(clientHabits?.map((ch) => ch.streak) ?? [0]))

  type HabitRef = { id: string; label: string; icon: string }
  const habits = (clientHabits ?? [])
    .map((ch) => ({
      clientHabitId: ch.id,
      streak: ch.streak,
      habit: (ch.habit as unknown as HabitRef | null),
    }))
    .filter((ch): ch is { clientHabitId: string; streak: number; habit: HabitRef } =>
      ch.habit !== null
    )

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
