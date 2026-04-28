import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'
import { NextResponse } from 'next/server'
import { checkRateLimit } from '@/lib/rateLimit'

export interface AdjustedExercise {
  name: string
  sets: number
  reps: string
  weight_guidance: string
  rest_seconds: number
  coaching_note: string
}

export interface AdjustedWorkout {
  dayOfWeek: number
  workoutType: string
  exercises: AdjustedExercise[]
}

export interface AdjustedWeek {
  weekNumber: number
  theme: string
  workouts: AdjustedWorkout[]
}

export interface AdjustedProgram {
  name: string
  durationWeeks: number
  weeks: AdjustedWeek[]
}

export interface AdjustChange {
  description: string
  reason: string
}

export interface AdjustResult {
  original: AdjustedProgram
  adjusted: AdjustedProgram
  changes: AdjustChange[]
  adjustmentSummary: string
}

const programSchema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    durationWeeks: { type: 'number' },
    weeks: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          weekNumber: { type: 'number' },
          theme: { type: 'string', description: 'e.g. Foundation, Progressive Overload, Deload' },
          workouts: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                dayOfWeek: { type: 'number', description: '0=Monday 1=Tuesday 2=Wednesday 3=Thursday 4=Friday 5=Saturday 6=Sunday' },
                workoutType: { type: 'string', enum: ['Rest', 'Strength', 'Cardio', 'HIIT', 'Mobility'] },
                exercises: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      name: { type: 'string' },
                      sets: { type: 'number' },
                      reps: { type: 'string', description: 'e.g. "10" or "8-12"' },
                      weight_guidance: { type: 'string', description: 'e.g. "70% 1RM", "bodyweight", "RPE 7", "20 kg"' },
                      rest_seconds: { type: 'number' },
                      coaching_note: { type: 'string' },
                    },
                    required: ['name', 'sets', 'reps', 'weight_guidance', 'rest_seconds', 'coaching_note'],
                  },
                },
              },
              required: ['dayOfWeek', 'workoutType', 'exercises'],
            },
          },
        },
        required: ['weekNumber', 'theme', 'workouts'],
      },
    },
  },
  required: ['name', 'durationWeeks', 'weeks'],
} as const

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: coach } = await supabase
      .from('profiles')
      .select('full_name, role')
      .eq('id', user.id)
      .single()
    if (!coach || coach.role !== 'coach') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { programText, clientId } = await req.json() as { programText: string; clientId: string }
    if (!programText?.trim() || !clientId) {
      return NextResponse.json({ error: 'Missing programText or clientId' }, { status: 400 })
    }
    if (programText.length > 15_000) {
      return NextResponse.json({ error: 'Program text too long (max 15,000 characters)' }, { status: 400 })
    }

    // Rate limit: 5 AI adjustments per 10 minutes per coach
    const rl = await checkRateLimit(user.id, 'ai-adjust', 120)
    if (!rl.allowed) {
      return NextResponse.json(
        { error: `Please wait ${rl.retryAfterSeconds}s before adjusting another program` },
        { status: 429 }
      )
    }

    // Verify client belongs to this coach
    const { data: client } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', clientId)
      .eq('coach_id', user.id)
      .single()
    if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 })

    // Client health profile
    const { data: healthProfile } = await supabase
      .from('health_profiles')
      .select('data')
      .eq('client_id', clientId)
      .single()
    const hp = healthProfile?.data as Record<string, string> | null

    const clientContext = hp
      ? `CLIENT HEALTH PROFILE — ${client.full_name}:
- Age: ${hp.age || 'not provided'}
- Gender: ${hp.gender || 'not provided'}
- Weight: ${hp.weight ? hp.weight + ' kg' : 'not provided'}
- Height: ${hp.height ? hp.height + ' cm' : 'not provided'}
- Body Fat: ${hp.bodyFat ? hp.bodyFat + '%' : 'not provided'}
- Activity Level: ${hp.activityLevel || 'not provided'}
- Primary Goal: ${hp.primaryGoal?.replace('_', ' ') || 'not provided'}
- Blood Pressure: ${hp.bpSystolic && hp.bpDiastolic ? `${hp.bpSystolic}/${hp.bpDiastolic} mmHg` : 'not provided'}
- Resting Heart Rate: ${hp.heartRate ? hp.heartRate + ' bpm' : 'not provided'}
- Blood Sugar: ${hp.bloodSugar ? hp.bloodSugar + ' mg/dL' : 'not provided'}
- Injuries / Limitations: ${hp.injuries || 'none reported'}
- Medications / Conditions: ${hp.medications || 'none reported'}`
      : `CLIENT: ${client.full_name} — no health profile submitted yet. Structure the program as-is with minimal assumptions.`

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) return NextResponse.json({ error: 'OPENAI_API_KEY not set' }, { status: 500 })

    const openai = new OpenAI({ apiKey })

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 16000,
      tools: [
        {
          type: 'function',
          function: {
            name: 'structure_and_adjust_program',
            description: 'Parse the coach program into structured format and produce a client-adjusted version',
            parameters: {
              type: 'object',
              properties: {
                original: { ...programSchema, description: "Coach's program parsed into structured format, unchanged in intent" },
                adjusted: { ...programSchema, description: "Program adjusted for this specific client's health, goals, and limitations" },
                changes: {
                  type: 'array',
                  description: 'Every specific modification made in the adjusted version',
                  items: {
                    type: 'object',
                    properties: {
                      description: { type: 'string', description: 'What was changed' },
                      reason: { type: 'string', description: 'Why, referencing the client data' },
                    },
                    required: ['description', 'reason'],
                  },
                },
                adjustmentSummary: {
                  type: 'string',
                  description: '1-2 sentence overview of the key adjustments made, or confirmation that the program is appropriate as-is',
                },
              },
              required: ['original', 'adjusted', 'changes', 'adjustmentSummary'],
            },
          },
        },
      ],
      tool_choice: { type: 'function', function: { name: 'structure_and_adjust_program' } },
      messages: [
        {
          role: 'system',
          content: `You are an expert fitness program analyst working for coach ${coach.full_name}.`,
        },
        {
          role: 'user',
          content: `${clientContext}

COACH'S PROGRAM TO ANALYSE:
---
${programText}
---

Instructions:
1. Parse the coach's program faithfully into the "original" structured format — preserve every exercise, set, rep scheme, and day as intended
2. Create the "adjusted" version tailored to this client — prioritise safety (injuries, BP, medications), then align with their goal and activity level
3. List every concrete change you made in "changes" with a specific reason citing the client data
4. If no health profile exists or the client has no restrictions, make minimal adjustments and note that in adjustmentSummary
5. For Rest days, use workoutType "Rest" with an empty exercises array
6. Keep coaching_note brief (max 10 words) — one short cue per exercise`,
        },
      ],
    })

    const choice = response.choices[0]
    if (choice?.finish_reason === 'length') {
      return NextResponse.json(
        { error: 'Program is too long to process. Try splitting it into fewer weeks or removing some exercises.' },
        { status: 422 }
      )
    }

    const toolCall = choice?.message?.tool_calls?.[0]
    if (!toolCall || toolCall.type !== 'function') {
      return NextResponse.json({ error: 'AI did not return a structured program' }, { status: 500 })
    }

    let result: AdjustResult
    try {
      result = JSON.parse(toolCall.function.arguments) as AdjustResult
    } catch {
      return NextResponse.json(
        { error: 'AI returned malformed JSON — program may be too large. Try a shorter program.' },
        { status: 500 }
      )
    }
    if (!result.original || !result.adjusted) {
      return NextResponse.json({ error: 'AI returned incomplete program structure' }, { status: 500 })
    }
    result.original.weeks = result.original.weeks ?? []
    result.adjusted.weeks = result.adjusted.weeks ?? []
    result.changes = result.changes ?? []
    return NextResponse.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
