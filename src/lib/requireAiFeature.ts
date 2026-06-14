import { NextResponse } from 'next/server'
import { PLANS } from '@/lib/plans'
import type { SupabaseClient } from '@supabase/supabase-js'

export async function requireAiFeature(
  supabase: SupabaseClient,
  userId: string,
  feature: string
): Promise<NextResponse | null> {
  const { data: sub } = await supabase
    .from('coach_subscriptions')
    .select('subscription_status, plan_id')
    .eq('coach_id', userId)
    .single()

  if (!sub || sub.subscription_status !== 'active') {
    return NextResponse.json(
      { error: 'An active subscription is required to use this AI feature.' },
      { status: 403 }
    )
  }

  const plan = PLANS.find((p) => p.id === sub.plan_id)
  if (!plan || !(plan.aiFeatures as readonly string[]).includes(feature)) {
    return NextResponse.json(
      { error: `Your current plan does not include ${feature}. Upgrade to access this feature.` },
      { status: 403 }
    )
  }

  return null
}
