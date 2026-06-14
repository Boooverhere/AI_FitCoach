import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { GoogleAnalytics } from '@next/third-parties/google'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://coacheckin.com'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Coacheckin – AI-Powered Fitness Coaching Platform',
    template: '%s | Coacheckin',
  },
  description:
    'The all-in-one coaching platform for personal trainers. Build programs, track habits, monitor progress photos, message clients, and get AI daily digests — all in one place.',
  keywords: [
    'fitness coaching platform',
    'personal trainer software',
    'online coaching app',
    'client habit tracking',
    'workout program builder',
    'AI fitness coach',
    'progress photo tracking',
    'coaching management software',
  ],
  authors: [{ name: 'Coacheckin' }],
  creator: 'Coacheckin',
  publisher: 'Coacheckin',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: 'Coacheckin',
    title: 'Coacheckin – AI-Powered Fitness Coaching Platform',
    description:
      'Build programs, track habits, monitor progress, and get AI digests. The intelligent coaching platform built for real coaches.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Coacheckin – AI-Powered Fitness Coaching',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Coacheckin – AI-Powered Fitness Coaching Platform',
    description:
      'Build programs, track habits, monitor progress, and get AI digests. The intelligent coaching platform built for real coaches.',
    images: ['/og-image.png'],
    creator: '@coacheckin',
  },
  icons: { icon: '/icon.svg' },
  verification: {
    google: 'Gh03sicYZdyvWeWSeMjNuskyIQUV4TVi-rd_eR4VOww',
  },
}

const GA_ID = 'G-X5NX1MLPJ4'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`dark ${geistSans.variable} ${geistMono.variable} h-full`}
    >
      <head>
        {/* Runs before React hydrates — reads localStorage and sets the theme class.
            Placed here (server component) so React 19 never sees it as a client script. */}
        <script
          id="theme-init"
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('theme');document.documentElement.classList.remove('dark','light');document.documentElement.classList.add(t==='light'?'light':'dark')}catch(e){}`,
          }}
        />
      </head>
      <body className="min-h-full antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
      <GoogleAnalytics gaId={GA_ID} />
    </html>
  )
}
