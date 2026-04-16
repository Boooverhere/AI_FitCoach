import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'
import { NextResponse } from 'next/server'
import { buildCoachSystemPrompt } from '@/lib/coachSystemPrompt'
import type { CoachSettings, ParsedCredential } from '@/lib/coachSystemPrompt'

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

  // Fetch today's check-ins
  const { data: checkins } = await supabase
    .from('checkins')
    .select('client_id, completed_habits, note')
    .in('client_id', clientIds)
    .eq('date', today)

  // Fetch assigned habits for all clients
  const { data: clientHabits } = await supabase
    .from('client_habits')
    .select('client_id, habit_id, streak, habit:habits(label, icon)')
    .in('client_id', clientIds)

  // Build a structured summary per client for the prompt
  const clientSummaries = clients.map((client) => {
    const checkin = checkins?.find((ci) => ci.client_id === client.id)
    const habits = (clientHabits ?? []).filter((ch) => ch.client_id === client.id)
    const totalHabits = habits.length
    const completedHabits = habits.filter((h) =>
      checkin?.completed_habits?.includes(h.habit_id)
    )
    const missedHabits = habits.filter(
      (h) => !checkin?.completed_habits?.includes(h.habit_id)
    )

    return {
      name: client.full_name,
      checkedIn: !!checkin,
      totalHabits,
      completedCount: completedHabits.length,
      completed: completedHabits.map((h) => {
        const habit = h.habit as unknown as { label: string; icon: string } | null
        return `${habit?.icon ?? ''} ${habit?.label ?? h.habit_id} (streak: ${h.streak}d)`
      }),
      missed: missedHabits.map((h) => {
        const habit = h.habit as unknown as { label: string; icon: string } | null
        return `${habit?.icon ?? ''} ${habit?.label ?? h.habit_id}`
      }),
      note: checkin?.note || null,
    }
  })

  const checkedInCount = clientSummaries.filter((c) => c.checkedIn).length
  const dateLabel = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const prompt = `${coachSystemPrompt}

Today you are reviewing the daily team performance for ${coach.full_name}.

Today is ${dateLabel}.

TEAM CHECK-IN DATA:
- Total clients: ${clients.length}
- Checked in today: ${checkedInCount}/${clients.length}

INDIVIDUAL CLIENT BREAKDOWN:
${clientSummaries
  .map((c) => {
    if (!c.checkedIn) {
      return `• ${c.name}: ❌ Did NOT check in today (${c.totalHabits} habits assigned)`
    }
    return `• ${c.name}: ✅ Checked in
  - Completed (${c.completedCount}/${c.totalHabits}): ${c.completed.join(', ') || 'none'}
  - Missed: ${c.missed.join(', ') || 'none'}
  - Note: ${c.note ? `"${c.note}"` : '(no note)'}`
  })
  .join('\n\n')}

Please provide a concise AI digest with exactly these four sections using markdown:

## 🏆 Team Performance Summary
A 2-3 sentence overview of how the team performed today overall.

## ⚠️ Needs Attention
List any clients who missed 2 or more habits, or didn't check in at all. If everyone is on track, say so.

## ⭐ Standout Performers
Highlight clients who completed all their habits or showed impressive streaks. Be specific and motivating.

## 💡 Patterns & Insights
Surface any recurring themes from the daily notes, habit trends, or anything a coach should know. Keep it brief and actionable.`

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
