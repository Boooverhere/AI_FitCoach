import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { email, inviteCode } = await req.json()
  if (!email || !inviteCode) {
    return NextResponse.json({ error: 'Missing email or invite code' }, { status: 400 })
  }

  // Get coach name
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  const coachName = profile?.full_name ?? 'Your coach'
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://your-app.vercel.app'
  const inviteUrl = `${appUrl}/signup?invite=${inviteCode}`

  const resend = new Resend(process.env.RESEND_API_KEY)

  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? 'FitCoach AI <noreply@yourdomain.com>',
    to: email,
    subject: `${coachName} invited you to FitCoach AI`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; color: #0F172A;">
        <h1 style="font-size: 22px; font-weight: 700; margin: 0 0 8px;">You have been invited!</h1>
        <p style="color: #64748B; margin: 0 0 24px; line-height: 1.6;">
          <strong>${coachName}</strong> has invited you to join FitCoach AI — a platform for tracking your habits, health, and fitness goals together.
        </p>
        <a href="${inviteUrl}"
           style="display: inline-block; background: #0D9488; color: white; font-weight: 600; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-size: 15px;">
          Accept invite &amp; sign up
        </a>
        <p style="color: #94A3B8; font-size: 13px; margin: 24px 0 0; line-height: 1.5;">
          Or copy this link into your browser:<br/>
          <a href="${inviteUrl}" style="color: #0D9488;">${inviteUrl}</a>
        </p>
      </div>
    `,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
