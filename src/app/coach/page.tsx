import { createClient } from '@/lib/supabase/server'
import { ClientsTable } from './ClientsTable'
import { StatsBar } from './StatsBar'
import { InviteCodeBanner } from './InviteCodeBanner'
import { DigestButton } from './DigestButton'

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

  // Build client rows
  const clientRows = (clients ?? []).map((c) => {
    const checkedInToday = todayCheckins?.some((ci) => ci.client_id === c.id) ?? false

    // Average streak across habits
    const habitsForClient = clientHabits?.filter((ch) => ch.client_id === c.id) ?? []
    const streak =
      habitsForClient.length
        ? Math.round(habitsForClient.reduce((a, h) => a + h.streak, 0) / habitsForClient.length)
        : 0

    // Completion rate: days checked in / 30 days
    const checkinsForClient = recentCheckins?.filter((ci) => ci.client_id === c.id) ?? []
    const completionRate = Math.round((checkinsForClient.length / 30) * 100)

    return {
      id: c.id,
      full_name: c.full_name,
      checkedInToday,
      streak,
      completionRate,
    }
  })

  const checkedInCount = clientRows.filter((c) => c.checkedInToday).length

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
        <DigestButton />
      </div>

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
