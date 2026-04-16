import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Flame, CheckCircle2, XCircle, CalendarDays, Heart, AlertTriangle } from 'lucide-react'
import { AssignHabitPanel } from './AssignHabitPanel'

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
        {/* Left: habits + assign */}
        <div className="lg:col-span-1 flex flex-col gap-4">
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

        {/* Right: check-in history */}
        <div className="lg:col-span-2 bg-[var(--bg-surface)] border border-[var(--border-8)] rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[var(--border-8)] flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-[var(--fg-40)]" />
            <h2 className="font-semibold">Check-in history</h2>
            <span className="ml-auto text-sm text-[var(--fg-40)]">Last 30 days</span>
          </div>

          {!checkins?.length ? (
            <div className="p-12 text-center text-[var(--fg-30)] text-sm">
              No check-ins yet.
            </div>
          ) : (
            <div className="divide-y divide-[var(--border-5)] max-h-[600px] overflow-y-auto">
              {checkins.map((ci) => {
                const habitIds: string[] = ci.completed_habits ?? []
                return (
                  <div key={ci.date} className="px-6 py-4 hover:bg-[var(--bg-subtle)] transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">
                            {new Date(ci.date + 'T00:00:00').toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                          {habitIds.length > 0 ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-[var(--accent-fg)]" />
                          ) : (
                            <XCircle className="h-3.5 w-3.5 text-[var(--fg-20)]" />
                          )}
                        </div>
                        {ci.note && (
                          <p className="text-sm text-[var(--fg-50)] italic line-clamp-2">
                            &ldquo;{ci.note}&rdquo;
                          </p>
                        )}
                        {/* Habit completion pills */}
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
                      <span className="text-xs text-[var(--fg-30)] flex-shrink-0">
                        {habitIds.length}/{clientHabits.length}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
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
