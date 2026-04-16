'use client'

import Link from 'next/link'
import { useState } from 'react'
import {
  Bot, LayoutDashboard, Heart, Sparkles, TrendingUp, Users,
  CheckCircle2, ChevronDown, Dumbbell, ShieldCheck,
  Upload, Eye, QrCode, Moon, Activity,
} from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex flex-col">

      {/* ── Nav ─────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-[var(--border-8)] bg-[var(--bg-base)]/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between gap-4">
          <span className="font-bold text-[var(--fg)] tracking-tight shrink-0">FitCoach AI</span>
          <nav className="hidden sm:flex items-center gap-5 text-sm text-[var(--fg-50)]">
            <a href="#how-it-works" className="hover:text-[var(--fg)] transition-colors">How it works</a>
            <a href="#features" className="hover:text-[var(--fg)] transition-colors">Features</a>
            <a href="#about" className="hover:text-[var(--fg)] transition-colors">About</a>
            <a href="#faq" className="hover:text-[var(--fg)] transition-colors">FAQ</a>
          </nav>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/login"
              className="px-4 py-1.5 text-sm font-medium text-[var(--fg-70)] hover:text-[var(--fg)] transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="px-4 py-1.5 text-sm font-semibold rounded-xl bg-[var(--cta)] hover:bg-[var(--cta-hover)] text-[var(--cta-on-solid)] transition-colors"
            >
              Try for free
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────── */}
      <section className="flex flex-col items-center justify-center text-center px-5 py-24 sm:py-36">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-tint)] border border-[var(--accent-border-sub)] text-xs font-semibold text-[var(--accent-fg)] mb-6">
          <Sparkles className="h-3 w-3" />
          AI-powered fitness coaching
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold leading-tight tracking-tight max-w-2xl mb-5">
          Coach smarter.{' '}
          <span className="text-[var(--accent-fg)]">Let AI do the heavy lifting.</span>
        </h1>

        <p className="text-[var(--fg-60)] text-lg sm:text-xl max-w-xl mb-10 leading-relaxed">
          FitCoach AI gives coaches an intelligent command centre — track habits, monitor client health, and get daily AI digests that surface who needs attention and who is crushing it.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Link
            href="/signup"
            className="w-full sm:w-auto px-7 py-3.5 text-base font-semibold rounded-2xl bg-[var(--cta)] hover:bg-[var(--cta-hover)] text-[var(--cta-on-solid)] shadow-lg shadow-[var(--cta-shadow)] transition-all text-center"
          >
            Start for free
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto px-7 py-3.5 text-base font-medium rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] text-[var(--fg-70)] transition-all text-center"
          >
            Sign in
          </Link>
        </div>

        <a href="#how-it-works" className="mt-16 flex flex-col items-center gap-1 text-xs text-[var(--fg-30)] hover:text-[var(--fg-50)] transition-colors">
          See how it works
          <ChevronDown className="h-4 w-4 animate-bounce" />
        </a>
      </section>

      {/* ── How it Works ────────────────────────────── */}
      <section id="how-it-works" className="bg-[var(--bg-surface)] border-t border-[var(--border-8)]">
        <div className="max-w-5xl mx-auto px-5 py-20 sm:py-28">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-3">How it works</h2>
          <p className="text-center text-[var(--fg-50)] mb-16 max-w-md mx-auto">
            Up and running in minutes. No complicated setup.
          </p>

          <div className="grid sm:grid-cols-3 gap-8 relative">
            {/* Connector line — desktop only */}
            <div className="hidden sm:block absolute top-6 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-px bg-[var(--border-8)]" />

            {steps.map((step, i) => (
              <div key={step.title} className="flex flex-col items-center text-center gap-4">
                <div className="relative z-10 h-12 w-12 rounded-full bg-[var(--bg-base)] border-2 border-[var(--accent-border)] flex items-center justify-center text-sm font-bold text-[var(--accent-fg)]">
                  {i + 1}
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{step.title}</h3>
                  <p className="text-sm text-[var(--fg-50)] leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────── */}
      <section id="features" className="border-t border-[var(--border-8)]">
        <div className="max-w-5xl mx-auto px-5 py-20 sm:py-28">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-3">Everything you need</h2>
          <p className="text-center text-[var(--fg-50)] mb-14 max-w-md mx-auto">
            Built for real coaches. Designed to keep clients accountable.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-[var(--bg-surface)] border border-[var(--border-8)] rounded-2xl p-5 flex flex-col gap-3"
              >
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${f.iconBg}`}>
                  <f.icon className={`h-5 w-5 ${f.iconColor}`} />
                </div>
                <h3 className="font-semibold">{f.title}</h3>
                <p className="text-sm text-[var(--fg-50)] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── About ───────────────────────────────────── */}
      <section id="about" className="bg-[var(--bg-surface)] border-t border-[var(--border-8)]">
        <div className="max-w-5xl mx-auto px-5 py-20 sm:py-28">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6">About FitCoach AI</h2>
            <p className="text-[var(--fg-60)] leading-relaxed mb-5">
              FitCoach AI was built out of a simple frustration: coaches were spending more time chasing check-ins and writing status updates than actually coaching. We set out to fix that.
            </p>
            <p className="text-[var(--fg-60)] leading-relaxed mb-5">
              The platform combines habit tracking, health monitoring, and AI — powered by Claude — into one clean interface that works on any device. Coaches get a real-time view of their whole team, and the AI learns each coach's unique style, philosophy, and credentials so every insight it generates sounds like them.
            </p>
            <p className="text-[var(--fg-60)] leading-relaxed">
              Whether you coach 3 clients or 300, FitCoach AI scales with you. Your clients get a simple daily check-in experience. You get the intelligence layer to coach at your best.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-5 mt-14">
            {pillars.map((p) => (
              <div key={p.label} className="flex flex-col items-center text-center gap-3 bg-[var(--bg-elevated)] border border-[var(--border-8)] rounded-2xl p-6">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${p.iconBg}`}>
                  <p.icon className={`h-5 w-5 ${p.iconColor}`} />
                </div>
                <p className="font-semibold text-sm">{p.label}</p>
                <p className="text-xs text-[var(--fg-40)] leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────── */}
      <section id="faq" className="border-t border-[var(--border-8)]">
        <div className="max-w-3xl mx-auto px-5 py-20 sm:py-28">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-3">Frequently asked questions</h2>
          <p className="text-center text-[var(--fg-50)] mb-14">
            Still have questions? We have answers.
          </p>

          <div className="flex flex-col gap-3">
            {faqs.map((faq) => (
              <FAQItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ──────────────────────────────── */}
      <section className="bg-[var(--bg-surface)] border-t border-[var(--border-8)]">
        <div className="max-w-5xl mx-auto px-5 py-20 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-tint)] border border-[var(--accent-border-sub)] text-xs font-semibold text-[var(--accent-fg)] mb-6">
            <Sparkles className="h-3 w-3" />
            Free to get started
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Ready to coach at your best?
          </h2>
          <p className="text-[var(--fg-50)] mb-8 max-w-sm mx-auto">
            Join coaches already using AI to give every client the attention they deserve.
          </p>
          <Link
            href="/signup"
            className="inline-block px-8 py-3.5 text-base font-semibold rounded-2xl bg-[var(--cta)] hover:bg-[var(--cta-hover)] text-[var(--cta-on-solid)] shadow-lg shadow-[var(--cta-shadow)] transition-all"
          >
            Create your free account
          </Link>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────── */}
      <footer className="border-t border-[var(--border-8)] py-8">
        <div className="max-w-5xl mx-auto px-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-bold text-[var(--fg)] tracking-tight">FitCoach AI</span>
          <div className="flex items-center gap-6 text-sm text-[var(--fg-40)]">
            <a href="#how-it-works" className="hover:text-[var(--fg-70)] transition-colors">How it works</a>
            <a href="#features" className="hover:text-[var(--fg-70)] transition-colors">Features</a>
            <a href="#faq" className="hover:text-[var(--fg-70)] transition-colors">FAQ</a>
            <Link href="/login" className="hover:text-[var(--fg-70)] transition-colors">Sign in</Link>
          </div>
          <p className="text-xs text-[var(--fg-30)]">
            &copy; {new Date().getFullYear()} FitCoach AI
          </p>
        </div>
      </footer>

    </div>
  )
}

/* ── FAQ accordion item ─────────────────────────── */
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-[var(--border-8)] rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left gap-4 hover:bg-[var(--bg-hover)] transition-colors"
      >
        <span className="font-medium text-sm">{q}</span>
        <ChevronDown className={`h-4 w-4 text-[var(--fg-40)] shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-5 pb-5 text-sm text-[var(--fg-50)] leading-relaxed border-t border-[var(--border-8)] pt-4">
          {a}
        </div>
      )}
    </div>
  )
}

/* ── Data ───────────────────────────────────────── */
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
    desc: 'Get daily AI digests, monitor streaks, and let the AI surface who needs attention — so you can focus on coaching.',
  },
]

const features = [
  {
    title: 'Custom Habit Builder',
    desc: 'Create any habit for any client — nutrition, sleep, movement, mindset. Fully tailored to their goals.',
    icon: Dumbbell,
    iconBg: 'bg-[var(--accent-tint)]',
    iconColor: 'text-[var(--accent-fg)]',
  },
  {
    title: 'Daily Check-ins',
    desc: 'Clients check off habits each day from their phone. Streaks and completion rates update in real time.',
    icon: CheckCircle2,
    iconBg: 'bg-[var(--accent-tint)]',
    iconColor: 'text-[var(--accent-fg)]',
  },
  {
    title: 'AI Daily Digest',
    desc: "One tap gives you an AI-written summary of who checked in, who's struggling, and who's on a hot streak.",
    icon: Sparkles,
    iconBg: 'bg-purple-500/15',
    iconColor: 'text-purple-400',
  },
  {
    title: 'Health Profiles',
    desc: 'Clients log weight, height, blood pressure, heart rate, blood sugar, cholesterol, and primary fitness goal.',
    icon: Heart,
    iconBg: 'bg-red-500/15',
    iconColor: 'text-red-400',
  },
  {
    title: 'BMI & Vitals Tracker',
    desc: 'BMI is calculated automatically from height and weight. Medical data gives the AI crucial context.',
    icon: Activity,
    iconBg: 'bg-red-500/15',
    iconColor: 'text-red-400',
  },
  {
    title: 'Team Dashboard',
    desc: "See every client's check-in status, streak, and 30-day completion rate in one clean view.",
    icon: LayoutDashboard,
    iconBg: 'bg-blue-500/15',
    iconColor: 'text-blue-400',
  },
  {
    title: 'Completion Insights',
    desc: "Spot trends across 30 days of data to understand what's working and what isn't — per client.",
    icon: TrendingUp,
    iconBg: 'bg-teal-500/15',
    iconColor: 'text-teal-400',
  },
  {
    title: 'AI Coaching Identity',
    desc: 'Configure your specialty, philosophy, communication style, and red flags. The AI becomes an extension of you.',
    icon: Bot,
    iconBg: 'bg-orange-500/15',
    iconColor: 'text-orange-400',
  },
  {
    title: 'Certificate Parsing',
    desc: 'Upload your credentials as PDFs or images. The AI reads and summarises them, adding context to every response.',
    icon: Upload,
    iconBg: 'bg-orange-500/15',
    iconColor: 'text-orange-400',
  },
  {
    title: 'AI Preview',
    desc: 'Test exactly how the AI will respond to client scenarios before it goes live — using your settings and credentials.',
    icon: Eye,
    iconBg: 'bg-yellow-500/15',
    iconColor: 'text-yellow-400',
  },
  {
    title: 'Invite Code System',
    desc: 'Each coach gets a unique invite code. Clients use it during signup and are automatically linked to their coach.',
    icon: QrCode,
    iconBg: 'bg-indigo-500/15',
    iconColor: 'text-indigo-400',
  },
  {
    title: 'Dark & Light Mode',
    desc: 'Looks great in any environment. Switches automatically with your system preference or manually in settings.',
    icon: Moon,
    iconBg: 'bg-[var(--bg-elevated)]',
    iconColor: 'text-[var(--fg-50)]',
  },
] as const

const pillars = [
  {
    label: 'Built for coaches',
    desc: 'Every feature was designed around the actual workflow of a fitness coach managing multiple clients.',
    icon: Users,
    iconBg: 'bg-blue-500/15',
    iconColor: 'text-blue-400',
  },
  {
    label: 'Powered by Claude AI',
    desc: "Anthropic's Claude powers every AI feature — from digests to certificate parsing to AI previews.",
    icon: Sparkles,
    iconBg: 'bg-purple-500/15',
    iconColor: 'text-purple-400',
  },
  {
    label: 'Privacy first',
    desc: "Client health data is stored securely with row-level security. Only you and your clients can see their data.",
    icon: ShieldCheck,
    iconBg: 'bg-[var(--accent-tint)]',
    iconColor: 'text-[var(--accent-fg)]',
  },
] as const

const faqs = [
  {
    q: 'Who is FitCoach AI for?',
    a: "FitCoach AI is built for personal trainers, online fitness coaches, and health coaches who manage multiple clients. If you're tracking habits, monitoring client health, or writing weekly check-in summaries manually — this replaces all of that.",
  },
  {
    q: 'How does the AI know my coaching style?',
    a: "You configure your AI Coaching Identity — your speciality, philosophy, communication style, and any red flags to watch for. You can also upload your certifications and credentials as PDFs, which the AI reads and uses as context. The result is a coaching voice that sounds like you, not a generic chatbot.",
  },
  {
    q: "How do clients join?",
    a: "Every coach gets a unique invite code visible on their dashboard. Share it with your clients — they sign up at the app URL, enter the code, and are automatically linked to you. They then fill in their health profile so you have full context from day one.",
  },
  {
    q: "Is my clients' health data safe?",
    a: "Yes. All data is stored in Supabase with row-level security policies — your clients can only see their own data, and you can only see the data of clients linked to your account. No one else has access.",
  },
  {
    q: 'Can I use FitCoach AI on my phone?',
    a: 'Absolutely. The entire app is designed mobile-first. Coaches get a full-featured mobile dashboard with a bottom nav. Clients have a simple daily check-in interface that takes under a minute to complete.',
  },
  {
    q: 'What is the AI Daily Digest?',
    a: 'The AI Digest is a one-tap summary of your whole team. It tells you who checked in today, who is on a streak, who has been slipping, and any patterns worth noting — all written in your coaching style. It uses your AI Coaching Identity settings so the tone is always yours.',
  },
  {
    q: 'Is FitCoach AI free?',
    a: "You can create an account and get started for free. Sign up to explore the platform with your first clients.",
  },
  {
    q: 'What technology powers FitCoach AI?',
    a: "FitCoach AI is built on Next.js and Supabase, with all AI features powered by Anthropic's Claude — one of the most capable and safety-focused AI models available.",
  },
]
