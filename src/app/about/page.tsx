import Link from 'next/link'
import { Logo } from '@/components/shared/Logo'
import { ArrowLeft, Dumbbell, Bot, Heart } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About — Coacheckin',
  description: 'Coacheckin was built by Mehdi Elyoussefi, a fitness enthusiast, coach, and developer based in Morocco.',
}

const BG      = '#faf8f4'
const HEADLINE = '#042F2E'
const MUTED    = '#78716C'
const BORDER   = 'rgba(4,47,46,0.07)'
const BORDER_T = 'rgba(45,212,191,0.22)'

export default function AboutPage() {
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

          <p className="text-xs font-semibold uppercase tracking-widest text-teal-500 mb-3">About</p>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4 leading-tight" style={{ color: HEADLINE }}>
            Built by a coach,<br />for coaches
          </h1>

          {/* Founder card */}
          <div className="rounded-2xl p-6 mb-10 flex items-start gap-5"
            style={{ background: '#ffffff', border: `1px solid ${BORDER_T}` }}>
            <div className="h-12 w-12 rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center shrink-0 text-lg font-bold text-teal-700 select-none">
              ME
            </div>
            <div>
              <p className="font-semibold text-sm" style={{ color: HEADLINE }}>Mehdi Elyoussefi</p>
              <p className="text-xs mt-0.5" style={{ color: MUTED }}>
                Fitness enthusiast, coach &amp; developer &mdash; Morocco
              </p>
              <p className="text-sm leading-relaxed mt-3" style={{ color: '#44403C' }}>
                I built Coacheckin because I lived the problem. Between writing programs in spreadsheets, chasing check-ins over WhatsApp, and trying to remember which client had a bad knee — the admin was eating into the actual coaching. I wanted one place that handled all of it, and added AI that genuinely understands my coaching style.
              </p>
            </div>
          </div>

          {/* Story */}
          <div className="flex flex-col gap-5 text-sm leading-relaxed mb-12" style={{ color: '#44403C' }}>
            <p>
              Coacheckin started as a personal tool. Over time it became clear that every online coach faced the same friction: fragmented tools, manual follow-ups, and clients who fell off because there was no consistent touchpoint between sessions.
            </p>
            <p>
              The platform is built around three convictions: check-ins should be effortless for clients, program management should be visual and fast for coaches, and AI should amplify your voice — not replace it. Every feature exists to reduce the gap between a coach&apos;s expertise and the client&apos;s daily experience.
            </p>
            <p style={{ color: MUTED }}>
              Coacheckin is an independent product, built and maintained by a single developer. There&apos;s no VC funding, no bloated team, and no enterprise roadmap driven by someone who has never coached a client. Just a focused tool that does what it says.
            </p>
          </div>

          {/* Pillars */}
          <div className="grid sm:grid-cols-3 gap-4 mb-12">
            {[
              { icon: Dumbbell,  iconBg: 'bg-orange-50', iconColor: 'text-orange-500', label: 'Coaching-first', desc: 'Every feature was designed around how coaches actually work, not how software engineers imagine they work.' },
              { icon: Bot,       iconBg: 'bg-teal-50',   iconColor: 'text-teal-600',   label: 'AI in your voice', desc: 'The AI learns your coaching identity — your tone, speciality, and philosophy — and uses it across all AI features.' },
              { icon: Heart,     iconBg: 'bg-rose-50',   iconColor: 'text-rose-500',   label: 'Client wellbeing', desc: 'Daily check-ins, habit tracking, and progress photos keep clients accountable between every session.' },
            ].map((p) => (
              <div key={p.label}
                className="flex flex-col items-center text-center gap-3 rounded-2xl p-6"
                style={{ background: '#ffffff', border: `1px solid ${BORDER_T}` }}>
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${p.iconBg}`}>
                  <p.icon className={`h-5 w-5 ${p.iconColor}`} />
                </div>
                <p className="font-semibold text-sm" style={{ color: HEADLINE }}>{p.label}</p>
                <p className="text-xs leading-relaxed" style={{ color: MUTED }}>{p.desc}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center">
            <Link href="/signup"
              className="inline-block px-6 py-3 text-sm font-semibold rounded-xl text-white transition-all hover:scale-[1.02]"
              style={{ background: '#F97316', boxShadow: '0 0 18px rgba(249,115,22,0.22)' }}>
              Start your free trial
            </Link>
            <p className="text-xs mt-3" style={{ color: MUTED }}>
              Have a question? <Link href="/contact" className="text-teal-600 hover:underline">Get in touch</Link>
            </p>
          </div>

        </div>
      </main>

      <footer className="border-t py-6 mt-8" style={{ background: '#021815', borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="max-w-5xl mx-auto px-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <Logo iconSize={20} wordmarkClass="text-white/70 text-sm" />
          <div className="flex items-center gap-5 text-xs" style={{ color: 'rgba(255,255,255,0.30)' }}>
            <Link href="/terms"   className="hover:text-white/60 transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-white/60 transition-colors">Privacy</Link>
            <Link href="/contact" className="hover:text-white/60 transition-colors">Contact</Link>
          </div>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.18)' }}>&copy; {new Date().getFullYear()} Coacheckin &mdash; operated by Mehdi Elyoussefi, Morocco</p>
        </div>
      </footer>

    </div>
  )
}
