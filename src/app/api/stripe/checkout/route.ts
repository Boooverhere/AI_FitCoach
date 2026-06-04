import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { stripe } from '@/lib/stripe'

export const dynamic = 'force-dynamic'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const serviceSupabase = createServiceClient()
  const { data: sub } = await serviceSupabase
    .from('coach_subscriptions')
    .select('stripe_customer_id, subscription_status')
    .eq('coach_id', user.id)
    .single()

  // Already subscribed → send to billing portal instead
  if (sub?.subscription_status === 'active' || sub?.subscription_status === 'trialing') {
    const session = await stripe.billingPortal.sessions.create({
      customer: sub.stripe_customer_id!,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/coach/settings/billing`,
    })
    return NextResponse.json({ url: session.url })
  }

  // Create or reuse Stripe customer
  let customerId = sub?.stripe_customer_id ?? null
  if (!customerId) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single()

    const customer = await stripe.customers.create({
      email: user.email!,
      name: profile?.full_name ?? undefined,
      metadata: { supabase_user_id: user.id },
    })
    customerId = customer.id

    await serviceSupabase.from('coach_subscriptions').upsert({
      coach_id: user.id,
      stripe_customer_id: customerId,
      subscription_status: 'none',
    })
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    mode: 'subscription',
    line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
    subscription_data: {
      trial_period_days: 14,
      metadata: { supabase_user_id: user.id },
    },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/coach?checkout=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/coach/settings/billing`,
    metadata: { supabase_user_id: user.id },
  })

  return NextResponse.json({ url: session.url })
}
