import { createClient } from '@/lib/supabase/server'
import { ClientsTable } from './ClientsTable'
import { StatsBar } from './StatsBar'
import { InviteCodeBanner } from './InviteCodeBanner'
import { DigestButton } from './DigestButton'
import { AddClientModal } from './AddClientModal'
import { OnboardingBanner } from './OnboardingBanner'

export default async function CoachDashboard() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Get coach profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, invite_code')
    .eq('id', user.id)
    .single()

  // Get all clients
  const { data: clients } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('coach_id', user.id)

  const clientIds = clients?.map((c) => c.id) ?? []

  // Get today's checkins
  const today = new Date().toISOString().slice(0, 10)
  const { data: todayCheckins } = await supabase
    .from('checkins')
    .select('client_id, completed_habits')
    .in('client_id', clientIds.length ? clientIds : ['none'])
    .eq('date', today)

  // Get all checkins (last 30 days) for completion rate
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10)
  const { data: recentCheckins } = await supabase
    .from('checkins')
    .select('client_id, date, completed_habits')
    .in('client_id', clientIds.length ? clientIds : ['none'])
    .gte('date', thirtyDaysAgo)

  // Get habits with streaks
  const { data: clientHabits } = await supabase
    .from('client_habits')
    .select('client_id, streak')
    .in('client_id', clientIds.length ? clientIds : ['none'])

  // Active programs for all clients
  let clientProgramMap: Record<string, { name: string; current_week: number; duration_weeks: number }> = {}
  if (clientIds.length) {
    try {
      const { data: cpRows } = await supabase
        .from('client_programs')
        .select('client_id, current_week, status, program:programs(name, duration_weeks)')
        .in('client_id', clientIds)
        .eq('status', 'active')

      for (const row of cpRows ?? []) {
        type PRow = { client_id: string; current_week: number; program: { name: string; duration_weeks: number } }
        const r = row as unknown as PRow
        clientProgramMap[r.client_id] = {
          name: r.program.name,
          current_week: r.current_week,
          duration_weeks: r.program.duration_weeks,
        }
      }
    } catch { /* programs table not yet created */ }
  }

  // Build client rows
  const clientRows = (clients ?? []).map((c) => {
    const checkedInToday = todayCheckins?.some((ci) => ci.client_id === c.id) ?? false

    const habitsForClient = clientHabits?.filter((ch) => ch.client_id === c.id) ?? []
    const streak =
      habitsForClient.length
        ? Math.round(habitsForClient.reduce((a, h) => a + h.streak, 0) / habitsForClient.length)
        : 0

    const checkinsForClient = recentCheckins?.filter((ci) => ci.client_id === c.id) ?? []
    const completionRate = Math.round((checkinsForClient.length / 30) * 100)

    return {
      id: c.id,
      full_name: c.full_name,
      checkedInToday,
      streak,
      completionRate,
      program: clientProgramMap[c.id] ?? null,
    }
  })

  const checkedInCount = clientRows.filter((c) => c.checkedInToday).length

  // ── Onboarding checklist data ────────────────────────
  const { data: aiSettings } = await supabase
    .from('coach_ai_settings')
    .select('id')
    .eq('coach_id', user.id)
    .maybeSingle()

  const { data: habits } = await supabase
    .from('habits')
    .select('id')
    .eq('coach_id', user.id)
    .limit(1)

  const hasAiSettings = !!aiSettings
  const hasClients = clientRows.length > 0
  const hasHabits = (habits?.length ?? 0) > 0

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">
            Good {getGreeting()},{' '}
            <span className="text-[var(--accent-fg)]">{profile?.full_name?.split(' ')[0]}</span>
          </h1>
          <p className="text-[var(--fg-40)] text-sm mt-0.5">
            {checkedInCount} of {clientRows.length} clients checked in today
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <DigestButton />
          {profile?.invite_code && (
            <AddClientModal inviteCode={profile.invite_code} />
          )}
        </div>
      </div>

      {/* Onboarding checklist */}
      <OnboardingBanner
        hasAiSettings={hasAiSettings}
        hasClients={hasClients}
        hasHabits={hasHabits}
      />

      {/* Invite code banner */}
      {profile?.invite_code && (
        <InviteCodeBanner code={profile.invite_code} />
      )}

      {/* Stats */}
      <StatsBar
        totalClients={clientRows.length}
        checkedInToday={checkedInCount}
        avgCompletion={
          clientRows.length
            ? Math.round(clientRows.reduce((a, c) => a + c.completionRate, 0) / clientRows.length)
            : 0
        }
      />

      {/* Clients table */}
      <ClientsTable clients={clientRows} coachId={user.id} />
    </div>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}
