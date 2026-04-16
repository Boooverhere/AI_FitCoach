import { createClient } from '@/lib/supabase/server'
import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'
import { buildCoachSystemPrompt } from '@/lib/coachSystemPrompt'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, role')
      .eq('id', user.id)
      .single()
    if (!profile || profile.role !== 'coach') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { settings, credentials } = body

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'ANTHROPIC_API_KEY not set' }, { status: 500 })
    }

    const systemPrompt = buildCoachSystemPrompt(profile.full_name, settings, credentials ?? [])

    const sampleScenario = `Client: Sarah, 34 years old
Primary goal: Fat Loss
Health profile: BMI 28.4, blood pressure 135/88 (borderline high), sedentary activity level
Assigned habits: 30-min walk, drink 8 glasses of water, log meals
This week's check-ins: Completed walks 4/7 days, water habit 6/7, meals logged 2/7
Latest note: "Struggled this week, work has been stressful and I've been skipping the meal logging"

As the coach's AI assistant, provide personalised feedback and guidance for this client.`

    const client = new Anthropic({ apiKey })

    const stream = client.messages.stream({
      model: 'claude-opus-4-6',
      max_tokens: 800,
      system: systemPrompt,
      messages: [{ role: 'user', content: sampleScenario }],
      thinking: { type: 'adaptive' },
    })

    const readableStream = new ReadableStream({
      async start(controller) {
        for await (const event of stream) {
          if (
            event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta'
          ) {
            controller.enqueue(new TextEncoder().encode(event.delta.text))
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
