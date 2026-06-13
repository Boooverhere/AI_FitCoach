import Link from 'next/link'
import { Logo } from '@/components/shared/Logo'
import { ArrowLeft } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service for Coacheckin — the AI-powered fitness coaching platform.',
}

const BG = '#faf8f4'
const HEADLINE = '#042F2E'
const MUTED = '#78716C'
const BORDER = 'rgba(4,47,46,0.07)'

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: BG }}>

      <header className="border-b backdrop-blur-md sticky top-0 z-40"
        style={{ background: 'rgba(250,248,244,0.92)', borderColor: BORDER }}>
        <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between gap-4">
          <Link href="/">
            <Logo iconSize={26} wordmarkClass="text-[#042F2E]" className="shrink-0" />
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/login"
              className="px-4 py-1.5 text-sm font-medium text-stone-500 hover:text-[#042F2E] transition-colors">
              Sign in
            </Link>
            <Link href="/signup"
              className="px-4 py-1.5 text-sm font-semibold rounded-xl text-white transition-all hover:scale-[1.02]"
              style={{ background: '#F97316', boxShadow: '0 0 18px rgba(249,115,22,0.25)' }}>
              Try for free
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 px-5 py-16">
        <div className="max-w-2xl mx-auto">

          <Link href="/"
            className="inline-flex items-center gap-1.5 text-sm mb-8 transition-colors"
            style={{ color: MUTED }}>
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>

          <p className="text-xs font-semibold uppercase tracking-widest text-teal-500 mb-3">Legal</p>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 leading-tight" style={{ color: HEADLINE }}>
            Terms of Service
          </h1>
          <p className="text-sm mb-10" style={{ color: MUTED }}>Last updated: June 2025</p>

          <div className="prose-custom flex flex-col gap-8" style={{ color: '#44403C' }}>

            <Section title="1. Acceptance of Terms">
              <p>By creating an account or using Coacheckin (&quot;the Service&quot;), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.</p>
            </Section>

            <Section title="2. Description of Service">
              <p>Coacheckin is an AI-powered fitness coaching platform that enables personal trainers and health coaches (&quot;Coaches&quot;) to manage clients, build workout programs, track habits, monitor progress, and communicate with clients.</p>
            </Section>

            <Section title="3. Accounts and Eligibility">
              <p>You must be at least 18 years old to create an account. You are responsible for maintaining the confidentiality of your login credentials and for all activity under your account.</p>
            </Section>

            <Section title="4. Subscriptions and Billing">
              <p>Coacheckin offers a paid subscription for Coaches at $19/month. Payment processing is handled by <strong>Dodo Payments</strong>, who acts as the authorised reseller (Merchant of Record) for all Coacheckin subscriptions. Your payment is processed by and charged from Dodo Payments.</p>
              <p className="mt-3">Free trials are available. Your subscription begins billing on the date shown at checkout. You may cancel at any time via your Billing settings.</p>
              <p className="mt-3">Subscription cancellations must be submitted at least <strong>48 hours before your next billing date</strong> to avoid being charged for the following period. No refunds are issued for unused portions of a billing cycle after renewal.</p>
              <p className="mt-3">If a payment fails, your account will be placed on hold until payment is resolved.</p>
            </Section>

            <Section title="5. Refund Policy">
              <p>All subscription fees are non-refundable except where required by applicable law. If you believe you were charged in error, contact us at <a href="mailto:support@coacheckin.com" className="text-teal-600 hover:underline">support@coacheckin.com</a> within 14 days of the charge.</p>
              <p className="mt-3">Refund requests are reviewed on a case-by-case basis. Chargebacks submitted directly to your bank without first contacting us may result in account suspension.</p>
            </Section>

            <Section title="6. Acceptable Use">
              <p>You agree not to:</p>
              <ul className="list-disc pl-5 mt-2 flex flex-col gap-1.5 text-sm">
                <li>Use the Service for any unlawful purpose</li>
                <li>Share your account credentials with others</li>
                <li>Upload content that infringes third-party intellectual property rights</li>
                <li>Attempt to reverse-engineer, scrape, or disrupt the Service</li>
                <li>Use the Service to store or transmit harmful, abusive, or fraudulent content</li>
              </ul>
            </Section>

            <Section title="7. Client Data and Privacy">
              <p>Coaches are responsible for obtaining appropriate consent from their clients before entering client health data into Coacheckin. All data is stored with row-level security — coaches can only access data from clients linked to their account.</p>
              <p className="mt-3">Please review our <Link href="/privacy" className="text-teal-600 hover:underline">Privacy Policy</Link> for full details on how we collect, use, and protect personal data.</p>
            </Section>

            <Section title="8. Intellectual Property">
              <p>Coacheckin and its content, features, and functionality are owned by Coacheckin and are protected by copyright, trademark, and other intellectual property laws. You retain ownership of content you create (programs, workouts, client data) and grant Coacheckin a limited licence to store and display it solely to provide the Service.</p>
            </Section>

            <Section title="9. Disclaimer of Warranties">
              <p>The Service is provided &quot;as is&quot; without warranties of any kind, express or implied. Coacheckin does not warrant that the Service will be uninterrupted, error-free, or suitable for any specific purpose. Fitness and health content on the platform is for informational purposes and does not constitute medical advice.</p>
            </Section>

            <Section title="10. Limitation of Liability">
              <p>To the fullest extent permitted by law, Coacheckin shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Service, even if advised of the possibility of such damages. Our total liability shall not exceed the amounts paid by you in the 12 months preceding the claim.</p>
            </Section>

            <Section title="11. Termination">
              <p>We reserve the right to suspend or terminate your account at any time for violation of these Terms. You may terminate your account at any time by cancelling your subscription and contacting us to delete your data.</p>
            </Section>

            <Section title="12. Changes to Terms">
              <p>We may update these Terms from time to time. We will notify you of material changes by email or by a notice within the platform. Continued use of the Service after changes take effect constitutes acceptance of the updated Terms.</p>
            </Section>

            <Section title="13. Governing Law">
              <p>These Terms are governed by the laws of the Kingdom of Morocco. Any disputes arising from or relating to these Terms shall be subject to the exclusive jurisdiction of the competent courts of Morocco.</p>
            </Section>

            <Section title="14. Contact">
              <p>Coacheckin is a trading name operated by <strong>Mehdi Elyoussefi</strong>, a self-employed individual (auto-entrepreneur) registered in Morocco.</p>
              <p className="mt-3">For questions about these Terms, contact us at <a href="mailto:contact@coacheckin.com" className="text-teal-600 hover:underline">contact@coacheckin.com</a> or via our <Link href="/contact" className="text-teal-600 hover:underline">Contact page</Link>.</p>
            </Section>

          </div>
        </div>
      </main>

      <footer className="border-t py-6 mt-8" style={{ background: '#021815', borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="max-w-5xl mx-auto px-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <Logo iconSize={20} wordmarkClass="text-white/70 text-sm" />
          <div className="flex items-center gap-5 text-xs" style={{ color: 'rgba(255,255,255,0.30)' }}>
            <Link href="/about" className="hover:text-white/60 transition-colors">About</Link>
            <Link href="/terms" className="hover:text-white/60 transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-white/60 transition-colors">Privacy</Link>
            <Link href="/contact" className="hover:text-white/60 transition-colors">Contact</Link>
          </div>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.18)' }}>&copy; {new Date().getFullYear()} Coacheckin &mdash; operated by Mehdi Elyoussefi, Morocco</p>
        </div>
      </footer>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-base font-semibold mb-3" style={{ color: HEADLINE }}>{title}</h2>
      <div className="text-sm leading-relaxed" style={{ color: '#44403C' }}>
        {children}
      </div>
    </div>
  )
}
