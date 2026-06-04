import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { redirect } from 'next/navigation'
import { CreditCard, CheckCircle2, AlertTriangle, XCircle, Clock } from 'lucide-react'
import { BillingActions } from './BillingActions'

export default async function BillingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/onboarding')
  if (profile.role !== 'coach') redirect('/client')

  const { data: sub } = await createServiceClient()
    .from('coach_subscriptions')
    .select('subscription_status, subscription_period_end')
    .eq('coach_id', user.id)
    .single()

  const status = sub?.subscription_status ?? 'none'
  const periodEnd = sub?.subscription_period_end ? new Date(sub.subscription_period_end) : null

  return (
    <div className="flex flex-col gap-6 max-w-xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="h-9 w-9 rounded-xl bg-[var(--accent-tint)] flex items-center justify-center">
            <CreditCard className="h-5 w-5 text-[var(--accent-fg)]" />
          </div>
          <h1 className="text-2xl font-bold">Billing</h1>
        </div>
        <p className="text-[var(--fg-40)] text-sm ml-12">
          Manage your Coacheckin subscription.
        </p>
      </div>

      <div className="rounded-2xl border border-[var(--border-8)] bg-[var(--bg-surface)] p-6 flex flex-col gap-5">
        <StatusInfo status={status} periodEnd={periodEnd} />
        <BillingActions status={status} />
      </div>

      <div className="rounded-2xl border border-[var(--border-8)] bg-[var(--bg-surface)] p-6">
        <h2 className="font-semibold mb-4">Plan includes</h2>
        <ul className="flex flex-col gap-2.5">
          {[
            'Unlimited clients',
            'Program & workout builder',
            'Daily check-ins & habit tracking',
            'Direct messaging with clients',
            'Progress photos & charts',
            'AI daily digest & coaching identity',
            'Team dashboard & insights',
          ].map((feature) => (
            <li key={feature} className="flex items-center gap-2 text-sm text-[var(--fg-50)]">
              <CheckCircle2 className="h-4 w-4 text-[var(--accent-fg)] shrink-0" />
              {feature}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-[var(--fg-30)]">$19 / month · Cancel anytime</p>
      </div>
    </div>
  )
}

function StatusInfo({ status, periodEnd }: {
  status: string
  periodEnd: Date | null
}) {
  const fmt = (d: Date) => d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  if (status === 'active') {
    return (
      <div className="flex items-start gap-3">
        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
        <div>
          <p className="font-semibold text-sm">Active subscription</p>
          {periodEnd && (
            <p className="text-xs text-[var(--fg-40)] mt-0.5">Next billing date: {fmt(periodEnd)}</p>
          )}
        </div>
      </div>
    )
  }

  if (status === 'pending') {
    return (
      <div className="flex items-start gap-3">
        <Clock className="h-5 w-5 text-teal-500 mt-0.5 shrink-0" />
        <div>
          <p className="font-semibold text-sm">Trial active</p>
          {periodEnd && (
            <p className="text-xs text-[var(--fg-40)] mt-0.5">
              First billing on {fmt(periodEnd)} — $19/month.
            </p>
          )}
        </div>
      </div>
    )
  }

  if (status === 'on_hold') {
    return (
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
        <div>
          <p className="font-semibold text-sm">Payment failed</p>
          <p className="text-xs text-[var(--fg-40)] mt-0.5">
            Your last payment failed. Please resubscribe to continue.
          </p>
        </div>
      </div>
    )
  }

  if (status === 'cancelled') {
    return (
      <div className="flex items-start gap-3">
        <XCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
        <div>
          <p className="font-semibold text-sm">Subscription cancelled</p>
          <p className="text-xs text-[var(--fg-40)] mt-0.5">
            Your subscription has ended. Resubscribe to regain access.
          </p>
        </div>
      </div>
    )
  }

  if (status === 'expired' || status === 'failed') {
    return (
      <div className="flex items-start gap-3">
        <XCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
        <div>
          <p className="font-semibold text-sm">Subscription ended</p>
          <p className="text-xs text-[var(--fg-40)] mt-0.5">
            Your subscription is no longer active. Resubscribe to regain access.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-start gap-3">
      <CreditCard className="h-5 w-5 text-[var(--fg-40)] mt-0.5 shrink-0" />
      <div>
        <p className="font-semibold text-sm">No active subscription</p>
        <p className="text-xs text-[var(--fg-40)] mt-0.5">
          Start your 14-day free trial. No charge until the trial ends.
        </p>
      </div>
    </div>
  )
}
