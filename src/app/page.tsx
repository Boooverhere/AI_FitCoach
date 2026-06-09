'use client'

import Link from 'next/link'
import { useState } from 'react'
import {
  Bot, LayoutDashboard, Heart, Sparkles, TrendingUp, Users,
  CheckCircle2, ChevronDown, Dumbbell, ShieldCheck, QrCode,
  MessageSquare, Camera, Layers, ClipboardList, Menu, X,
} from 'lucide-react'
import { HeroSection } from './HeroSection'
import { Logo } from '@/components/shared/Logo'

/* ── light marketing tokens ──────────────────────────────── */
const BG       = '#faf8f4'
const BG_LIFT  = '#ffffff'
const BORDER   = 'rgba(4,47,46,0.07)'
const BORDER_T = 'rgba(45,212,191,0.22)'
const CARD_BG  = '#ffffff'
const HEADLINE = '#042F2E'
const MUTED    = '#78716C'

const NAV_LINKS = [
  { href: '#how-it-works', label: 'How it works' },
  { href: '#features',     label: 'Features' },
  { href: '#about',        label: 'About' },
  { href: '#faq',          label: 'FAQ' },
  { href: '/pricing',      label: 'Pricing' },
  { href: '/contact',      label: 'Contact' },
]

export default function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex flex-col" style={{ background: BG, color: '#44403C' }}>

      {/* ── Mobile menu overlay ──────────────────────── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex flex-col sm:hidden" style={{ background: '#042F2E' }}>
          <div className="flex items-center justify-between px-5 h-14 border-b shrink-0"
            style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
            <Logo iconSize={26} wordmarkClass="text-white" className="shrink-0" />
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
              className="block text-center py-3 rounded-xl font-semibold text-white transition-all hover:scale-[1.01]"
              style={{ background: 'linear-gradient(135deg, #F97316 0%, #EA6C0A 100%)', boxShadow: '0 4px 20px rgba(249,115,22,0.35)' }}>
              Try for free
            </Link>
          </div>
        </div>
      )}

      {/* ── Nav ─────────────────────────────────────── */}
      <header
        className="sticky top-0 z-40 border-b backdrop-blur-md"
        style={{ background: 'rgba(250,248,244,0.92)', borderColor: BORDER }}
      >
        <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between gap-4">
          <Logo iconSize={26} wordmarkClass="text-[#042F2E]" className="shrink-0" />

          <nav className="hidden sm:flex items-center gap-6 text-sm text-stone-500">
            {NAV_LINKS.map(({ href, label }) => (
              <a key={href} href={href}
                className="hover:text-[#042F2E] transition-colors">
                {label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2 shrink-0">
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

      {/* ── Hero ─────────────────────────────────────── */}
      <HeroSection />

      {/* ── How it Works ─────────────────────────────── */}
      <section id="how-it-works" className="border-t" style={{ background: BG_LIFT, borderColor: BORDER }}>
        <div className="max-w-5xl mx-auto px-5 py-20 sm:py-28">
          <SectionLabel>How it works</SectionLabel>
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-3" style={{ color: HEADLINE }}>
            Up and running in minutes
          </h2>
          <p className="text-center mb-16 max-w-md mx-auto text-sm" style={{ color: MUTED }}>
            No complicated setup. No technical knowledge required.
          </p>

          <div className="grid sm:grid-cols-3 gap-10 relative">
            <div className="hidden sm:block absolute top-6 left-[calc(16.67%+2rem)] right-[calc(16.67%+2rem)] h-px"
              style={{ background: 'linear-gradient(to right, transparent, rgba(45,212,191,0.35), transparent)' }} />

            {steps.map((step, i) => (
              <div key={step.title} className="flex flex-col items-center text-center gap-4">
                <div className="relative z-10 h-12 w-12 rounded-full flex items-center justify-center text-sm font-bold text-teal-600"
                  style={{ background: BG_LIFT, border: '1.5px solid rgba(45,212,191,0.45)' }}>
                  {i + 1}
                </div>
                <div>
                  <h3 className="font-semibold mb-1.5" style={{ color: HEADLINE }}>{step.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: MUTED }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────── */}
      <section id="features" className="border-t" style={{ background: BG, borderColor: BORDER }}>
        <div className="max-w-5xl mx-auto px-5 py-20 sm:py-28">
          <SectionLabel>Features</SectionLabel>
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-3" style={{ color: HEADLINE }}>
            The full coaching stack
          </h2>
          <p className="text-center mb-14 max-w-md mx-auto text-sm" style={{ color: MUTED }}>
            Programs, workouts, habits, messaging, progress photos, and AI — all in one place.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f) => (
              <div key={f.title}
                className="rounded-2xl p-5 flex flex-col gap-3 transition-all hover:shadow-sm hover:border-teal-500/30"
                style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
                <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${f.iconBg}`}>
                  <f.icon className={`h-4 w-4 ${f.iconColor}`} />
                </div>
                <h3 className="font-semibold text-sm" style={{ color: HEADLINE }}>{f.title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: MUTED }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── About ────────────────────────────────────── */}
      <section id="about" className="border-t" style={{ background: BG_LIFT, borderColor: BORDER }}>
        <div className="max-w-5xl mx-auto px-5 py-20 sm:py-28">
          <SectionLabel>About</SectionLabel>
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10" style={{ color: HEADLINE }}>
            Built to solve a real problem
          </h2>

          <div className="max-w-2xl mx-auto text-center mb-14">
            <p className="leading-loose mb-5 text-sm sm:text-base" style={{ color: '#44403C' }}>
              Coacheckin was built out of a simple frustration: coaches were spending more time chasing check-ins, writing programs in spreadsheets, and sending the same update messages than actually coaching. We set out to fix that.
            </p>
            <p className="leading-loose text-sm sm:text-base" style={{ color: MUTED }}>
              Whether you run online programs or work with clients in person, Coacheckin gives you everything in one place — habit tracking, structured workout plans, progress photos, direct messaging, and AI that speaks in your voice.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            {pillars.map((p) => (
              <div key={p.label}
                className="flex flex-col items-center text-center gap-3 rounded-2xl p-6"
                style={{ background: CARD_BG, border: `1px solid ${BORDER_T}` }}>
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${p.iconBg}`}>
                  <p.icon className={`h-5 w-5 ${p.iconColor}`} />
                </div>
                <p className="font-semibold text-sm" style={{ color: HEADLINE }}>{p.label}</p>
                <p className="text-xs leading-relaxed" style={{ color: MUTED }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────── */}
      <section id="faq" className="border-t" style={{ background: BG, borderColor: BORDER }}>
        <div className="max-w-2xl mx-auto px-5 py-20 sm:py-28">
          <SectionLabel>FAQ</SectionLabel>
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-3" style={{ color: HEADLINE }}>
            Common questions
          </h2>
          <p className="text-center text-sm mb-12" style={{ color: MUTED }}>
            Still curious? We have answers.
          </p>

          <div className="flex flex-col gap-2">
            {faqs.map((faq) => (
              <FAQItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ───────────────────────────────── */}
      <section className="border-t" style={{
        borderColor: 'transparent',
        background: 'linear-gradient(180deg, #042F2E 0%, #021815 100%)',
      }}>
        <div className="max-w-5xl mx-auto px-5 py-24 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-6 text-xs font-semibold text-teal-400"
            style={{ background: 'rgba(45,212,191,0.12)', border: '1px solid rgba(45,212,191,0.20)' }}>
            <Sparkles className="h-3 w-3" />
            Free to get started
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 leading-tight">
            Ready to coach at your best?
          </h2>
          <p className="mb-10 max-w-sm mx-auto text-sm leading-relaxed" style={{ color: 'rgba(45,212,191,0.55)' }}>
            Programs, workouts, habits, messages, and AI insights — everything your clients need, in one place.
          </p>
          <Link
            href="/signup"
            className="inline-block px-8 py-3.5 text-base font-semibold rounded-2xl text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: 'linear-gradient(135deg, #F97316 0%, #EA6C0A 100%)',
              boxShadow: '0 8px 32px rgba(249,115,22,0.35)',
            }}
          >
            Create your free account
          </Link>
        </div>
      </section>

      {/* ── WhatsApp floating button ─────────────────── */}
      <a
        href="https://wa.me/message/KYISERSGPOL5K1"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="fixed bottom-6 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-full text-white text-sm font-semibold shadow-lg transition-all hover:scale-105 active:scale-95"
        style={{
          background: 'linear-gradient(135deg, #25D366 0%, #1DA851 100%)',
          boxShadow: '0 4px 24px rgba(37,211,102,0.40)',
        }}
      >
        <WhatsAppIcon size={20} />
        <span className="hidden sm:inline">Chat with us</span>
      </a>

      {/* ── Footer ───────────────────────────────────── */}
      <footer className="border-t py-8" style={{ background: '#021815', borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="max-w-5xl mx-auto px-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo iconSize={22} wordmarkClass="text-white/70 text-sm" />
          <div className="flex items-center gap-6 text-xs" style={{ color: 'rgba(255,255,255,0.30)' }}>
            <a href="#how-it-works" className="hover:text-white/60 transition-colors">How it works</a>
            <a href="#features" className="hover:text-white/60 transition-colors">Features</a>
            <a href="#faq" className="hover:text-white/60 transition-colors">FAQ</a>
            <Link href="/pricing" className="hover:text-white/60 transition-colors">Pricing</Link>
            <Link href="/blog" className="hover:text-white/60 transition-colors">Blog</Link>
            <Link href="/contact" className="hover:text-white/60 transition-colors">Contact</Link>
            <Link href="/terms" className="hover:text-white/60 transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-white/60 transition-colors">Privacy</Link>
            <Link href="/login" className="hover:text-white/60 transition-colors">Sign in</Link>
          </div>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.18)' }}>&copy; {new Date().getFullYear()} Coacheckin</p>
        </div>
        <div className="max-w-5xl mx-auto px-5 mt-4 text-center">
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.15)' }}>
            Payments processed by Dodo Payments, authorised reseller of Coacheckin subscriptions.
          </p>
        </div>
      </footer>

    </div>
  )
}

/* ── WhatsApp SVG icon ──────────────────────────────────── */
function WhatsAppIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="white" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  )
}

/* ── Section label ──────────────────────────────────────── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-center text-xs font-semibold uppercase tracking-widest text-teal-500 mb-3">
      {children}
    </p>
  )
}

/* ── FAQ accordion ──────────────────────────────────────── */
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-xl overflow-hidden transition-all"
      style={{ border: `1px solid ${open ? 'rgba(45,212,191,0.30)' : 'rgba(4,47,46,0.08)'}` }}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left gap-4 transition-colors"
        style={{ background: open ? 'rgba(45,212,191,0.04)' : 'transparent' }}
      >
        <span className="font-medium text-sm" style={{ color: '#042F2E' }}>{q}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${open ? 'rotate-180 text-teal-500' : 'text-stone-400'}`} />
      </button>
      {open && (
        <div className="px-5 pb-5 pt-3 text-sm leading-relaxed"
          style={{ borderTop: '1px solid rgba(4,47,46,0.06)', color: '#78716C' }}>
          {a}
        </div>
      )}
    </div>
  )
}

/* ── Data ───────────────────────────────────────────────── */
const steps = [
  {
    title: 'Set up your profile',
    desc: 'Configure your coaching identity, upload certifications, and build your habit and workout templates. The AI learns your voice and philosophy.',
  },
  {
    title: 'Invite your clients',
    desc: 'Share your unique invite code. Clients join, fill in their health profile, and are instantly linked to you — ready for their first program.',
  },
  {
    title: 'Coach at full capacity',
    desc: 'Build week-by-week programs, monitor workouts and habits, message clients directly, and get AI digests that surface who needs you most.',
  },
]

const features = [
  {
    title: 'Program Builder',
    desc: 'Build multi-week programs with week-by-week habits and structured workout plans. Copy weeks, inherit habits, and assign to any client in seconds.',
    icon: Layers,
    iconBg: 'bg-teal-500/10',
    iconColor: 'text-teal-600',
  },
  {
    title: 'Structured Workout Plans',
    desc: 'Program day-by-day workouts with exercises, sets, reps, weight guidance, rest time, and coaching notes. Clients log actual performance next to the plan.',
    icon: ClipboardList,
    iconBg: 'bg-orange-500/10',
    iconColor: 'text-orange-500',
  },
  {
    title: 'Daily Check-ins',
    desc: "Clients check off their week's habits each day. Streaks and completion rates update in real time. Week auto-advances based on their program start date.",
    icon: CheckCircle2,
    iconBg: 'bg-teal-500/10',
    iconColor: 'text-teal-600',
  },
  {
    title: 'Direct Messaging',
    desc: "Real-time WhatsApp-style chat between coach and client. Full inbox with unread badges, message threading, and date separators.",
    icon: MessageSquare,
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-500',
  },
  {
    title: 'Progress Photos',
    desc: 'Clients upload progress photos with optional weight. Coaches see a photo grid, before/after comparison, and an auto-generated weight trend chart.',
    icon: Camera,
    iconBg: 'bg-purple-500/10',
    iconColor: 'text-purple-500',
  },
  {
    title: 'Workout History',
    desc: "Clients log free-form workouts (type, duration, RPE, exercises). Coaches see a full history and a weekly volume bar chart across the last 8 weeks.",
    icon: Dumbbell,
    iconBg: 'bg-rose-500/10',
    iconColor: 'text-rose-500',
  },
  {
    title: 'AI Daily Digest',
    desc: "One tap gives you an AI summary of who checked in, who's struggling, who's on a hot streak — written in your coaching style.",
    icon: Sparkles,
    iconBg: 'bg-purple-500/10',
    iconColor: 'text-purple-500',
  },
  {
    title: 'Health Profiles',
    desc: 'Clients log weight, height, BMI, blood pressure, heart rate, blood sugar, body fat, injuries, and medications — all visible to their coach.',
    icon: Heart,
    iconBg: 'bg-red-500/10',
    iconColor: 'text-red-500',
  },
  {
    title: 'Team Dashboard',
    desc: "See every client's check-in status, active program, current week, streak, and 30-day completion rate in one clean view.",
    icon: LayoutDashboard,
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-500',
  },
  {
    title: 'Completion Insights',
    desc: "Spot habit trends across 30 days. See planned vs actual workout performance side by side for every client.",
    icon: TrendingUp,
    iconBg: 'bg-teal-500/10',
    iconColor: 'text-teal-600',
  },
  {
    title: 'AI Coaching Identity',
    desc: 'Configure your specialty, philosophy, and communication style. Upload certifications as PDFs — the AI reads them and uses them as context.',
    icon: Bot,
    iconBg: 'bg-orange-500/10',
    iconColor: 'text-orange-500',
  },
  {
    title: 'Invite Code System',
    desc: 'Each coach gets a unique invite code. Clients enter it at signup and are automatically linked. Share via link or copy code.',
    icon: QrCode,
    iconBg: 'bg-indigo-500/10',
    iconColor: 'text-indigo-500',
  },
] as const

const pillars = [
  {
    label: 'Built for coaches',
    desc: 'Every feature was designed around the actual workflow of a fitness coach managing multiple clients.',
    icon: Users,
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-500',
  },
  {
    label: 'Powered by Claude AI',
    desc: "Anthropic's Claude powers every AI feature — from digests to certificate parsing to coaching previews.",
    icon: Sparkles,
    iconBg: 'bg-purple-500/10',
    iconColor: 'text-purple-500',
  },
  {
    label: 'Privacy first',
    desc: "Client health data is stored with row-level security. Only you and your clients can see their data.",
    icon: ShieldCheck,
    iconBg: 'bg-teal-500/10',
    iconColor: 'text-teal-600',
  },
] as const

const faqs = [
  {
    q: 'Who is Coacheckin for?',
    a: "Personal trainers, online fitness coaches, and health coaches who manage multiple clients. If you're building programs in spreadsheets, tracking habits in notes apps, or manually following up on check-ins — this replaces all of that. The AI handles the time-consuming parts: summarising client progress, flagging who needs attention, and writing updates in your voice so you spend your time coaching, not administrating.",
  },
  {
    q: 'How does the Program Builder work?',
    a: "You create a named program with a duration (e.g. 8 weeks), then configure each week: which habits the client should focus on and what workouts they'll do each day. Each workout day can have exercises with sets, reps, weight guidance, rest time, and coaching notes. You can copy a full week to the next with one click and modify from there. Assign the program to any client with a start date — the AI tracks their adherence from day one and surfaces patterns you'd otherwise miss.",
  },
  {
    q: 'How do clients log their workouts?',
    a: "Clients see a 'Today's Workout' card on their dashboard showing the planned exercises. They enter their actual sets, reps, and weight used next to each exercise, then tap Complete. Coaches see planned vs actual side by side — and the AI uses that performance data in your daily digest to highlight clients who are consistently under- or over-performing their plan.",
  },
  {
    q: 'How does messaging work?',
    a: "Both coaches and clients have a real-time inbox with instant message delivery. Before you even open a conversation, the AI digest has already flagged which clients you should check in with today — so every message you send is intentional, not reactive.",
  },
  {
    q: 'How does the AI know my coaching style?',
    a: "You configure your AI Coaching Identity — your speciality, philosophy, communication style, and red flags to watch for. You can also upload certifications as PDFs which the AI reads and uses as context. Every digest, insight, and suggested program adjustment is written in your voice, not a generic chatbot. The longer you use it, the more it sounds like you.",
  },
  {
    q: 'What does the AI Daily Digest actually tell me?',
    a: "Every day, one tap gives you a full briefing on your entire client roster: who checked in, who skipped, who hit a personal best, who's been struggling for three days straight, and who you haven't heard from in a while. It reads exactly like a message from your most organised assistant — because it's trained on your coaching identity.",
  },
  {
    q: 'Can the AI adjust a client\'s program?',
    a: "Yes. On any client's program page, you can trigger an AI adjustment — it reviews their recent workout logs, habit completion rates, and health profile, then suggests specific changes to the plan with reasoning. You approve or modify before anything is applied. You stay in control; the AI does the analysis.",
  },
  {
    q: 'How do clients join?',
    a: "Every coach gets a unique invite code. Clients sign up, enter the code, and are automatically linked to you. They fill in their health profile — injuries, medications, goals, metrics — and the AI immediately has that context for every future insight and program suggestion.",
  },
  {
    q: "Is my clients' data safe?",
    a: "Yes. All data uses row-level security — clients can only see their own data, and you can only see data from clients linked to your account. Progress photos are served via signed URLs that expire after one hour. The AI never trains on your client data.",
  },
  {
    q: 'Is Coacheckin free?',
    a: "You can create an account and explore the full platform for free. The AI features — daily digest, program adjustments, coaching identity — are all included in the paid plan at $19/month.",
  },
]
