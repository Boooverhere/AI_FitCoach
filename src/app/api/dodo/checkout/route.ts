import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { dodo } from '@/lib/dodo'

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const db = createServiceClient()
    const { data: sub } = await db
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
      product_cart: [{ product_id: process.env.DODO_PRODUCT_ID!, quantity: 1 }],
      customer,
      metadata: { supabase_user_id: user.id },
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
