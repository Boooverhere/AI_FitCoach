export type PlanId = 'starter' | 'pro' | 'growth' | 'agency'
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

export const PLANS: readonly Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    tagline: 'Everything you need to start coaching online',
    prices: { monthly: 15, '3months': 13, '6months': 12, annual: 10 },
    clientLimit: 5,
    features: [
      'Up to 5 clients',
      'Program & workout builder',
      'Daily check-ins & habit tracking',
      'Direct messaging',
      'Progress photos & charts',
      'Health profiles',
    ],
    aiFeatures: [],
  },
  {
    id: 'pro',
    name: 'Pro',
    tagline: 'AI-powered coaching for a growing roster',
    prices: { monthly: 29, '3months': 25, '6months': 23, annual: 19 },
    clientLimit: 20,
    popular: true,
    features: [
      'Up to 20 clients',
      'Everything in Starter',
      'Team dashboard & insights',
    ],
    aiFeatures: [
      'AI Daily Digest',
      'AI Coaching Identity',
    ],
  },
  {
    id: 'growth',
    name: 'Growth',
    tagline: 'Full AI stack for coaches scaling fast',
    prices: { monthly: 59, '3months': 50, '6months': 45, annual: 39 },
    clientLimit: 50,
    features: [
      'Up to 50 clients',
      'Everything in Pro',
      'Completion insights',
    ],
    aiFeatures: [
      'AI Daily Digest',
      'AI Coaching Identity',
      'AI program adjustments',
    ],
  },
  {
    id: 'agency',
    name: 'Agency',
    tagline: 'Unlimited scale for large coaching operations',
    prices: { monthly: 99, '3months': 85, '6months': 75, annual: 65 },
    clientLimit: null,
    features: [
      'Unlimited clients',
      'Everything in Growth',
      'Priority support',
      'Early access to new features',
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
  { id: '3months',  label: '3 Months', months: 3,  savingLabel: 'Save 13%' },
  { id: '6months',  label: '6 Months', months: 6,  savingLabel: 'Save 20%' },
  { id: 'annual',   label: 'Annual',   months: 12, savingLabel: '2 months free' },
] as const

export function getBilledTotal(plan: Plan, period: BillingPeriod): number {
  const option = BILLING_OPTIONS.find(b => b.id === period)!
  return plan.prices[period] * option.months
}

// Env var key: e.g. DODO_PRODUCT_PRO_ANNUAL
export function getProductEnvKey(planId: PlanId, period: BillingPeriod): string {
  return `DODO_PRODUCT_${planId.toUpperCase()}_${period.toUpperCase().replace('3MONTHS', '3MONTHS').replace('6MONTHS', '6MONTHS')}`
}
