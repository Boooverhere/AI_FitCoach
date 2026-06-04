'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'

interface Props {
  status: string
}

export function BillingActions({ status }: Props) {
  const [loading, setLoading] = useState(false)
  const [cancelled, setCancelled] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function startCheckout() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/dodo/checkout', { method: 'POST' })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setError(data.error ?? 'Something went wrong. Please try again.')
        setLoading(false)
      }
    } catch {
      setError('Network error. Please try again.')
      setLoading(false)
    }
  }

  async function cancelSubscription() {
    if (!confirm('Cancel your subscription? You keep access until the end of the billing period.')) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/dodo/cancel', { method: 'POST' })
      if (res.ok) {
        setCancelled(true)
      } else {
        const data = await res.json()
        setError(data.error ?? 'Could not cancel. Please try again.')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (cancelled) {
    return (
      <p className="text-sm text-[var(--fg-40)]">
        Cancellation scheduled — access continues until the end of the billing period.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}

      {status === 'active' || status === 'pending' ? (
        <Button variant="secondary" loading={loading} onClick={cancelSubscription}>
          Cancel subscription
        </Button>
      ) : status === 'cancelled' || status === 'expired' || status === 'failed' || status === 'on_hold' ? (
        <Button loading={loading} onClick={startCheckout}>
          Resubscribe — $19/month
        </Button>
      ) : (
        <Button loading={loading} onClick={startCheckout}>
          Start 14-day free trial
        </Button>
      )}
    </div>
  )
}
