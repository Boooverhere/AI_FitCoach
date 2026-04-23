import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Logo } from '@/components/shared/Logo'
import { getPost, getAllPostMetas } from '@/lib/blog'
import type { Metadata } from 'next'

const BG     = '#faf8f4'
const BORDER = 'rgba(4,47,46,0.07)'
const HEADLINE = '#042F2E'
const MUTED    = '#78716C'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return getAllPostMetas().map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) return {}
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
    },
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) notFound()

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

      <main className="flex-1">
        <div className="max-w-2xl mx-auto px-5 py-12">

          <Link href="/blog"
            className="inline-flex items-center gap-1.5 text-sm mb-8 transition-colors"
            style={{ color: MUTED }}>
            <ArrowLeft className="h-4 w-4" />
            All posts
          </Link>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {post.tags.map((tag) => (
              <span key={tag}
                className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full text-teal-700"
                style={{ background: 'rgba(45,212,191,0.10)' }}>
                {tag}
              </span>
            ))}
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold leading-tight mb-4" style={{ color: HEADLINE }}>
            {post.title}
          </h1>

          <div className="flex items-center gap-3 text-sm mb-10 pb-8 border-b" style={{ color: MUTED, borderColor: BORDER }}>
            <span>{formatDate(post.date)}</span>
            <span>&middot;</span>
            <span>{post.readingTime} min read</span>
            <span>&middot;</span>
            <span>{post.author}</span>
          </div>

          {/* Article body */}
          <article
            className="prose-blog"
            dangerouslySetInnerHTML={{ __html: post.html }}
          />

          {/* CTA */}
          <div className="mt-16 rounded-2xl p-8 text-center"
            style={{ background: '#042F2E' }}>
            <p className="text-xs font-semibold uppercase tracking-widest text-teal-400 mb-2">Ready to scale?</p>
            <h2 className="text-xl font-bold text-white mb-3">Start coaching smarter with Coacheckin</h2>
            <p className="text-sm text-white/60 mb-6 max-w-sm mx-auto">
              Programs, check-ins, progress photos, and AI digests — all in one place.
            </p>
            <Link href="/signup"
              className="inline-block px-6 py-2.5 text-sm font-semibold rounded-xl text-white transition-all hover:scale-[1.02]"
              style={{ background: '#F97316', boxShadow: '0 0 18px rgba(249,115,22,0.25)' }}>
              Try for free
            </Link>
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
