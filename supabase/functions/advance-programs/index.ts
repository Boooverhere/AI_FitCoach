// Supabase Edge Function: advance-programs
// Runs daily to advance current_week for active client programs
// Deploy: supabase functions deploy advance-programs
// Schedule via Supabase Dashboard → Edge Functions → Schedules: "0 0 * * *" (midnight UTC)

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req: Request) => {
  // Verify this is a scheduled invocation (basic auth check)
  const authHeader = req.headers.get('Authorization')
  if (authHeader !== `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const today = new Date().toISOString().slice(0, 10)

  // Fetch all active programs
  const { data: activeAssignments, error } = await supabase
    .from('client_programs')
    .select('id, client_id, program_id, start_date, current_week, programs(duration_weeks)')
    .eq('status', 'active')

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }

  const updates: { id: string; current_week?: number; status?: string }[] = []
  const completedClientIds: string[] = []

  for (const assignment of activeAssignments ?? []) {
    type Assignment = {
      id: string; client_id: string; program_id: string
      start_date: string; current_week: number
      programs: { duration_weeks: number }
    }
    const a = assignment as unknown as Assignment

    const daysSinceStart = Math.floor(
      (new Date(today).getTime() - new Date(a.start_date).getTime()) / (1000 * 60 * 60 * 24)
    )
    const expectedWeek = Math.floor(daysSinceStart / 7) + 1
    const cappedWeek = Math.min(expectedWeek, a.programs.duration_weeks)

    if (cappedWeek !== a.current_week) {
      const isComplete = expectedWeek > a.programs.duration_weeks
      updates.push({
        id: a.id,
        current_week: isComplete ? a.programs.duration_weeks : cappedWeek,
        status: isComplete ? 'completed' : 'active',
      })
      if (isComplete) completedClientIds.push(a.client_id)
    }
  }

  // Apply updates
  let updatedCount = 0
  for (const u of updates) {
    const { error: updateErr } = await supabase
      .from('client_programs')
      .update({ current_week: u.current_week, ...(u.status ? { status: u.status } : {}) })
      .eq('id', u.id)

    if (!updateErr) updatedCount++
  }

  // Send completion notifications to coaches
  for (const clientId of completedClientIds) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, coach_id')
      .eq('id', clientId)
      .single()

    if (profile?.coach_id) {
      await supabase.from('notifications').insert({
        user_id: profile.coach_id,
        type: 'program_completed',
        message: `${profile.full_name} has completed their program! 🎉`,
        read: false,
      })
    }
  }

  return new Response(
    JSON.stringify({
      processed: activeAssignments?.length ?? 0,
      updated: updatedCount,
      completed: completedClientIds.length,
    }),
    { headers: { 'Content-Type': 'application/json' } }
  )
})
