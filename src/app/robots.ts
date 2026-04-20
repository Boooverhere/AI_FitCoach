import type { MetadataRoute } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.coacheckin.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/login', '/signup'],
        disallow: ['/coach/', '/client/', '/onboarding/', '/api/'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
