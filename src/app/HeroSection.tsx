'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Sparkles, ChevronDown, Heart, Flame, Wind, Activity,
  CheckCircle2, XCircle,
} from 'lucide-react'
import { CoachCheckinIcon } from '@/components/shared/Logo'

/* ─────────────────────────────────────────────────────────
   Live metrics
───────────────────────────────────────────────────────── */
interface Metrics { hr: number; kcal: number; vo2: number; rec: number }
const BASE: Metrics = { hr: 72, kcal: 1847, vo2: 52.4, rec: 87 }

function liveMetrics(t: number): Metrics {
  return {
    hr:   Math.round(BASE.hr   + Math.sin(t / 3200) * 4),
    kcal: Math.round(BASE.kcal + t / 4000),
    vo2:  Math.round((BASE.vo2 + Math.sin(t / 7000) * 0.4) * 10) / 10,
    rec:  Math.round(BASE.rec  + Math.sin(t / 9000) * 3),
  }
}

/* ─────────────────────────────────────────────────────────
   Mock clients for dashboard card
───────────────────────────────────────────────────────── */
const CLIENTS = [
  { n: 'Sarah M.', ini: 'SM', checked: true,  streak: 12, pct: 92 },
  { n: 'James K.', ini: 'JK', checked: true,  streak: 5,  pct: 67 },
  { n: 'Priya R.', ini: 'PR', checked: false, streak: 8,  pct: 40 },
]

const AI_LINES = [
  "Sarah is on a 12-day streak 🔥 Consider increasing difficulty.",
  "James skipped leg day twice — worth a check-in today.",
  "Priya's recovery dropped. Suggest a rest day tomorrow.",
]

/* ─────────────────────────────────────────────────────────
   Component
───────────────────────────────────────────────────────── */
export function HeroSection() {
  const [metrics, setMetrics] = useState<Metrics>(BASE)
  const [aiLine, setAiLine]   = useState('')
  const [aiIdx, setAiIdx]     = useState(0)
  const [charIdx, setCharIdx] = useState(0)

  useEffect(() => {
    const t0 = Date.now()
    const id = setInterval(() => setMetrics(liveMetrics(Date.now() - t0)), 120)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const full = AI_LINES[aiIdx]
    if (charIdx < full.length) {
      const id = setTimeout(() => {
        setAiLine(full.slice(0, charIdx + 1))
        setCharIdx(c => c + 1)
      }, 42)
      return () => clearTimeout(id)
    }
    const id = setTimeout(() => {
      const next = (aiIdx + 1) % AI_LINES.length
      setAiIdx(next)
      setCharIdx(0)
      setAiLine('')
    }, 3200)
    return () => clearTimeout(id)
  }, [aiIdx, charIdx])

  return (
    <section
      className="relative min-h-screen flex flex-col overflow-hidden"
      style={{ background: '#faf8f4' }}
    >
      {/* ── Ambient glows — adjusted for light bg ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-48 -left-48 w-[700px] h-[700px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(45,212,191,0.13) 0%, transparent 65%)' }}
        />
        <div
          className="absolute top-1/4 -right-32 w-[560px] h-[560px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(45,212,191,0.07) 0%, transparent 65%)' }}
        />
        <div
          className="absolute bottom-16 right-1/3 w-[320px] h-[320px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(249,115,22,0.07) 0%, transparent 65%)' }}
        />
        {/* Subtle dot grid */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: 'radial-gradient(circle, #042F2E 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      {/* ── Main content ─────────────────────────────────── */}
      <div className="relative z-10 flex-1 flex flex-col justify-center">
        <div className="max-w-5xl mx-auto px-5 w-full py-20 sm:py-28 grid lg:grid-cols-2 gap-12 items-center">

          {/* LEFT — headline + CTAs */}
          <div className="flex flex-col items-start">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full
              border text-xs font-semibold mb-6"
              style={{
                background: 'rgba(45,212,191,0.08)',
                borderColor: 'rgba(45,212,191,0.30)',
                color: '#0D9488',
              }}>
              <span className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-pulse" />
              AI-powered coaching platform
            </div>

            <h1 className="text-4xl sm:text-5xl xl:text-6xl font-extrabold leading-[1.08] tracking-tight mb-5"
              style={{ color: '#042F2E' }}>
              Coach smarter.{' '}
              <span
                className="text-transparent bg-clip-text"
                style={{ backgroundImage: 'linear-gradient(135deg, #0D9488 0%, #2DD4BF 50%, #F97316 100%)' }}
              >
                Let AI do the heavy lifting.
              </span>
            </h1>

            <p className="text-lg leading-relaxed max-w-lg mb-8" style={{ color: '#78716C' }}>
              Coacheckin gives coaches an intelligent command centre — track habits, monitor client progress, and get daily AI digests that surface who needs attention and who is crushing it.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
              <Link
                href="/signup"
                className="px-7 py-3.5 text-base font-semibold rounded-2xl text-white text-center
                  transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: 'linear-gradient(135deg, #F97316 0%, #EA6C0A 100%)',
                  boxShadow: '0 8px 32px rgba(249,115,22,0.30)',
                }}
              >
                Start for free
              </Link>
              <Link
                href="/login"
                className="px-7 py-3.5 text-base font-medium rounded-2xl text-center transition-all"
                style={{
                  color: '#042F2E',
                  border: '1.5px solid rgba(4,47,46,0.15)',
                  background: 'rgba(4,47,46,0.03)',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(4,47,46,0.07)'
                  ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(4,47,46,0.25)'
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(4,47,46,0.03)'
                  ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(4,47,46,0.15)'
                }}
              >
                Sign in
              </Link>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-2 mt-8">
              <div className="flex -space-x-2">
                {['TK', 'SM', 'JR', 'PM'].map((init) => (
                  <div
                    key={init}
                    className="h-7 w-7 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 border-2 flex items-center justify-center text-[9px] font-bold text-white"
                    style={{ borderColor: '#faf8f4' }}
                  >
                    {init}
                  </div>
                ))}
              </div>
              <p className="text-xs text-stone-400">Join coaches already coaching at their best</p>
            </div>
          </div>

          {/* RIGHT — dark dashboard card (the cockpit glimpse) */}
          <div className="hidden lg:flex justify-center items-center">
            <div
              className="w-[340px] rounded-2xl border overflow-hidden"
              style={{
                background: 'rgba(10,18,30,0.92)',
                backdropFilter: 'blur(24px)',
                borderColor: 'rgba(45,212,191,0.22)',
                boxShadow: '0 32px 80px rgba(4,47,46,0.25), 0 0 0 1px rgba(45,212,191,0.08)',
              }}
            >
              {/* Card header */}
              <div
                className="flex items-center justify-between px-4 py-3 border-b"
                style={{ borderColor: 'rgba(45,212,191,0.12)' }}
              >
                <div className="flex items-center gap-2">
                  <CoachCheckinIcon size={20} />
                  <span className="text-xs font-semibold text-slate-200">Coacheckin</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-medium text-teal-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-teal-400 animate-pulse" />
                  LIVE
                </div>
              </div>

              {/* Client rows */}
              <div className="px-4 pt-3 pb-1">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Today&apos;s Check-ins
                </p>
                {CLIENTS.map((c) => (
                  <div
                    key={c.n}
                    className="flex items-center gap-3 py-2.5 border-b last:border-b-0"
                    style={{ borderColor: 'rgba(255,255,255,0.05)' }}
                  >
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-teal-800 to-teal-600 border border-teal-500/30 flex items-center justify-center text-[10px] font-bold text-teal-200 shrink-0">
                      {c.ini}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-200">{c.n}</span>
                        {c.checked
                          ? <CheckCircle2 className="h-3.5 w-3.5 text-teal-400" />
                          : <XCircle className="h-3.5 w-3.5 text-slate-600" />}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1 rounded-full bg-white/10">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${c.pct}%`,
                              background: c.pct >= 80 ? '#14B8A6' : c.pct >= 50 ? '#F59E0B' : '#EF4444',
                            }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-500 w-7 text-right">{c.pct}%</span>
                        <span className="flex items-center gap-0.5 text-[10px] text-orange-400">
                          <Flame className="h-2.5 w-2.5" />{c.streak}d
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* AI insight typing box */}
              <div
                className="mx-4 mb-4 mt-2 rounded-xl p-3"
                style={{ background: 'rgba(13,148,136,0.10)', border: '1px solid rgba(45,212,191,0.15)' }}
              >
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Sparkles className="h-3 w-3 text-teal-400" />
                  <span className="text-[10px] font-semibold text-teal-400 uppercase tracking-wider">AI Insight</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed min-h-[2.5rem]">
                  {aiLine}
                  <span className="inline-block w-0.5 h-3 bg-teal-400 animate-pulse ml-0.5 align-middle" />
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Scroll hint */}
        <div className="flex justify-center pb-10 relative z-10">
          <a
            href="#how-it-works"
            className="flex flex-col items-center gap-1 text-xs text-stone-400 hover:text-stone-600 transition-colors"
          >
            Scroll to explore
            <ChevronDown className="h-4 w-4 animate-bounce" />
          </a>
        </div>
      </div>

      {/* ── Dark metrics strip — first glimpse of the product interior ── */}
      <div
        className="relative z-10 border-t"
        style={{
          background: '#042F2E',
          borderColor: 'rgba(45,212,191,0.15)',
        }}
      >
        <div className="max-w-5xl mx-auto px-5 py-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: Heart,    label: 'Heart Rate',      value: `${metrics.hr}`,                   unit: 'BPM',       color: 'text-red-400',    bg: 'bg-red-500/10'    },
            { icon: Flame,    label: 'Calories Burned', value: `${metrics.kcal.toLocaleString()}`, unit: 'kcal',      color: 'text-orange-400', bg: 'bg-orange-500/10' },
            { icon: Wind,     label: 'VO₂ Max',         value: `${metrics.vo2}`,                   unit: 'ml/kg/min', color: 'text-teal-400',   bg: 'bg-teal-500/10'   },
            { icon: Activity, label: 'Recovery Score',  value: `${metrics.rec}`,                   unit: '%',         color: 'text-blue-400',   bg: 'bg-blue-500/10'   },
          ].map((m) => (
            <div key={m.label} className="flex items-center gap-3">
              <div className={`h-9 w-9 rounded-xl ${m.bg} flex items-center justify-center shrink-0`}>
                <m.icon className={`h-4 w-4 ${m.color}`} />
              </div>
              <div className="min-w-0">
                <div className="flex items-baseline gap-1">
                  <span className={`text-lg font-bold tabular-nums ${m.color}`}>{m.value}</span>
                  <span className="text-[10px] text-teal-900/60" style={{ color: 'rgba(255,255,255,0.30)' }}>{m.unit}</span>
                </div>
                <p className="text-[10px] truncate" style={{ color: 'rgba(255,255,255,0.30)' }}>{m.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
