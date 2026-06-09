import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { dodo } from '@/lib/dodo'
import { getProductEnvKey, type PlanId, type BillingPeriod } from '@/lib/plans'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const planId = body.planId as PlanId | undefined
    const period = body.period as BillingPeriod | undefined

    if (!planId || !period) {
      return NextResponse.json({ error: 'planId and period are required' }, { status: 400 })
    }

    const envKey = getProductEnvKey(planId, period)
    const productId = process.env[envKey]

    if (!productId) {
      return NextResponse.json(
        { error: `Product not configured for ${planId}/${period}. Set ${envKey} in your environment.` },
        { status: 500 }
      )
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: sub } = await supabase
      .from('coach_subscriptions')
      .select('dodo_customer_id, subscription_status')
      .eq('coach_id', user.id)
      .single()

    if (sub?.subscription_status === 'active') {
      return NextResponse.json({ error: 'Already subscribed' }, { status: 400 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single()

    const customer = sub?.dodo_customer_id
      ? { customer_id: sub.dodo_customer_id }
      : { email: user.email!, name: profile?.full_name || undefined }

    const session = await dodo.checkoutSessions.create({
      product_cart: [{ product_id: productId, quantity: 1 }],
      customer,
      metadata: { supabase_user_id: user.id, plan_id: planId, billing_period: period },
      subscription_data: { trial_period_days: 14 },
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/coach?checkout=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/coach/settings/billing`,
    })

    if (!session.checkout_url) {
      return NextResponse.json({ error: 'No checkout URL returned by Dodo' }, { status: 500 })
    }

    return NextResponse.json({ url: session.checkout_url })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[dodo/checkout]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
