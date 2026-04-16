'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { CheckCircle2, Circle, X, ChevronRight, Sparkles } from 'lucide-react'

interface OnboardingStep {
  id: string
  label: string
  description: string
  done: boolean
  href?: string
}

interface Props {
  hasAiSettings: boolean
  hasClients: boolean
  hasHabits: boolean
}

const DISMISS_KEY = 'fitcoach_onboarding_dismissed'

export function OnboardingBanner({ hasAiSettings, hasClients, hasHabits }: Props) {
  const [dismissed, setDismissed] = useState(false)
  const [digestDone, setDigestDone] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setDismissed(localStorage.getItem(DISMISS_KEY) === '1')
    setDigestDone(localStorage.getItem('fitcoach_first_digest') === '1')
  }, [])

  // Listen for digest events
  useEffect(() => {
    function onDigest() {
      localStorage.setItem('fitcoach_first_digest', '1')
      setDigestDone(true)
    }
    window.addEventListener('fitcoach:digest_generated', onDigest)
    return () => window.removeEventListener('fitcoach:digest_generated', onDigest)
  }, [])

  const steps: OnboardingStep[] = [
    {
      id: 'ai_settings',
      label: 'Set up your AI coaching identity',
      description: 'Tell the AI your style, speciality, and upload your credentials.',
      done: hasAiSettings,
      href: '/coach/settings/ai',
    },
    {
      id: 'habits',
      label: 'Create your first habit template',
      description: 'Build habits you can assign to any client.',
      done: hasHabits,
      href: '/coach/habits',
    },
    {
      id: 'clients',
      label: 'Add your first client',
      description: 'Share your invite link or send an email invite.',
      done: hasClients,
    },
    {
      id: 'digest',
      label: 'Generate your first AI Digest',
      description: 'Tap the AI Digest button to see your team summary.',
      done: digestDone,
    },
  ]

  const completedCount = steps.filter((s) => s.done).length
  const allDone = completedCount === steps.length

  // Don't render until mounted (avoids hydration mismatch with localStorage)
  if (!mounted) return null
  if (dismissed) return null
  if (allDone) return null

  const progress = Math.round((completedCount / steps.length) * 100)

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-8)] rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-8)]">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-[var(--accent-tint)] flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-[var(--accent-fg)]" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Get started checklist</h3>
            <p className="text-xs text-[var(--fg-40)]">
              {completedCount} of {steps.length} complete
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            localStorage.setItem(DISMISS_KEY, '1')
            setDismissed(true)
          }}
          className="p-1.5 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--fg-40)] hover:text-[var(--fg)] transition-colors"
          title="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-[var(--border-8)]">
        <div
          className="h-full bg-[var(--accent)] transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Steps */}
      <div className="divide-y divide-[var(--border-5)]">
        {steps.map((step) => {
          const content = (
            <div className={`flex items-center gap-4 px-5 py-3.5 transition-colors ${
              step.href && !step.done ? 'hover:bg-[var(--bg-hover)] cursor-pointer' : ''
            }`}>
              {step.done ? (
                <CheckCircle2 className="h-5 w-5 text-[var(--accent-fg)] shrink-0" />
              ) : (
                <Circle className="h-5 w-5 text-[var(--fg-30)] shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${step.done ? 'line-through text-[var(--fg-40)]' : 'text-[var(--fg)]'}`}>
                  {step.label}
                </p>
                {!step.done && (
                  <p className="text-xs text-[var(--fg-40)] mt-0.5">{step.description}</p>
                )}
              </div>
              {step.href && !step.done && (
                <ChevronRight className="h-4 w-4 text-[var(--fg-30)] shrink-0" />
              )}
            </div>
          )

          if (step.href && !step.done) {
            return (
              <Link key={step.id} href={step.href} className="block">
                {content}
              </Link>
            )
          }
          return <div key={step.id}>{content}</div>
        })}
      </div>
    </div>
  )
}
