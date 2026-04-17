'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import {
  Sparkles, ChevronDown, Heart, Flame, Wind, Activity,
  CheckCircle2, XCircle, Zap,
} from 'lucide-react'

/* ─────────────────────────────────────────────────────────
   Canvas: falling data-stream columns + ambient particles
───────────────────────────────────────────────────────── */
const CHARS = 'BPMkcalHzVO₂01%♥~↑↓·89'
const TEAL = ['#2DD4BF', '#14B8A6', '#0D9488', '#5EEAD4']
const ORA  = ['#F97316', '#FB923C', '#FDBA74']
const FS   = 13
const COL_W = 22

interface Col {
  x: number; y: number; speed: number; len: number
  chars: string[]; pal: string[]; tick: number; rate: number
}
interface Ptcl {
  x: number; y: number; vx: number; vy: number
  r: number; a: number; decay: number; col: string
}

function makeCols(w: number, h: number): Col[] {
  return Array.from({ length: Math.floor(w / COL_W) }, (_, i) => ({
    x: i * COL_W + COL_W / 2,
    y: (Math.random() - 0.3) * h,
    speed: 0.6 + Math.random() * 1.8,
    len: 8 + Math.floor(Math.random() * 12),
    chars: Array.from({ length: 20 }, () => CHARS[Math.floor(Math.random() * CHARS.length)]),
    pal: Math.random() > 0.72 ? ORA : TEAL,
    tick: Math.floor(Math.random() * 12),
    rate: 4 + Math.floor(Math.random() * 8),
  }))
}

function makePtcl(w: number, h: number): Ptcl {
  const t = Math.random() > 0.4
  const pal = t ? TEAL : ORA
  return {
    x: Math.random() * w, y: h + 5,
    vx: (Math.random() - 0.5) * 0.5,
    vy: -(0.4 + Math.random() * 0.8),
    r: 1 + Math.random() * 2.5,
    a: 0.4 + Math.random() * 0.6,
    decay: 0.0015 + Math.random() * 0.003,
    col: pal[Math.floor(Math.random() * pal.length)],
  }
}

/* ─────────────────────────────────────────────────────────
   SVG wave path helper
───────────────────────────────────────────────────────── */
function wavePath(W: number, amp: number, freq: number, phase = 0): string {
  const pts: string[] = []
  const steps = 400
  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * W
    const y = 30 + Math.sin((i / steps) * Math.PI * 2 * freq + phase) * amp
    pts.push(i === 0 ? `M${x},${y}` : `L${x},${y}`)
  }
  return pts.join(' ')
}

// Pre-computed paths (2× width so they scroll seamlessly)
const WAVE_W = 2880
const WAVES = [
  { d: wavePath(WAVE_W, 18, 2.5, 0),    stroke: '#14B8A6', opacity: 0.20, dur: '14s' },
  { d: wavePath(WAVE_W, 12, 4,   1.2),  stroke: '#F97316', opacity: 0.12, dur: '22s', rev: true },
  { d: wavePath(WAVE_W, 22, 1.8, 2.5),  stroke: '#2DD4BF', opacity: 0.10, dur: '18s' },
]

/* ─────────────────────────────────────────────────────────
   Live metrics (oscillating)
───────────────────────────────────────────────────────── */
interface Metrics { hr: number; kcal: number; vo2: number; rec: number }

const BASE: Metrics = { hr: 72, kcal: 1847, vo2: 52.4, rec: 87 }

function liveMetrics(t: number): Metrics {
  return {
    hr:   Math.round(BASE.hr   + Math.sin(t / 3200) * 4),
    kcal: Math.round(BASE.kcal + t / 4000),       // slowly counts up
    vo2:  Math.round((BASE.vo2 + Math.sin(t / 7000) * 0.4) * 10) / 10,
    rec:  Math.round(BASE.rec  + Math.sin(t / 9000) * 3),
  }
}

/* ─────────────────────────────────────────────────────────
   Mock clients for the floating dashboard card
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
  const canvasRef   = useRef<HTMLCanvasElement>(null)
  const colsRef     = useRef<Col[]>([])
  const ptclsRef    = useRef<Ptcl[]>([])
  const rafRef      = useRef<number>(0)
  const startRef    = useRef<number>(0)

  const [metrics, setMetrics]   = useState<Metrics>(BASE)
  const [aiLine, setAiLine]     = useState('')
  const [aiIdx, setAiIdx]       = useState(0)
  const [charIdx, setCharIdx]   = useState(0)

  /* ── canvas loop ─────────────────────────────── */
  useEffect(() => {
    const canvasEl = canvasRef.current
    if (!canvasEl) return
    // Capture as non-null so closures inherit the narrowed type
    const canvas: HTMLCanvasElement = canvasEl
    const ctx = canvas.getContext('2d')!

    function resize() {
      canvas.width  = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      colsRef.current = makeCols(canvas.width, canvas.height)
      ptclsRef.current = Array.from({ length: 40 }, () =>
        makePtcl(canvas.width, canvas.height)
      )
      ctx.fillStyle = '#030B0A'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    startRef.current = performance.now()

    function frame() {
      const W = canvas.width, H = canvas.height

      // Fade trail
      ctx.fillStyle = 'rgba(3,11,10,0.16)'
      ctx.fillRect(0, 0, W, H)

      // Draw columns
      ctx.font = `${FS}px 'Courier New', monospace`
      ctx.textAlign = 'center'
      for (const col of colsRef.current) {
        col.tick++
        if (col.tick >= col.rate) {
          col.tick = 0
          col.chars.unshift(CHARS[Math.floor(Math.random() * CHARS.length)])
          col.chars.pop()
        }
        for (let j = 0; j < col.len; j++) {
          const y = col.y - j * FS
          if (y < -FS || y > H + FS) continue
          ctx.globalAlpha = j === 0 ? 0.95 : (1 - j / col.len) * 0.65
          ctx.fillStyle   = j === 0 ? '#FFFFFF' : col.pal[Math.min(j, col.pal.length - 1)]
          ctx.fillText(col.chars[j % col.chars.length], col.x, y)
        }
        col.y += col.speed
        if (col.y > H + col.len * FS) {
          col.y     = -col.len * FS
          col.speed = 0.6 + Math.random() * 1.8
        }
      }

      // Draw particles
      ctx.globalAlpha = 1
      for (const p of ptclsRef.current) {
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = p.col
        ctx.globalAlpha = Math.max(0, p.a)
        ctx.fill()
        p.x += p.vx; p.y += p.vy; p.a -= p.decay
        if (p.a <= 0) Object.assign(p, makePtcl(W, H))
      }
      ctx.globalAlpha = 1

      // Scanning beam
      const elapsed = (performance.now() - startRef.current) % 6000
      if (elapsed < 2400) {
        const bx = (elapsed / 2400) * W
        const g = ctx.createLinearGradient(bx - 80, 0, bx + 80, 0)
        g.addColorStop(0,   'rgba(45,212,191,0)')
        g.addColorStop(0.5, 'rgba(45,212,191,0.35)')
        g.addColorStop(1,   'rgba(45,212,191,0)')
        ctx.fillStyle = g
        ctx.fillRect(bx - 80, 0, 160, H)
      }

      rafRef.current = requestAnimationFrame(frame)
    }

    rafRef.current = requestAnimationFrame(frame)
    return () => { cancelAnimationFrame(rafRef.current); ro.disconnect() }
  }, [])

  /* ── live metrics ────────────────────────────── */
  useEffect(() => {
    const t0 = Date.now()
    const id = setInterval(() => setMetrics(liveMetrics(Date.now() - t0)), 120)
    return () => clearInterval(id)
  }, [])

  /* ── AI typing effect ────────────────────────── */
  useEffect(() => {
    const full = AI_LINES[aiIdx]
    if (charIdx < full.length) {
      const id = setTimeout(() => {
        setAiLine(full.slice(0, charIdx + 1))
        setCharIdx(c => c + 1)
      }, 42)
      return () => clearTimeout(id)
    }
    // Pause then move to next line
    const id = setTimeout(() => {
      const next = (aiIdx + 1) % AI_LINES.length
      setAiIdx(next)
      setCharIdx(0)
      setAiLine('')
    }, 3200)
    return () => clearTimeout(id)
  }, [aiIdx, charIdx])

  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden"
      style={{ background: 'radial-gradient(ellipse 120% 70% at 50% 0%, #0D2420 0%, #030B0A 60%)' }}
    >
      {/* ── Canvas ──────────────────────────────── */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ opacity: 0.85 }}
      />

      {/* ── SVG Waveforms ───────────────────────── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {WAVES.map((w, i) => (
          <div
            key={i}
            className="absolute w-[200%]"
            style={{
              top: `${38 + i * 14}%`,
              left: 0,
              animation: `waveScroll ${w.dur} linear infinite ${w.rev ? 'reverse' : ''}`,
            }}
          >
            <svg
              viewBox={`0 0 ${WAVE_W} 60`}
              preserveAspectRatio="none"
              className="w-full"
              style={{ height: 60 }}
            >
              <path d={w.d} stroke={w.stroke} strokeWidth="1.5" fill="none" opacity={w.opacity} />
            </svg>
          </div>
        ))}
      </div>

      {/* ── Radial vignette (text readability) ─── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 70% 60% at 35% 50%, rgba(3,11,10,0.72) 0%, transparent 100%)',
        }}
      />

      {/* ── Content ─────────────────────────────── */}
      <div className="relative z-10 flex-1 flex flex-col justify-center">
        <div className="max-w-5xl mx-auto px-5 w-full py-20 sm:py-28 grid lg:grid-cols-2 gap-12 items-center">

          {/* LEFT — headline + CTAs */}
          <div className="flex flex-col items-start">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full
              bg-teal-500/15 border border-teal-500/30 text-xs font-semibold text-teal-300 mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-400 animate-pulse" />
              AI-powered · Real-time analytics
            </div>

            <h1 className="text-4xl sm:text-5xl xl:text-6xl font-extrabold leading-[1.08] tracking-tight text-white mb-5">
              Coach smarter.{' '}
              <span
                className="text-transparent bg-clip-text"
                style={{ backgroundImage: 'linear-gradient(135deg, #2DD4BF 0%, #14B8A6 50%, #F97316 100%)' }}
              >
                Let AI do the heavy lifting.
              </span>
            </h1>

            <p className="text-slate-400 text-lg leading-relaxed max-w-lg mb-8">
              FitCoach AI gives coaches an intelligent command centre — track habits, monitor client health, and get daily AI digests that surface who needs attention and who is crushing it.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
              <Link
                href="/signup"
                className="px-7 py-3.5 text-base font-semibold rounded-2xl text-white text-center
                  shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: 'linear-gradient(135deg, #F97316 0%, #EA6C0A 100%)',
                  boxShadow: '0 8px 32px rgba(249,115,22,0.35)',
                }}
              >
                Start for free
              </Link>
              <Link
                href="/login"
                className="px-7 py-3.5 text-base font-medium rounded-2xl text-slate-300 text-center
                  border border-white/10 hover:border-white/20 hover:text-white bg-white/5 hover:bg-white/10 transition-all"
              >
                Sign in
              </Link>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-2 mt-8">
              <div className="flex -space-x-2">
                {['TK','SM','JR','PM'].map((init) => (
                  <div key={init}
                    className="h-7 w-7 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 border-2 border-[#030B0A] flex items-center justify-center text-[9px] font-bold text-white">
                    {init}
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-500">Join coaches already using AI to coach at their best</p>
            </div>
          </div>

          {/* RIGHT — floating dashboard card */}
          <div className="hidden lg:flex justify-center items-center">
            <div
              className="w-[340px] rounded-2xl border overflow-hidden"
              style={{
                background: 'rgba(15,23,42,0.7)',
                backdropFilter: 'blur(20px)',
                borderColor: 'rgba(45,212,191,0.20)',
                boxShadow: '0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(45,212,191,0.08)',
              }}
            >
              {/* Card header */}
              <div className="flex items-center justify-between px-4 py-3 border-b"
                style={{ borderColor: 'rgba(45,212,191,0.12)' }}>
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-lg bg-teal-500/20 flex items-center justify-center">
                    <Zap className="h-3 w-3 text-teal-400" fill="currentColor" />
                  </div>
                  <span className="text-xs font-semibold text-slate-200">FitCoach AI</span>
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
                  <div key={c.n} className="flex items-center gap-3 py-2.5 border-b last:border-b-0"
                    style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
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

              {/* AI insight */}
              <div className="mx-4 mb-4 mt-2 rounded-xl p-3"
                style={{ background: 'rgba(13,148,136,0.10)', border: '1px solid rgba(45,212,191,0.15)' }}>
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
          <a href="#how-it-works"
            className="flex flex-col items-center gap-1 text-xs text-slate-600 hover:text-slate-400 transition-colors">
            Scroll to explore
            <ChevronDown className="h-4 w-4 animate-bounce" />
          </a>
        </div>
      </div>

      {/* ── Live metrics bar ─────────────────────── */}
      <div
        className="relative z-10 border-t"
        style={{
          background: 'rgba(3,11,10,0.85)',
          backdropFilter: 'blur(12px)',
          borderColor: 'rgba(45,212,191,0.15)',
        }}
      >
        <div className="max-w-5xl mx-auto px-5 py-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: Heart,    label: 'Heart Rate',      value: `${metrics.hr}`,   unit: 'BPM',      color: 'text-red-400',    bg: 'bg-red-500/10' },
            { icon: Flame,    label: 'Calories Burned', value: `${metrics.kcal.toLocaleString()}`, unit: 'kcal', color: 'text-orange-400', bg: 'bg-orange-500/10' },
            { icon: Wind,     label: 'VO₂ Max',         value: `${metrics.vo2}`,  unit: 'ml/kg/min',color: 'text-teal-400',   bg: 'bg-teal-500/10' },
            { icon: Activity, label: 'Recovery Score',  value: `${metrics.rec}`,  unit: '%',        color: 'text-blue-400',   bg: 'bg-blue-500/10' },
          ].map((m) => (
            <div key={m.label} className="flex items-center gap-3">
              <div className={`h-9 w-9 rounded-xl ${m.bg} flex items-center justify-center shrink-0`}>
                <m.icon className={`h-4 w-4 ${m.color}`} />
              </div>
              <div className="min-w-0">
                <div className="flex items-baseline gap-1">
                  <span className={`text-lg font-bold tabular-nums ${m.color}`}>{m.value}</span>
                  <span className="text-[10px] text-slate-600">{m.unit}</span>
                </div>
                <p className="text-[10px] text-slate-600 truncate">{m.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Fade into next section ─────────────── */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, transparent, rgba(3,11,10,0.6))' }}
      />
    </section>
  )
}
