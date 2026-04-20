import { createClient } from '@/lib/supabase/server'

interface RateLimitResult {
  allowed: boolean
  retryAfterSeconds?: number
}

/**
 * Simple per-coach rate limiter stored in coach_ai_settings.
 * Uses a JSON field to track last call timestamps per route.
 * No external infrastructure needed.
 */
export async function checkRateLimit(
  coachId: string,
  route: string,
  windowSeconds: number
): Promise<RateLimitResult> {
  try {
    const supabase = await createClient()

    const { data } = await supabase
      .from('coach_ai_settings')
      .select('rate_limits')
      .eq('coach_id', coachId)
      .maybeSingle()

    const limits = (data?.rate_limits as Record<string, number> | null) ?? {}
    const lastCall = limits[route] ?? 0
    const now = Date.now()
    const elapsed = (now - lastCall) / 1000

    if (elapsed < windowSeconds) {
      return {
        allowed: false,
        retryAfterSeconds: Math.ceil(windowSeconds - elapsed),
      }
    }

    // Update the timestamp — fire and forget, don't block the request
    const updated = { ...limits, [route]: now }
    supabase
      .from('coach_ai_settings')
      .upsert({ coach_id: coachId, rate_limits: updated }, { onConflict: 'coach_id' })
      .then(() => {})

    return { allowed: true }
  } catch {
    // If rate limit check fails, allow the request rather than blocking users
    return { allowed: true }
  }
}
