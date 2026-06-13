'use client'

import Link from 'next/link'
import { Logo } from '@/components/shared/Logo'
import { ArrowLeft, Clock, MessageCircle, CheckCircle2, AlertCircle } from 'lucide-react'
import { useState } from 'react'

const WA_LINK = 'https://wa.me/message/KYISERSGPOL5K1'
const BG = '#faf8f4'
const HEADLINE = '#042F2E'
const MUTED = '#78716C'
const BORDER = 'rgba(4,47,46,0.07)'
const BORDER_T = 'rgba(45,212,191,0.22)'

const TOPICS = [
  { value: 'general',     label: 'General question' },
  { value: 'support',     label: 'Technical support' },
  { value: 'billing',     label: 'Billing' },
  { value: 'partnership', label: 'Partnership' },
]

type Status = 'idle' | 'loading' | 'success' | 'error'

export default function ContactPage() {
  const [name, setName]       = useState('')
  const [email, setEmail]     = useState('')
  const [topic, setTopic]     = useState('general')
  const [message, setMessage] = useState('')
  const [status, setStatus]   = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg('')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, topic, message, _trap: '' }),
      })
      const data = await res.json()
      if (!res.ok) {
        setErrorMsg(data.error ?? 'Something went wrong.')
        setStatus('error')
      } else {
        setStatus('success')
      }
    } catch {
      setErrorMsg('Network error — please try again.')
      setStatus('error')
    }
  }

  const inputClass = "w-full rounded-xl px-4 py-3 text-sm outline-none transition-all border focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20"
  const inputStyle = { background: '#ffffff', borderColor: 'rgba(4,47,46,0.14)', color: HEADLINE }

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
        <div className="max-w-lg mx-auto">

          <Link href="/"
            className="inline-flex items-center gap-1.5 text-sm mb-8 transition-colors"
            style={{ color: MUTED }}>
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>

          <p className="text-xs font-semibold uppercase tracking-widest text-teal-500 mb-3">Contact</p>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4 leading-tight" style={{ color: HEADLINE }}>
            We&apos;d love to hear from you
          </h1>
          <p className="text-sm leading-relaxed mb-8" style={{ color: MUTED }}>
            Send us a message below or chat on WhatsApp for the fastest response.
          </p>

          {/* WhatsApp CTA */}
          <a href={WA_LINK} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-4 w-full px-5 py-4 rounded-2xl text-white transition-all hover:scale-[1.01] active:scale-[0.99] mb-8"
            style={{ background: 'linear-gradient(135deg, #25D366 0%, #1DA851 100%)', boxShadow: '0 6px 24px rgba(37,211,102,0.28)' }}>
            <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <WhatsAppIcon />
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm">Chat on WhatsApp</p>
              <p className="text-white/75 text-xs mt-0.5">Usually replies within a few hours</p>
            </div>
            <svg className="h-4 w-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>

          {/* Contact form */}
          {status === 'success' ? (
            <div className="rounded-2xl p-8 flex flex-col items-center text-center gap-4"
              style={{ background: '#ffffff', border: `1px solid ${BORDER_T}` }}>
              <div className="h-12 w-12 rounded-full bg-teal-50 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-teal-600" />
              </div>
              <div>
                <p className="font-semibold text-sm mb-1" style={{ color: HEADLINE }}>Message sent</p>
                <p className="text-sm" style={{ color: MUTED }}>We&apos;ll get back to you at <strong>{email}</strong> as soon as possible.</p>
              </div>
              <button onClick={() => { setStatus('idle'); setName(''); setEmail(''); setMessage(''); setTopic('general') }}
                className="text-xs text-teal-600 hover:underline mt-1">
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="rounded-2xl p-6 flex flex-col gap-4"
              style={{ background: '#ffffff', border: `1px solid ${BORDER_T}` }}>

              {/* Honeypot */}
              <input type="text" name="_trap" className="hidden" tabIndex={-1} autoComplete="off"
                onChange={() => {}} />

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium" style={{ color: HEADLINE }}>Name <span className="text-rose-400">*</span></label>
                  <input type="text" required maxLength={100} placeholder="Your name"
                    className={inputClass} style={inputStyle}
                    value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium" style={{ color: HEADLINE }}>Email <span className="text-rose-400">*</span></label>
                  <input type="email" required maxLength={254} placeholder="you@example.com"
                    className={inputClass} style={inputStyle}
                    value={email} onChange={e => setEmail(e.target.value)} />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium" style={{ color: HEADLINE }}>Topic</label>
                <select className={inputClass} style={inputStyle}
                  value={topic} onChange={e => setTopic(e.target.value)}>
                  {TOPICS.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium" style={{ color: HEADLINE }}>Message <span className="text-rose-400">*</span></label>
                <textarea required minLength={10} maxLength={4000} rows={5}
                  placeholder="Tell us what's on your mind…"
                  className={inputClass + " resize-none"} style={inputStyle}
                  value={message} onChange={e => setMessage(e.target.value)} />
                <p className="text-xs text-right" style={{ color: MUTED }}>{message.length}/4000</p>
              </div>

              {status === 'error' && (
                <div className="flex items-center gap-2 text-sm text-rose-600 bg-rose-50 rounded-xl px-4 py-3">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {errorMsg}
                </div>
              )}

              <button type="submit" disabled={status === 'loading'}
                className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all hover:scale-[1.01] disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ background: '#F97316', boxShadow: '0 4px 16px rgba(249,115,22,0.22)' }}>
                {status === 'loading' ? 'Sending…' : 'Send message'}
              </button>

              <p className="text-xs text-center" style={{ color: MUTED }}>
                For billing or account issues email{' '}
                <a href="mailto:support@coachecking.com" className="text-teal-600 hover:underline">
                  support@coachecking.com
                </a>
              </p>
            </form>
          )}

          {/* Info cards */}
          <div className="grid grid-cols-2 gap-3 mt-6">
            <div className="rounded-2xl p-4 flex flex-col gap-2"
              style={{ background: '#ffffff', border: `1px solid ${BORDER}` }}>
              <div className="h-8 w-8 rounded-lg bg-teal-500/10 flex items-center justify-center">
                <Clock className="h-4 w-4 text-teal-600" />
              </div>
              <p className="font-semibold text-sm" style={{ color: HEADLINE }}>Response time</p>
              <p className="text-xs leading-relaxed" style={{ color: MUTED }}>Usually within a few hours during business days</p>
            </div>
            <div className="rounded-2xl p-4 flex flex-col gap-2"
              style={{ background: '#ffffff', border: `1px solid ${BORDER}` }}>
              <div className="h-8 w-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <MessageCircle className="h-4 w-4 text-orange-500" />
              </div>
              <p className="font-semibold text-sm" style={{ color: HEADLINE }}>What we help with</p>
              <p className="text-xs leading-relaxed" style={{ color: MUTED }}>Onboarding, technical issues, feature requests</p>
            </div>
          </div>

        </div>
      </main>

      <footer className="border-t py-6 mt-8" style={{ background: '#021815', borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="max-w-5xl mx-auto px-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <Logo iconSize={20} wordmarkClass="text-white/70 text-sm" />
          <div className="flex items-center gap-5 text-xs" style={{ color: 'rgba(255,255,255,0.30)' }}>
            <Link href="/about"   className="hover:text-white/60 transition-colors">About</Link>
            <Link href="/terms"   className="hover:text-white/60 transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-white/60 transition-colors">Privacy</Link>
          </div>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.18)' }}>&copy; {new Date().getFullYear()} Coacheckin &mdash; operated by Mehdi Elyoussefi, Morocco</p>
        </div>
      </footer>
    </div>
  )
}

function WhatsAppIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  )
}
