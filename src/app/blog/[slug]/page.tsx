import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, ChevronDown } from 'lucide-react'
import { Logo } from '@/components/shared/Logo'
import { ShareButtons } from '@/components/blog/ShareButtons'
import { getPost, getAllPostMetas } from '@/lib/blog'
import type { Metadata } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.coacheckin.com'
const BG      = '#faf8f4'
const BORDER  = 'rgba(4,47,46,0.07)'
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
      url: `${SITE_URL}/blog/${slug}`,
      publishedTime: post.date,
      authors: [post.author],
      tags: post.tags,
      ...(post.coverImage && { images: [`${SITE_URL}${post.coverImage}`] }),
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      ...(post.coverImage && { images: [`${SITE_URL}${post.coverImage}`] }),
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

  /* ── JSON-LD ── */
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    ...(post.coverImage && { image: `${SITE_URL}${post.coverImage}` }),
    author: {
      '@type': 'Organization',
      name: 'Coacheckin',
      url: SITE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Coacheckin',
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/icon.svg`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/blog/${slug}`,
    },
    url: `${SITE_URL}/blog/${slug}`,
    keywords: post.tags.join(', '),
  }

  const faqSchema = post.faq.length > 0
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: post.faq.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer,
          },
        })),
      }
    : null

  return (
    <div className="min-h-screen flex flex-col" style={{ background: BG }}>

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

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

          <div className="flex items-center gap-3 text-sm mb-6"
            style={{ color: MUTED }}>
            <span>{formatDate(post.date)}</span>
            <span>&middot;</span>
            <span>{post.readingTime} min read</span>
            <span>&middot;</span>
            <span>{post.author}</span>
          </div>

          <div className="flex items-center justify-between flex-wrap gap-3 mb-10 pb-8 border-b"
            style={{ borderColor: BORDER }}>
            <ShareButtons url={`${SITE_URL}/blog/${post.slug}`} title={post.title} />
          </div>

          {/* Cover image */}
          {post.coverImage && (
            <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden mb-10"
              style={{ border: `1px solid ${BORDER}` }}>
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 672px) 100vw, 672px"
              />
            </div>
          )}

          {/* Article body */}
          <article
            className="prose-blog"
            dangerouslySetInnerHTML={{ __html: post.html }}
          />

          {/* Share again after article */}
          <div className="mt-10 pt-8 border-t" style={{ borderColor: BORDER }}>
            <ShareButtons url={`${SITE_URL}/blog/${post.slug}`} title={post.title} />
          </div>

          {/* FAQ section */}
          {post.faq.length > 0 && (
            <section className="mt-14">
              <h2 className="text-xl font-bold mb-6" style={{ color: HEADLINE }}>
                Frequently Asked Questions
              </h2>
              <div className="flex flex-col gap-3">
                {post.faq.map((item, i) => (
                  <details key={i}
                    className="group rounded-2xl overflow-hidden"
                    style={{ border: `1px solid ${BORDER}`, background: '#fff' }}>
                    <summary className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer list-none font-semibold text-sm"
                      style={{ color: HEADLINE }}>
                      {item.question}
                      <ChevronDown className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180"
                        style={{ color: MUTED }} />
                    </summary>
                    <p className="px-5 pb-5 text-sm leading-relaxed" style={{ color: MUTED }}>
                      {item.answer}
                    </p>
                  </details>
                ))}
              </div>
            </section>
          )}

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
      <footer className="border-t py-6 mt-12"
        style={{ background: '#021815', borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="max-w-5xl mx-auto px-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <Logo iconSize={20} wordmarkClass="text-white/70 text-sm" />
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
            &copy; {new Date().getFullYear()} Coacheckin
          </p>
        </div>
      </footer>

    </div>
  )
}
