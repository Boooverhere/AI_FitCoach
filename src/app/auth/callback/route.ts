import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Always redirect to the canonical app URL to avoid cookie domain mismatches
// when the confirmation link lands on the non-www domain.
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.coacheckin.com'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/onboarding'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${APP_URL}${next}`)
    }
  }

  return NextResponse.redirect(`${APP_URL}/login?error=confirmation_failed`)
}
