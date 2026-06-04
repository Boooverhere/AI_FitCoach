import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { dodo } from '@/lib/dodo'

export const dynamic = 'force-dynamic'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = createServiceClient()
  const { data: sub } = await db
    .from('coach_subscriptions')
    .select('dodo_subscription_id, subscription_status')
    .eq('coach_id', user.id)
    .single()

  if (!sub?.dodo_subscription_id) {
    return NextResponse.json({ error: 'No active subscription found' }, { status: 404 })
  }

  if (sub.subscription_status === 'cancelled') {
    return NextResponse.json({ error: 'Already cancelled' }, { status: 400 })
  }

  await dodo.subscriptions.update(sub.dodo_subscription_id, {
    cancel_at_next_billing_date: true,
  })

  return NextResponse.json({ cancelled: true })
}
