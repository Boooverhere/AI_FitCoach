'use client'

import Link from 'next/link'
import { useState } from 'react'
import {
  Bot, LayoutDashboard, Heart, Sparkles, TrendingUp, Users,
  CheckCircle2, ChevronDown, Dumbbell, ShieldCheck, Upload, QrCode, Zap,
} from 'lucide-react'
import { HeroSection } from './HeroSection'

/* ── shared dark-page tokens ────────────────────────────── */
const BG      = '#030B0A'
const BG_LIFT = '#060F0D'
const BORDER  = 'rgba(255,255,255,0.07)'
const BORDER_T= 'rgba(45,212,191,0.12)'
const CARD_BG = 'rgba(255,255,255,0.03)'

export default function LandingPage() {
  return (
    <div className="flex flex-col" style={{ background: BG, color: '#E2E8F0' }}>

      {/* ── Nav ─────────────────────────────────────── */}
      <header
        className="sticky top-0 z-40 border-b backdrop-blur-md"
        style={{ background: 'rgba(3,11,10,0.88)', borderColor: BORDER }}
      >
        <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <div className="h-7 w-7 rounded-lg bg-teal-500/20 flex items-center justify-center">
              <Zap className="h-3.5 w-3.5 text-teal-400" fill="currentColor" />
            </div>
            <span className="font-bold text-white tracking-tight">FitCoach AI</span>
          </div>

          <nav className="hidden sm:flex items-center gap-6 text-sm text-slate-500">
            {['#how-it-works', '#features', '#about', '#faq'].map((href) => (
              <a key={href} href={href}
                className="hover:text-slate-200 transition-colors capitalize">
                {href.replace('#', '').replace('-', ' ')}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <Link href="/login"
              className="px-4 py-1.5 text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors">
              Sign in
            </Link>
            <Link href="/signup"
              className="px-4 py-1.5 text-sm font-semibold rounded-xl text-white transition-all hover:scale-[1.02]"
              style={{ background: '#F97316', boxShadow: '0 0 18px rgba(249,115,22,0.30)' }}>
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
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-white mb-3">
            Up and running in minutes
          </h2>
          <p className="text-center text-slate-500 mb-16 max-w-md mx-auto text-sm">
            No complicated setup. No technical knowledge required.
          </p>

          <div className="grid sm:grid-cols-3 gap-10 relative">
            {/* Connector gradient line */}
            <div className="hidden sm:block absolute top-6 left-[calc(16.67%+2rem)] right-[calc(16.67%+2rem)] h-px"
              style={{ background: 'linear-gradient(to right, transparent, rgba(45,212,191,0.25), transparent)' }} />

            {steps.map((step, i) => (
              <div key={step.title} className="flex flex-col items-center text-center gap-4">
                <div className="relative z-10 h-12 w-12 rounded-full flex items-center justify-center text-sm font-bold text-teal-400"
                  style={{ background: BG_LIFT, border: '1.5px solid rgba(45,212,191,0.35)' }}>
                  {i + 1}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-200 mb-1.5">{step.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
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
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-white mb-3">
            Everything a coach needs
          </h2>
          <p className="text-center text-slate-500 mb-14 max-w-md mx-auto text-sm">
            Built around real coaching workflows. Designed to keep clients accountable.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f) => (
              <div key={f.title}
                className="rounded-2xl p-5 flex flex-col gap-3 transition-colors hover:border-teal-500/20"
                style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
                <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${f.iconBg}`}>
                  <f.icon className={`h-4 w-4 ${f.iconColor}`} />
                </div>
                <h3 className="font-semibold text-slate-200 text-sm">{f.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── About ────────────────────────────────────── */}
      <section id="about" className="border-t" style={{ background: BG_LIFT, borderColor: BORDER }}>
        <div className="max-w-5xl mx-auto px-5 py-20 sm:py-28">
          <SectionLabel>About</SectionLabel>
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-white mb-10">
            Built to solve a real problem
          </h2>

          <div className="max-w-2xl mx-auto text-center mb-14">
            <p className="text-slate-400 leading-loose mb-5 text-sm sm:text-base">
              FitCoach AI was built out of a simple frustration: coaches were spending more time chasing check-ins and writing status updates than actually coaching. We set out to fix that.
            </p>
            <p className="text-slate-500 leading-loose text-sm sm:text-base">
              Whether you coach 3 clients or 300, FitCoach AI scales with you. The AI learns your voice, philosophy, and credentials — so every insight sounds like you, not a generic chatbot.
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
                <p className="font-semibold text-sm text-slate-200">{p.label}</p>
                <p className="text-xs text-slate-500 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────── */}
      <section id="faq" className="border-t" style={{ background: BG, borderColor: BORDER }}>
        <div className="max-w-2xl mx-auto px-5 py-20 sm:py-28">
          <SectionLabel>FAQ</SectionLabel>
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-white mb-3">
            Common questions
          </h2>
          <p className="text-center text-slate-500 text-sm mb-12">
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
        borderColor: BORDER,
        background: 'linear-gradient(180deg, #030B0A 0%, #0D2420 100%)',
      }}>
        <div className="max-w-5xl mx-auto px-5 py-24 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-6 text-xs font-semibold text-teal-400"
            style={{ background: 'rgba(13,148,136,0.12)', border: '1px solid rgba(45,212,191,0.20)' }}>
            <Sparkles className="h-3 w-3" />
            Free to get started
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 leading-tight">
            Ready to coach at your best?
          </h2>
          <p className="text-slate-500 mb-10 max-w-sm mx-auto text-sm leading-relaxed">
            Join coaches already using AI to give every client the attention they deserve.
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
      <footer className="border-t py-8" style={{ background: BG, borderColor: BORDER }}>
        <div className="max-w-5xl mx-auto px-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-teal-500/20 flex items-center justify-center">
              <Zap className="h-3 w-3 text-teal-400" fill="currentColor" />
            </div>
            <span className="font-bold text-slate-300 tracking-tight text-sm">FitCoach AI</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-slate-600">
            <a href="#how-it-works" className="hover:text-slate-400 transition-colors">How it works</a>
            <a href="#features" className="hover:text-slate-400 transition-colors">Features</a>
            <a href="#faq" className="hover:text-slate-400 transition-colors">FAQ</a>
            <Link href="/login" className="hover:text-slate-400 transition-colors">Sign in</Link>
          </div>
          <p className="text-xs text-slate-700">&copy; {new Date().getFullYear()} FitCoach AI</p>
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
    <div className="rounded-xl overflow-hidden transition-colors"
      style={{ border: `1px solid ${open ? 'rgba(45,212,191,0.18)' : BORDER}` }}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left gap-4 transition-colors"
        style={{ background: open ? 'rgba(13,148,136,0.06)' : 'transparent' }}
      >
        <span className="font-medium text-sm text-slate-200">{q}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${open ? 'rotate-180 text-teal-400' : 'text-slate-600'}`} />
      </button>
      {open && (
        <div className="px-5 pb-5 pt-3 text-sm text-slate-500 leading-relaxed"
          style={{ borderTop: `1px solid ${BORDER}` }}>
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
    desc: 'Add your coaching speciality, philosophy, and upload your certificates. The AI learns to speak in your voice.',
  },
  {
    title: 'Invite your clients',
    desc: 'Share your unique invite code. Clients sign up, complete their health profile, and are linked to you instantly.',
  },
  {
    title: 'Coach with AI superpowers',
    desc: 'Get daily AI digests, monitor streaks, and let AI surface who needs attention — so you can focus on coaching.',
  },
]

const features = [
  {
    title: 'Custom Habit Builder',
    desc: 'Create any habit for any client — nutrition, sleep, movement, mindset. Fully tailored to their goals.',
    icon: Dumbbell,
    iconBg: 'bg-teal-500/10',
    iconColor: 'text-teal-400',
  },
  {
    title: 'Daily Check-ins',
    desc: "Clients check off habits each day from their phone. Streaks and completion rates update in real time.",
    icon: CheckCircle2,
    iconBg: 'bg-teal-500/10',
    iconColor: 'text-teal-400',
  },
  {
    title: 'AI Daily Digest',
    desc: "One tap gives you an AI summary of who checked in, who's struggling, and who's on a hot streak.",
    icon: Sparkles,
    iconBg: 'bg-purple-500/10',
    iconColor: 'text-purple-400',
  },
  {
    title: 'Health Profiles',
    desc: 'Clients log weight, blood pressure, heart rate, blood sugar, cholesterol, and primary fitness goal.',
    icon: Heart,
    iconBg: 'bg-red-500/10',
    iconColor: 'text-red-400',
  },
  {
    title: 'Team Dashboard',
    desc: "See every client's check-in status, streak, and 30-day completion rate in one clean view.",
    icon: LayoutDashboard,
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-400',
  },
  {
    title: 'Completion Insights',
    desc: "Spot trends across 30 days to understand what's working and what isn't — per client.",
    icon: TrendingUp,
    iconBg: 'bg-teal-500/10',
    iconColor: 'text-teal-400',
  },
  {
    title: 'AI Coaching Identity',
    desc: 'Configure your specialty, philosophy, and communication style. The AI becomes an extension of you.',
    icon: Bot,
    iconBg: 'bg-orange-500/10',
    iconColor: 'text-orange-400',
  },
  {
    title: 'Certificate Parsing',
    desc: 'Upload your credentials as PDFs. The AI reads and summarises them, enriching every response with context.',
    icon: Upload,
    iconBg: 'bg-orange-500/10',
    iconColor: 'text-orange-400',
  },
  {
    title: 'Invite Code System',
    desc: 'Each coach gets a unique invite code. Clients use it during signup and are automatically linked to you.',
    icon: QrCode,
    iconBg: 'bg-indigo-500/10',
    iconColor: 'text-indigo-400',
  },
] as const

const pillars = [
  {
    label: 'Built for coaches',
    desc: 'Every feature was designed around the actual workflow of a fitness coach managing multiple clients.',
    icon: Users,
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-400',
  },
  {
    label: 'Powered by Claude AI',
    desc: "Anthropic's Claude powers every AI feature — from digests to certificate parsing to coaching previews.",
    icon: Sparkles,
    iconBg: 'bg-purple-500/10',
    iconColor: 'text-purple-400',
  },
  {
    label: 'Privacy first',
    desc: "Client health data is stored with row-level security. Only you and your clients can see their data.",
    icon: ShieldCheck,
    iconBg: 'bg-teal-500/10',
    iconColor: 'text-teal-400',
  },
] as const

const faqs = [
  {
    q: 'Who is FitCoach AI for?',
    a: "Personal trainers, online fitness coaches, and health coaches who manage multiple clients. If you're tracking habits, monitoring client health, or writing weekly summaries manually — this replaces all of that.",
  },
  {
    q: 'How does the AI know my coaching style?',
    a: "You configure your AI Coaching Identity — your speciality, philosophy, communication style, and any red flags to watch for. You can also upload certifications as PDFs, which the AI reads and uses as context. The result sounds like you, not a generic chatbot.",
  },
  {
    q: 'How do clients join?',
    a: "Every coach gets a unique invite code on their dashboard. Share it with your clients — they sign up, enter the code, and are automatically linked to you. They then fill in their health profile so you have full context from day one.",
  },
  {
    q: "Is my clients' health data safe?",
    a: "Yes. All data is stored in Supabase with row-level security policies — clients can only see their own data, and you can only see data from clients linked to your account.",
  },
  {
    q: 'Can I use it on mobile?',
    a: 'Absolutely. The app is mobile-first. Coaches get a full dashboard with a bottom nav. Clients have a simple daily check-in that takes under a minute.',
  },
  {
    q: 'What is the AI Daily Digest?',
    a: 'A one-tap team summary. It tells you who checked in, who is on a streak, who has been slipping, and any patterns worth noting — all written in your coaching style.',
  },
  {
    q: 'Is FitCoach AI free?',
    a: "You can create an account and get started for free. Sign up to explore the platform with your first clients.",
  },
]
