import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Logo } from '@/components/shared/Logo'
import { getAllPostMetas } from '@/lib/blog'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Coaching tips, industry insights, and practical guides for online personal trainers using Coacheckin.',
  alternates: { canonical: '/blog' },
}

const BG     = '#faf8f4'
const BORDER = 'rgba(4,47,46,0.07)'
const HEADLINE = '#042F2E'
const MUTED    = '#78716C'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

export default function BlogPage() {
  const posts = getAllPostMetas()

  return (
    <div className="min-h-screen flex flex-col" style={{ background: BG }}>

      {/* Nav */}
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

      {/* Hero */}
      <section className="border-b" style={{ borderColor: BORDER }}>
        <div className="max-w-5xl mx-auto px-5 py-16 sm:py-20">
          <p className="text-xs font-semibold uppercase tracking-widest text-teal-500 mb-3">Blog</p>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4 leading-tight" style={{ color: HEADLINE }}>
            Coaching resources & insights
          </h1>
          <p className="text-base max-w-xl leading-relaxed" style={{ color: MUTED }}>
            Practical guides for online personal trainers — on software, client retention, habit tracking, and building a coaching business that scales.
          </p>
        </div>
      </section>

      {/* Posts */}
      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-5 py-12">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`}
                className="group flex flex-col rounded-2xl p-6 transition-all hover:shadow-md"
                style={{ background: '#ffffff', border: `1px solid ${BORDER}` }}>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {post.tags.slice(0, 2).map((tag) => (
                    <span key={tag}
                      className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full text-teal-700"
                      style={{ background: 'rgba(45,212,191,0.10)' }}>
                      {tag}
                    </span>
                  ))}
                </div>

                <h2 className="text-base font-bold leading-snug mb-2 group-hover:text-teal-700 transition-colors"
                  style={{ color: HEADLINE }}>
                  {post.title}
                </h2>
                <p className="text-sm leading-relaxed flex-1 mb-4" style={{ color: MUTED }}>
                  {post.description}
                </p>

                <div className="flex items-center justify-between text-xs" style={{ color: MUTED }}>
                  <span>{formatDate(post.date)}</span>
                  <span className="flex items-center gap-1 font-medium text-teal-600 group-hover:gap-2 transition-all">
                    Read <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-6 mt-12" style={{ background: '#021815', borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="max-w-5xl mx-auto px-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <Logo iconSize={20} wordmarkClass="text-white/70 text-sm" />
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>&copy; {new Date().getFullYear()} Coacheckin</p>
        </div>
      </footer>

    </div>
  )
}
