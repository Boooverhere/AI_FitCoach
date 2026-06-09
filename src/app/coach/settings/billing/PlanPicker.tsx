'use client'

import { useState } from 'react'
import { CheckCircle2, Sparkles, Zap } from 'lucide-react'
import { PLANS, BILLING_OPTIONS, getBilledTotal, type BillingPeriod, type PlanId } from '@/lib/plans'

export function PlanPicker() {
  const [period, setPeriod] = useState<BillingPeriod>('monthly')
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function startCheckout(planId: PlanId) {
    setLoading(planId)
    setError(null)
    try {
      const res = await fetch('/api/dodo/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, period }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setError(data.error ?? 'Something went wrong. Please try again.')
        setLoading(null)
      }
    } catch {
      setError('Network error. Please try again.')
      setLoading(null)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-sm font-semibold mb-3 text-[var(--fg)]">Choose a plan</p>

        {/* Period toggle */}
        <div className="inline-flex rounded-xl p-1 gap-1 mb-5"
          style={{ background: 'var(--bg-base)', border: '1px solid var(--border-8)' }}>
          {BILLING_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setPeriod(opt.id)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                background: period === opt.id ? 'var(--fg)' : 'transparent',
                color: period === opt.id ? 'var(--bg-base)' : 'var(--fg-40)',
              }}
            >
              {opt.label}
              {opt.savingLabel && (
                <span className={`ml-1 font-semibold ${period === opt.id ? 'text-teal-300' : 'text-teal-500'}`}>
                  · {opt.savingLabel}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Plan cards */}
        <div className="grid sm:grid-cols-2 gap-3">
          {PLANS.map((plan) => {
            const price = plan.prices[period]
            const total = getBilledTotal(plan, period)
            const billingOption = BILLING_OPTIONS.find(b => b.id === period)!
            const isLoading = loading === plan.id

            return (
              <div
                key={plan.id}
                className="relative rounded-2xl p-4 flex flex-col gap-3 transition-all"
                style={{
                  background: plan.popular ? 'rgba(45,212,191,0.04)' : 'var(--bg-base)',
                  border: plan.popular
                    ? '1.5px solid rgba(45,212,191,0.35)'
                    : '1px solid var(--border-8)',
                }}
              >
                {plan.popular && (
                  <div className="absolute -top-2.5 left-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold text-white uppercase tracking-wider"
                      style={{ background: 'linear-gradient(135deg, #2DD4BF, #0D9488)' }}>
                      <Zap className="h-2 w-2" />
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-sm text-[var(--fg)]">{plan.name}</p>
                    <p className="text-xs text-[var(--fg-40)] mt-0.5">
                      {plan.clientLimit ? `Up to ${plan.clientLimit} clients` : 'Unlimited clients'}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-lg font-bold text-[var(--fg)]">${price}<span className="text-xs font-normal text-[var(--fg-40)]">/mo</span></p>
                    {period !== 'monthly' && (
                      <p className="text-[10px] text-[var(--fg-30)]">
                        ${total} / {billingOption.label.toLowerCase()}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  {plan.features.slice(1).map((f) => (
                    <div key={f} className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3 w-3 text-teal-500 shrink-0" />
                      <span className="text-xs text-[var(--fg-50)]">{f}</span>
                    </div>
                  ))}
                  {plan.aiFeatures.map((f) => (
                    <div key={f} className="flex items-center gap-1.5">
                      <Sparkles className="h-3 w-3 text-purple-500 shrink-0" />
                      <span className="text-xs font-medium text-purple-600 dark:text-purple-400">{f}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => startCheckout(plan.id)}
                  disabled={isLoading}
                  className="w-full py-2 rounded-xl text-xs font-semibold transition-all hover:scale-[1.01] disabled:opacity-60 disabled:cursor-not-allowed"
                  style={plan.popular
                    ? { background: 'var(--accent-fg)', color: '#fff' }
                    : { background: 'transparent', color: 'var(--fg)', border: '1px solid var(--border-8)' }
                  }
                >
                  {isLoading ? 'Redirecting…' : 'Start 14-day free trial'}
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}

      <p className="text-xs text-[var(--fg-30)]">
        No credit card required to start. Cancel anytime — cancellations must be submitted at least 48 hours before your next billing date.
      </p>
    </div>
  )
}
