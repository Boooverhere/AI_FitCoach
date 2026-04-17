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
    from: process.env.RESEND_FROM_EMAIL ?? 'Coacheckin <noreply@yourdomain.com>',
    to: email,
    subject: `${coachName} invited you to Coacheckin`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; color: #0F172A;">
        <div style="margin-bottom: 24px;">
          <div style="display: inline-flex; align-items: center; gap: 10px;">
            <div style="width: 36px; height: 36px; border-radius: 8px; background: #052E16; display: inline-flex; align-items: center; justify-content: center;">
              <svg width="22" height="22" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="11" stroke="#4ADE80" stroke-width="1.5"/>
                <circle cx="16" cy="16" r="7.5" fill="#16A34A"/>
                <path d="M11.5 16.5L14.5 19.5L20.5 13.5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="16" cy="5" r="1.8" fill="#4ADE80"/>
              </svg>
            </div>
            <span style="font-size: 18px; font-weight: 700; color: #052E16; letter-spacing: -0.3px;">Coacheckin</span>
          </div>
        </div>
        <h1 style="font-size: 22px; font-weight: 700; margin: 0 0 8px;">You've been invited!</h1>
        <p style="color: #64748B; margin: 0 0 24px; line-height: 1.6;">
          <strong>${coachName}</strong> has invited you to join Coacheckin — a platform for tracking your habits, health, and fitness goals together.
        </p>
        <a href="${inviteUrl}"
           style="display: inline-block; background: #F97316; color: white; font-weight: 600; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-size: 15px;">
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
