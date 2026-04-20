import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'
import { NextResponse } from 'next/server'
import { buildCoachSystemPrompt } from '@/lib/coachSystemPrompt'
import type { CoachSettings, ParsedCredential } from '@/lib/coachSystemPrompt'

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Verify this user is a coach
  const { data: coach } = await supabase
    .from('profiles')
    .select('id, full_name, role')
    .eq('id', user.id)
    .single()

  if (!coach || coach.role !== 'coach') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const today = new Date().toISOString().slice(0, 10)

  // Fetch all clients
  const { data: clients } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('coach_id', user.id)

  if (!clients?.length) {
    return NextResponse.json({ error: 'No clients found' }, { status: 400 })
  }

  // Load coach AI settings
  const { data: aiSettingsRow } = await supabase
    .from('coach_ai_settings')
    .select('settings, credentials')
    .eq('coach_id', user.id)
    .single()

  const coachSettings = (aiSettingsRow?.settings as CoachSettings) ?? null
  const coachCredentials = (aiSettingsRow?.credentials as ParsedCredential[]) ?? []
  const coachSystemPrompt = buildCoachSystemPrompt(coach.full_name, coachSettings, coachCredentials)

  const clientIds = clients.map((c) => c.id)
  const jsDay = new Date(today + 'T00:00:00').getDay()
  const dayOfWeek = jsDay === 0 ? 6 : jsDay - 1 // Mon=0 … Sun=6

  // Fetch today's check-ins
  const { data: checkins } = await supabase
    .from('checkins')
    .select('client_id, completed_habits, note')
    .in('client_id', clientIds)
    .eq('date', today)

  // Fetch active programs for all clients
  const { data: clientPrograms } = await supabase
    .from('client_programs')
    .select('client_id, program_id, current_week, status')
    .in('client_id', clientIds)
    .eq('status', 'active')

  // Fetch today's scheduled workouts across all active programs
  const programIds = [...new Set((clientPrograms ?? []).map((cp) => cp.program_id))]
  const { data: scheduledWorkouts } = programIds.length ? await supabase
    .from('program_workouts')
    .select('program_id, week_number, day_of_week, workout_type')
    .in('program_id', programIds)
    .eq('day_of_week', dayOfWeek) : { data: [] }

  // Fetch recent workout logs (last 7 days) for streak/volume context
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  const { data: recentLogs } = await supabase
    .from('workout_logs')
    .select('client_id, date, completed')
    .in('client_id', clientIds)
    .gte('date', sevenDaysAgo)

  // Build per-client summaries
  const clientSummaries = clients.map((client) => {
    const checkin = checkins?.find((ci) => ci.client_id === client.id)
    const cp = clientPrograms?.find((p) => p.client_id === client.id)
    const todayWorkout = cp
      ? scheduledWorkouts?.find(
          (w) => w.program_id === cp.program_id && w.week_number === cp.current_week
        )
      : null
    const habits = (checkin?.completed_habits as string[] | undefined) ?? []
    const workoutCompleted = habits.includes('workout_done')
    const rpeEntry = habits.find((h: string) => h.startsWith('rpe:'))
    const rpe = rpeEntry ? parseInt(rpeEntry.split(':')[1]) : null
    const weekLogs = (recentLogs ?? []).filter((l) => l.client_id === client.id)

    return {
      name: client.full_name,
      checkedIn: !!checkin,
      hasProgram: !!cp,
      programWeek: cp?.current_week ?? null,
      todayWorkoutType: todayWorkout?.workout_type ?? (cp ? 'Rest' : null),
      isRestDay: !todayWorkout || todayWorkout.workout_type === 'Rest',
      workoutCompleted,
      rpe,
      weekWorkoutCount: weekLogs.filter((l) => l.completed).length,
      note: checkin?.note || null,
    }
  })

  const checkedInCount = clientSummaries.filter((c) => c.checkedIn).length
  const completedWorkoutCount = clientSummaries.filter((c) => c.workoutCompleted).length
  const dateLabel = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  const prompt = `${coachSystemPrompt}

Today you are reviewing the daily training performance for ${coach.full_name}'s team.

Today is ${dateLabel}.

TEAM OVERVIEW:
- Total clients: ${clients.length}
- Checked in today: ${checkedInCount}/${clients.length}
- Workouts completed today: ${completedWorkoutCount}/${clientSummaries.filter(c => !c.isRestDay && c.hasProgram).length} (scheduled sessions)

INDIVIDUAL CLIENT BREAKDOWN:
${clientSummaries
  .map((c) => {
    if (!c.hasProgram) {
      return `• ${c.name}: No active program assigned`
    }
    if (c.isRestDay) {
      return `• ${c.name}: 🛌 Rest day scheduled — ${c.checkedIn ? `checked in${c.note ? `, note: "${c.note}"` : ''}` : 'did not check in'}`
    }
    if (!c.checkedIn) {
      return `• ${c.name}: ❌ No check-in — ${c.todayWorkoutType} session scheduled (Week ${c.programWeek})`
    }
    return `• ${c.name}: ${c.workoutCompleted ? '✅' : '⚠️'} ${c.todayWorkoutType} session (Week ${c.programWeek})
  - Workout: ${c.workoutCompleted ? 'COMPLETED' : 'NOT marked complete'}${c.rpe != null ? ` · RPE ${c.rpe}/10` : ''}
  - Last 7 days: ${c.weekWorkoutCount} sessions logged${c.note ? `\n  - Note: "${c.note}"` : ''}`
  })
  .join('\n\n')}

Please provide a concise AI digest with exactly these four sections using markdown:

## 🏆 Team Performance Summary
A 2-3 sentence overview of today's training across the team.

## ⚠️ Needs Attention
List clients who missed their scheduled session or didn't check in. If everyone is on track, say so.

## ⭐ Standout Performers
Highlight clients who completed tough sessions, hit high RPE, or have been consistent this week. Be specific.

## 💡 Patterns & Insights
Surface anything useful from the notes, RPE trends, or session completion patterns. Keep it brief and actionable.`

  // Stream the response back using ReadableStream
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'OPENAI_API_KEY is not set' }, { status: 500 })
  }

  const openai = new OpenAI({ apiKey })
  const stream = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    max_tokens: 1024,
    stream: true,
    messages: [{ role: 'user', content: prompt }],
  })

  const readableStream = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content
        if (text) {
          controller.enqueue(new TextEncoder().encode(text))
        }
      }
      controller.close()
    },
  })

  return new Response(readableStream, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
