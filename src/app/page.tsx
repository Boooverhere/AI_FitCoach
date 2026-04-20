'use client'

import Link from 'next/link'
import { useState } from 'react'
import {
  Bot, LayoutDashboard, Heart, Sparkles, TrendingUp, Users,
  CheckCircle2, ChevronDown, Dumbbell, ShieldCheck, QrCode,
  MessageSquare, Camera, Layers, ClipboardList,
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

export default function LandingPage() {
  return (
    <div className="flex flex-col" style={{ background: BG, color: '#44403C' }}>

      {/* ── Nav ─────────────────────────────────────── */}
      <header
        className="sticky top-0 z-40 border-b backdrop-blur-md"
        style={{ background: 'rgba(250,248,244,0.92)', borderColor: BORDER }}
      >
        <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between gap-4">
          <Logo iconSize={26} wordmarkClass="text-[#042F2E]" className="shrink-0" />

          <nav className="hidden sm:flex items-center gap-6 text-sm text-stone-500">
            {['#how-it-works', '#features', '#about', '#faq'].map((href) => (
              <a key={href} href={href}
                className="hover:text-[#042F2E] transition-colors capitalize">
                {href.replace('#', '').replace('-', ' ')}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2 shrink-0">
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

      {/* ── Footer ───────────────────────────────────── */}
      <footer className="border-t py-8" style={{ background: '#021815', borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="max-w-5xl mx-auto px-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo iconSize={22} wordmarkClass="text-white/70 text-sm" />
          <div className="flex items-center gap-6 text-xs" style={{ color: 'rgba(255,255,255,0.30)' }}>
            <a href="#how-it-works" className="hover:text-white/60 transition-colors">How it works</a>
            <a href="#features" className="hover:text-white/60 transition-colors">Features</a>
            <a href="#faq" className="hover:text-white/60 transition-colors">FAQ</a>
            <Link href="/login" className="hover:text-white/60 transition-colors">Sign in</Link>
          </div>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.18)' }}>&copy; {new Date().getFullYear()} Coacheckin</p>
        </div>
      </footer>

    </div>
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
    a: "Personal trainers, online fitness coaches, and health coaches who manage multiple clients. If you're building programs in spreadsheets, tracking habits in notes apps, or manually following up on check-ins — this replaces all of that.",
  },
  {
    q: 'How does the Program Builder work?',
    a: "You create a named program with a duration (e.g. 8 weeks), then configure each week: which habits the client should focus on and what workouts they'll do each day. Each workout day can have exercises with sets, reps, weight guidance, rest time, and coaching notes. You can copy a full week to the next with one click and modify from there. Assign the program to any client with a start date — they'll see their habits and workouts automatically each day.",
  },
  {
    q: 'How do clients log their workouts?',
    a: "If their program includes a workout for today, they'll see a 'Today's Workout' card on their dashboard showing the planned exercises. They enter their actual sets, reps, and weight used next to each exercise, then tap Complete. Coaches see planned vs actual side by side in the Plan tab on the client detail page.",
  },
  {
    q: 'How does messaging work?',
    a: "Both coaches and clients have a Messages section with real-time chat. Messages are delivered instantly via Supabase Realtime. Coaches see an inbox with all clients sorted by latest message, unread badges, and message previews.",
  },
  {
    q: 'How does the AI know my coaching style?',
    a: "You configure your AI Coaching Identity — your speciality, philosophy, communication style, and red flags to watch for. You can also upload certifications as PDFs which the AI reads and uses as context. Every digest and insight is written in your voice, not a generic chatbot.",
  },
  {
    q: 'How do clients join?',
    a: "Every coach gets a unique invite code on their dashboard. Share it with your clients — they sign up, enter the code, and are automatically linked to you. They then fill in their health profile and progress photos so you have full context from day one.",
  },
  {
    q: "Is my clients' data safe?",
    a: "Yes. All data uses Supabase row-level security — clients can only see their own data, and you can only see data from clients linked to your account. Progress photos use signed URLs that expire after one hour.",
  },
  {
    q: 'Can I use it on mobile?',
    a: "Absolutely. The entire app is mobile-first with a bottom navigation bar. Clients can check in, log workouts, upload progress photos, and message you — all in under a minute from their phone.",
  },
  {
    q: 'Is Coacheckin free?',
    a: "You can create an account and get started for free. Sign up to explore the full platform with your first clients.",
  },
]
