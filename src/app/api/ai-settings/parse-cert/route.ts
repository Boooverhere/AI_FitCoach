import { createClient } from '@/lib/supabase/server'
import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    if (!profile || profile.role !== 'coach') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { base64, mediaType, fileName } = body as {
      base64: string
      mediaType: string
      fileName: string
    }

    if (!base64 || !mediaType) {
      return NextResponse.json({ error: 'Missing file data' }, { status: 400 })
    }
    const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!ALLOWED_TYPES.includes(mediaType)) {
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 })
    }
    // ~10 MB limit in base64 (~7.5 MB raw)
    if (base64.length > 10_000_000) {
      return NextResponse.json({ error: 'File too large (max 10 MB)' }, { status: 400 })
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'ANTHROPIC_API_KEY not set' }, { status: 500 })
    }

    const client = new Anthropic({ apiKey })

    const isPdf = mediaType === 'application/pdf'

    // Build the content block depending on file type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fileBlock: any = isPdf
      ? {
          type: 'document',
          source: { type: 'base64', media_type: 'application/pdf', data: base64 },
        }
      : {
          type: 'image',
          source: { type: 'base64', media_type: mediaType, data: base64 },
        }

    const response = await client.beta.messages.create(
      {
        model: 'claude-opus-4-6',
        max_tokens: 512,
        messages: [
          {
            role: 'user',
            content: [
              fileBlock,
              {
                type: 'text',
                text: `Extract the following information from this fitness/wellness certification document and return ONLY a JSON object with these exact keys (use null for missing fields):
{
  "certName": "full certification name",
  "issuingBody": "issuing organization name",
  "focus": "specialization or focus area (1-2 sentences)",
  "expiry": "expiry date as string or null"
}

Return only the JSON, no extra text.`,
              },
            ],
          },
        ],
        thinking: { type: 'adaptive' },
      },
      { headers: { 'anthropic-beta': 'pdfs-2024-09-25,interleaved-thinking-2025-05-14' } }
    )

    // Find the text block
    const textBlock = response.content.find((b) => b.type === 'text')
    if (!textBlock || textBlock.type !== 'text') {
      return NextResponse.json({ error: 'No text response from AI' }, { status: 500 })
    }

    let parsed: { certName: string; issuingBody: string; focus: string; expiry: string | null }
    try {
      const raw = textBlock.text.trim()
      // Strip markdown code fences if present
      const jsonStr = raw.startsWith('```') ? raw.replace(/^```[a-z]*\n?/, '').replace(/\n?```$/, '') : raw
      parsed = JSON.parse(jsonStr)
    } catch {
      return NextResponse.json({ error: 'Failed to parse AI response as JSON' }, { status: 500 })
    }

    return NextResponse.json({ ...parsed, fileName })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
