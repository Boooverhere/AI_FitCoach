import Link from 'next/link'
import { AlertTriangle, XCircle, Sparkles } from 'lucide-react'

interface Props {
  status: string
}

export function SubscriptionBanner({ status }: Props) {
  if (status === 'active' || status === 'pending') return null

  if (status === 'on_hold') {
    return (
      <div className="mx-4 sm:mx-6 mt-4 -mb-2 flex items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3">
        <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
        <p className="text-sm text-amber-300 flex-1">
          Your last payment failed and your subscription is on hold.
        </p>
        <Link
          href="/coach/settings/billing"
          className="text-xs font-semibold text-amber-300 hover:text-amber-200 underline underline-offset-2 shrink-0"
        >
          Fix billing →
        </Link>
      </div>
    )
  }

  if (status === 'cancelled' || status === 'expired' || status === 'failed') {
    return (
      <div className="mx-4 sm:mx-6 mt-4 -mb-2 flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
        <XCircle className="h-4 w-4 text-red-400 shrink-0" />
        <p className="text-sm text-red-300 flex-1">
          Your subscription has ended. Resubscribe to keep access.
        </p>
        <Link
          href="/coach/settings/billing"
          className="text-xs font-semibold text-red-300 hover:text-red-200 underline underline-offset-2 shrink-0"
        >
          Resubscribe →
        </Link>
      </div>
    )
  }

  // status === 'none' or no row — gentle trial nudge
  return (
    <div className="mx-4 sm:mx-6 mt-4 -mb-2 flex items-center gap-3 rounded-xl border border-[var(--accent-border-sub)] bg-[var(--accent-wash)] px-4 py-3">
      <Sparkles className="h-4 w-4 text-[var(--accent-fg)] shrink-0" />
      <p className="text-sm text-[var(--fg-50)] flex-1">
        Start your <span className="text-[var(--fg)]">14-day free trial</span> — no charge until it ends.
      </p>
      <Link
        href="/coach/settings/billing"
        className="text-xs font-semibold text-[var(--accent-fg)] hover:text-[var(--accent-fg-muted)] underline underline-offset-2 shrink-0"
      >
        Start trial →
      </Link>
    </div>
  )
}
