import { NextRequest, NextResponse } from 'next/server'
import { dodo } from '@/lib/dodo'
import { createServiceClient } from '@/lib/supabase/service'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const headers = Object.fromEntries(req.headers.entries())

  let event
  try {
    event = dodo.webhooks.unwrap(body, {
      headers,
      key: process.env.DODO_WEBHOOK_SECRET!,
    })
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const db = createServiceClient()

  async function coachIdBySubscriptionId(subscriptionId: string): Promise<string | null> {
    const { data } = await db
      .from('coach_subscriptions')
      .select('coach_id')
      .eq('dodo_subscription_id', subscriptionId)
      .single()
    return data?.coach_id ?? null
  }

  switch (event.type) {
    case 'subscription.active':
    case 'subscription.renewed':
    case 'subscription.updated': {
      const sub = event.data
      const coachId = sub.metadata?.supabase_user_id
        ?? await coachIdBySubscriptionId(sub.subscription_id)
      if (!coachId) break

      await db.from('coach_subscriptions').upsert({
        coach_id: coachId,
        dodo_subscription_id: sub.subscription_id,
        dodo_customer_id: sub.customer.customer_id,
        subscription_status: sub.status,
        subscription_period_end: sub.next_billing_date,
        trial_ends_at: null,
        updated_at: new Date().toISOString(),
      })
      break
    }

    case 'subscription.on_hold': {
      const sub = event.data
      const coachId = sub.metadata?.supabase_user_id
        ?? await coachIdBySubscriptionId(sub.subscription_id)
      if (!coachId) break

      await db.from('coach_subscriptions').upsert({
        coach_id: coachId,
        dodo_subscription_id: sub.subscription_id,
        dodo_customer_id: sub.customer.customer_id,
        subscription_status: 'on_hold',
        updated_at: new Date().toISOString(),
      })
      break
    }

    case 'subscription.cancelled':
    case 'subscription.expired':
    case 'subscription.failed': {
      const sub = event.data
      const coachId = sub.metadata?.supabase_user_id
        ?? await coachIdBySubscriptionId(sub.subscription_id)
      if (!coachId) break

      await db.from('coach_subscriptions').upsert({
        coach_id: coachId,
        dodo_subscription_id: sub.subscription_id,
        subscription_status: sub.status,
        updated_at: new Date().toISOString(),
      })
      break
    }

    case 'payment.succeeded':
      // subscription.active / subscription.renewed cover the Supabase update;
      // payment.succeeded is a no-op here unless you need payment-level logging.
      break
  }

  return NextResponse.json({ received: true })
}
