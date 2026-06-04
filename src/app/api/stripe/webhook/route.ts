import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase/service'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')
  if (!sig) return NextResponse.json({ error: 'No signature' }, { status: 400 })

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const db = createServiceClient()

  async function coachIdByCustomer(customerId: string, metaId?: string | null) {
    if (metaId) return metaId
    const { data } = await db
      .from('coach_subscriptions')
      .select('coach_id')
      .eq('stripe_customer_id', customerId)
      .single()
    return data?.coach_id ?? null
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      if (session.mode !== 'subscription') break
      const coachId = session.metadata?.supabase_user_id
      if (!coachId) break
      await db.from('coach_subscriptions').upsert({
        coach_id: coachId,
        stripe_customer_id: session.customer as string,
        stripe_subscription_id: session.subscription as string,
        subscription_status: 'trialing',
        updated_at: new Date().toISOString(),
      })
      break
    }

    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      const coachId = await coachIdByCustomer(sub.customer as string, sub.metadata?.supabase_user_id)
      if (!coachId) break
      await db.from('coach_subscriptions').upsert({
        coach_id: coachId,
        stripe_customer_id: sub.customer as string,
        stripe_subscription_id: sub.id,
        subscription_status: sub.status,
        trial_ends_at: sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null,
        subscription_period_end: new Date(sub.current_period_end * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      })
      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      const coachId = await coachIdByCustomer(sub.customer as string, sub.metadata?.supabase_user_id)
      if (!coachId) break
      await db.from('coach_subscriptions').upsert({
        coach_id: coachId,
        stripe_customer_id: sub.customer as string,
        stripe_subscription_id: null,
        subscription_status: 'canceled',
        updated_at: new Date().toISOString(),
      })
      break
    }
  }

  return NextResponse.json({ received: true })
}
