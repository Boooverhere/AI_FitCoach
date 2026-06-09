export type PlanId = 'starter' | 'pro' | 'scale'
export type BillingPeriod = 'monthly' | '3months' | '6months' | 'annual'

export interface Plan {
  id: PlanId
  name: string
  tagline: string
  prices: Record<BillingPeriod, number>
  clientLimit: number | null
  features: string[]
  aiFeatures: string[]
  popular?: boolean
}

export const FREE_PLAN = {
  name: 'Free',
  tagline: 'Try Coacheckin with your first clients — no card needed',
  clientLimit: 3,
  features: [
    'Up to 3 clients',
    'Workout program builder',
    'Daily check-ins & habit tracking',
    'Direct messaging',
    'Progress photos & charts',
  ],
} as const

export const PLANS: readonly Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    tagline: 'More clients, all the tools — zero compromise',
    prices: { monthly: 12, '3months': 11, '6months': 10, annual: 9 },
    clientLimit: 10,
    features: [
      'Up to 10 clients',
      'Everything in Free',
      'Health profiles',
      'Team dashboard & insights',
      'Completion analytics',
    ],
    aiFeatures: [],
  },
  {
    id: 'pro',
    name: 'Pro',
    tagline: 'AI handles the admin. You focus on coaching.',
    prices: { monthly: 24, '3months': 22, '6months': 20, annual: 19 },
    clientLimit: 30,
    popular: true,
    features: [
      'Up to 30 clients',
      'Everything in Starter',
    ],
    aiFeatures: [
      'AI Daily Digest',
      'AI Coaching Identity',
    ],
  },
  {
    id: 'scale',
    name: 'Scale',
    tagline: 'Unlimited clients, full AI, zero ceiling',
    prices: { monthly: 49, '3months': 45, '6months': 42, annual: 39 },
    clientLimit: null,
    features: [
      'Unlimited clients',
      'Everything in Pro',
      'Priority support',
    ],
    aiFeatures: [
      'AI Daily Digest',
      'AI Coaching Identity',
      'AI program adjustments',
    ],
  },
] as const

export interface BillingOption {
  id: BillingPeriod
  label: string
  months: number
  savingLabel: string
}

export const BILLING_OPTIONS: readonly BillingOption[] = [
  { id: 'monthly',  label: 'Monthly',  months: 1,  savingLabel: '' },
  { id: '3months',  label: '3 Months', months: 3,  savingLabel: 'Save 8%' },
  { id: '6months',  label: '6 Months', months: 6,  savingLabel: 'Save 17%' },
  { id: 'annual',   label: 'Annual',   months: 12, savingLabel: '2 months free' },
] as const

export function getBilledTotal(plan: Plan, period: BillingPeriod): number {
  const option = BILLING_OPTIONS.find(b => b.id === period)!
  return plan.prices[period] * option.months
}

// e.g. DODO_PRODUCT_PRO_ANNUAL
export function getProductEnvKey(planId: PlanId, period: BillingPeriod): string {
  return `DODO_PRODUCT_${planId.toUpperCase()}_${period.toUpperCase()}`
}
