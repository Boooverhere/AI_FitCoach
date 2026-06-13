import Link from 'next/link'
import { Logo } from '@/components/shared/Logo'
import { ArrowLeft } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for Coacheckin — how we collect, use, and protect your personal data.',
}

const BG = '#faf8f4'
const HEADLINE = '#042F2E'
const MUTED = '#78716C'
const BORDER = 'rgba(4,47,46,0.07)'

export default function PrivacyPage() {
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
            Privacy Policy
          </h1>
          <p className="text-sm mb-10" style={{ color: MUTED }}>Last updated: June 2025</p>

          <div className="flex flex-col gap-8" style={{ color: '#44403C' }}>

            <Section title="1. Introduction">
              <p>Coacheckin (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) is a trading name operated by <strong>Mehdi Elyoussefi</strong>, a self-employed individual (auto-entrepreneur) registered in Morocco. We are committed to protecting the personal data of coaches, clients, and visitors who use our platform. This Privacy Policy explains what data we collect, how we use it, and your rights.</p>
            </Section>

            <Section title="2. Data We Collect">
              <p>We collect the following categories of personal data:</p>
              <ul className="list-disc pl-5 mt-2 flex flex-col gap-1.5 text-sm">
                <li><strong>Account data:</strong> name, email address, and password (hashed)</li>
                <li><strong>Profile data:</strong> coaching identity, speciality, philosophy, certifications</li>
                <li><strong>Client health data:</strong> weight, height, BMI, blood pressure, heart rate, blood sugar, body fat, injuries, medications — entered by coaches or clients</li>
                <li><strong>Usage data:</strong> IP address, browser type, device type, pages visited, session data</li>
                <li><strong>Communications:</strong> messages exchanged between coaches and clients within the platform</li>
                <li><strong>Progress media:</strong> progress photos uploaded by clients</li>
              </ul>
            </Section>

            <Section title="3. Payment Processing via Dodo Payments">
              <p>Subscription payments are processed by <strong>Dodo Payments</strong>, who acts as the authorised reseller (Merchant of Record) for Coacheckin subscriptions. When you subscribe, your payment information (cardholder name, card identifiers, billing address, payment amount) is collected and processed directly by Dodo Payments.</p>
              <p className="mt-3">Dodo Payments may collect and retain transaction data, your email address, and device information as part of fraud prevention and regulatory compliance. Their data practices are governed by the <a href="https://dodopayments.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:underline">Dodo Payments Privacy Policy</a>.</p>
              <p className="mt-3">We receive confirmation of payment status from Dodo Payments but do not store full card details on our servers.</p>
            </Section>

            <Section title="4. How We Use Your Data">
              <p>We use personal data to:</p>
              <ul className="list-disc pl-5 mt-2 flex flex-col gap-1.5 text-sm">
                <li>Provide and improve the Coacheckin platform</li>
                <li>Process subscriptions and manage billing</li>
                <li>Enable coaches to manage client programs and track progress</li>
                <li>Power AI features (daily digests, coaching identity) — processed via Anthropic&apos;s Claude API</li>
                <li>Send transactional emails (account confirmation, billing notifications)</li>
                <li>Comply with legal and regulatory obligations</li>
              </ul>
            </Section>

            <Section title="5. Data Sharing">
              <p>We do not sell your personal data. We share data only with:</p>
              <ul className="list-disc pl-5 mt-2 flex flex-col gap-1.5 text-sm">
                <li><strong>Supabase</strong> — database and authentication provider (data stored with row-level security)</li>
                <li><strong>Dodo Payments</strong> — payment processing and subscription management</li>
                <li><strong>Anthropic</strong> — AI processing for coaching features (Claude API)</li>
                <li><strong>Google Analytics</strong> — anonymised site usage analytics</li>
                <li>Legal and regulatory authorities when required by law</li>
              </ul>
              <p className="mt-3">All third-party processors are contractually bound to use data only for the purposes we specify.</p>
            </Section>

            <Section title="6. Data Security">
              <p>All data is stored with Supabase row-level security — coaches can only access data from clients linked to their account, and clients can only see their own data. Progress photos are served via signed URLs that expire after one hour. We use HTTPS for all data in transit.</p>
            </Section>

            <Section title="7. Data Retention">
              <p>We retain your data for as long as your account is active. If you delete your account, we will delete your personal data within 30 days, except where retention is required by law (e.g. billing records, which are retained for the legally required period).</p>
            </Section>

            <Section title="8. International Transfers">
              <p>Your data may be processed in countries outside your own, including the United States, where our service providers (Supabase, Anthropic) operate. Where required, transfers are subject to appropriate safeguards such as Standard Contractual Clauses.</p>
            </Section>

            <Section title="9. Your Rights">
              <p>Depending on your jurisdiction, you may have the right to:</p>
              <ul className="list-disc pl-5 mt-2 flex flex-col gap-1.5 text-sm">
                <li>Access a copy of your personal data</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your data (&quot;right to be forgotten&quot;)</li>
                <li>Object to or restrict certain processing</li>
                <li>Data portability</li>
                <li>Lodge a complaint with your local data protection authority</li>
              </ul>
              <p className="mt-3">To exercise any of these rights, contact us at <a href="mailto:support@coacheckin.com" className="text-teal-600 hover:underline">support@coacheckin.com</a>.</p>
            </Section>

            <Section title="10. CCPA (California Residents)">
              <p>If you are a California resident, you have the right to know what personal information we collect, request deletion, and opt out of any sale of personal information. Coacheckin does not sell personal information. To submit a request, contact us at <a href="mailto:support@coacheckin.com" className="text-teal-600 hover:underline">support@coacheckin.com</a>.</p>
            </Section>

            <Section title="11. Cookies">
              <p>We use essential cookies for authentication and session management. We also use Google Analytics cookies for anonymised usage analytics. You can control non-essential cookies through your browser settings.</p>
            </Section>

            <Section title="12. Children">
              <p>Coacheckin is not intended for users under 18. We do not knowingly collect personal data from minors. If you believe a minor has created an account, contact us and we will delete it promptly.</p>
            </Section>

            <Section title="13. Changes to This Policy">
              <p>We may update this Privacy Policy from time to time. We will notify you of material changes by email or via a notice within the platform. Continued use after changes take effect constitutes acceptance.</p>
            </Section>

            <Section title="14. Contact">
              <p>For privacy questions or data requests, contact us at <a href="mailto:support@coacheckin.com" className="text-teal-600 hover:underline">support@coacheckin.com</a> or via our <Link href="/contact" className="text-teal-600 hover:underline">Contact page</Link>.</p>
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
