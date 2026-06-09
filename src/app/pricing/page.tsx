'use client'

import Link from 'next/link'
import { useState } from 'react'
import { CheckCircle2, Sparkles, ArrowLeft, Zap, Menu, X } from 'lucide-react'
import { Logo } from '@/components/shared/Logo'
import { PLANS, BILLING_OPTIONS, getBilledTotal, type BillingPeriod } from '@/lib/plans'

const BG      = '#faf8f4'
const HEADLINE = '#042F2E'
const MUTED   = '#78716C'
const BORDER  = 'rgba(4,47,46,0.07)'

const NAV_LINKS = [
  { href: '/#how-it-works', label: 'How it works' },
  { href: '/#features',     label: 'Features' },
  { href: '/#faq',          label: 'FAQ' },
  { href: '/pricing',       label: 'Pricing' },
  { href: '/contact',       label: 'Contact' },
]

export default function PricingPage() {
  const [period, setPeriod] = useState<BillingPeriod>('monthly')
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen flex flex-col" style={{ background: BG }}>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex flex-col sm:hidden" style={{ background: '#042F2E' }}>
          <div className="flex items-center justify-between px-5 h-14 border-b shrink-0"
            style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
            <Link href="/">
              <Logo iconSize={26} wordmarkClass="text-white" className="shrink-0" />
            </Link>
            <button onClick={() => setMobileOpen(false)} aria-label="Close menu"
              className="p-2 rounded-lg text-white/60 hover:text-white transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="flex flex-col px-5 pt-4 flex-1 overflow-y-auto">
            {NAV_LINKS.map(({ href, label }) => (
              <a key={href} href={href}
                onClick={() => setMobileOpen(false)}
                className="py-4 text-lg font-medium text-white/70 hover:text-white border-b transition-colors"
                style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
                {label}
              </a>
            ))}
          </nav>
          <div className="px-5 pb-10 pt-6 flex flex-col gap-3">
            <Link href="/login" onClick={() => setMobileOpen(false)}
              className="block text-center py-3 rounded-xl font-medium text-white/70 transition-colors"
              style={{ border: '1px solid rgba(255,255,255,0.18)' }}>
              Sign in
            </Link>
            <Link href="/signup" onClick={() => setMobileOpen(false)}
              className="block text-center py-3 rounded-xl font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #F97316 0%, #EA6C0A 100%)', boxShadow: '0 4px 20px rgba(249,115,22,0.35)' }}>
              Try for free
            </Link>
          </div>
        </div>
      )}

      {/* Nav */}
      <header className="border-b backdrop-blur-md sticky top-0 z-40"
        style={{ background: 'rgba(250,248,244,0.92)', borderColor: BORDER }}>
        <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between gap-4">
          <Link href="/">
            <Logo iconSize={26} wordmarkClass="text-[#042F2E]" className="shrink-0" />
          </Link>
          <nav className="hidden sm:flex items-center gap-6 text-sm text-stone-500">
            {NAV_LINKS.map(({ href, label }) => (
              <a key={href} href={href} className="hover:text-[#042F2E] transition-colors">{label}</a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login"
              className="hidden sm:block px-4 py-1.5 text-sm font-medium text-stone-500 hover:text-[#042F2E] transition-colors">
              Sign in
            </Link>
            <Link href="/signup"
              className="hidden sm:block px-4 py-1.5 text-sm font-semibold rounded-xl text-white transition-all hover:scale-[1.02]"
              style={{ background: '#F97316', boxShadow: '0 0 18px rgba(249,115,22,0.25)' }}>
              Try for free
            </Link>
            <button
              className="sm:hidden p-2 rounded-lg text-stone-500 hover:text-[#042F2E] transition-colors"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 px-5 py-16">
        <div className="max-w-5xl mx-auto">

          <Link href="/"
            className="inline-flex items-center gap-1.5 text-sm mb-10 transition-colors"
            style={{ color: MUTED }}>
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>

          {/* Heading */}
          <div className="text-center mb-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-teal-500 mb-3">Pricing</p>
            <h1 className="text-3xl sm:text-4xl font-bold mb-3" style={{ color: HEADLINE }}>
              Simple, transparent pricing
            </h1>
            <p className="text-sm max-w-sm mx-auto" style={{ color: MUTED }}>
              Start free. Upgrade when your roster grows. Every plan includes a 14-day free trial.
            </p>
          </div>

          {/* Billing period toggle */}
          <div className="flex justify-center mb-10">
            <div className="grid grid-cols-2 sm:flex rounded-xl p-1 gap-1 w-full sm:w-auto"
              style={{ background: '#fff', border: `1px solid ${BORDER}` }}>
              {BILLING_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setPeriod(opt.id)}
                  className="flex flex-col items-center px-4 py-2 rounded-lg text-sm font-medium transition-all"
                  style={{
                    background: period === opt.id ? '#042F2E' : 'transparent',
                    color: period === opt.id ? '#fff' : MUTED,
                  }}
                >
                  {opt.label}
                  {opt.savingLabel && (
                    <span className={`text-[10px] font-semibold mt-0.5 ${period === opt.id ? 'text-teal-300' : 'text-teal-500'}`}>
                      {opt.savingLabel}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Plan cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PLANS.map((plan) => {
              const price = plan.prices[period]
              const total = getBilledTotal(plan, period)
              const billingOption = BILLING_OPTIONS.find(b => b.id === period)!
              const isPopular = plan.popular

              return (
                <div
                  key={plan.id}
                  className="relative flex flex-col rounded-2xl p-5 transition-all"
                  style={{
                    background: isPopular ? 'rgba(4,47,46,0.03)' : '#fff',
                    border: isPopular
                      ? '1.5px solid rgba(45,212,191,0.45)'
                      : `1px solid ${BORDER}`,
                    boxShadow: isPopular ? '0 0 32px rgba(45,212,191,0.08)' : undefined,
                  }}
                >
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-[10px] font-bold text-white uppercase tracking-wider"
                        style={{ background: 'linear-gradient(135deg, #2DD4BF, #0D9488)' }}>
                        <Zap className="h-2.5 w-2.5" />
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="mb-4">
                    <p className="font-bold text-base mb-0.5" style={{ color: HEADLINE }}>{plan.name}</p>
                    <p className="text-xs leading-relaxed" style={{ color: MUTED }}>{plan.tagline}</p>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-end gap-1">
                      <span className="text-3xl font-bold" style={{ color: HEADLINE }}>${price}</span>
                      <span className="text-sm pb-1" style={{ color: MUTED }}>/mo</span>
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: MUTED }}>
                      {period === 'monthly'
                        ? 'Billed monthly'
                        : `Billed $${total} every ${billingOption.label.toLowerCase()}`}
                    </p>
                  </div>

                  <Link
                    href="/signup"
                    className="block w-full text-center px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-[1.01] mb-5"
                    style={isPopular
                      ? { background: '#042F2E', color: '#fff' }
                      : { background: 'transparent', color: HEADLINE, border: `1px solid ${BORDER}` }
                    }
                  >
                    Start free trial
                  </Link>

                  <div className="flex flex-col gap-2">
                    {plan.features.map((f) => (
                      <div key={f} className="flex items-start gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-teal-500 mt-0.5 shrink-0" />
                        <span className="text-xs leading-relaxed" style={{ color: MUTED }}>{f}</span>
                      </div>
                    ))}
                    {plan.aiFeatures.map((f) => (
                      <div key={f} className="flex items-start gap-2">
                        <Sparkles className="h-3.5 w-3.5 text-purple-500 mt-0.5 shrink-0" />
                        <span className="text-xs leading-relaxed font-medium" style={{ color: '#6B4F9E' }}>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Bottom note */}
          <p className="text-center text-xs mt-8" style={{ color: MUTED }}>
            All plans include a 14-day free trial. No credit card required to start. Cancel anytime — cancellations must be submitted at least 48 hours before your next billing date.{' '}
            <span style={{ color: 'rgba(4,47,46,0.35)' }}>Payments processed by Dodo Payments.</span>
          </p>

        </div>
      </main>

      <footer className="border-t py-6 mt-8" style={{ background: '#021815', borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="max-w-5xl mx-auto px-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <Logo iconSize={20} wordmarkClass="text-white/70 text-sm" />
          <div className="flex items-center gap-5 text-xs" style={{ color: 'rgba(255,255,255,0.30)' }}>
            <Link href="/terms" className="hover:text-white/60 transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-white/60 transition-colors">Privacy</Link>
            <Link href="/contact" className="hover:text-white/60 transition-colors">Contact</Link>
          </div>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.18)' }}>&copy; {new Date().getFullYear()} Coacheckin</p>
        </div>
      </footer>
    </div>
  )
}
