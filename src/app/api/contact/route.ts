import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const TOPICS: Record<string, string> = {
  general:     'General question',
  support:     'Technical support',
  billing:     'Billing',
  partnership: 'Partnership',
}

export async function POST(req: Request) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const { name, email, topic, message, _trap } = body as Record<string, string>

  // Honeypot — bots fill this, humans don't
  if (_trap) return NextResponse.json({ ok: true })

  if (!name?.trim() || name.length > 100)
    return NextResponse.json({ error: 'Name is required (max 100 characters)' }, { status: 400 })

  if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254)
    return NextResponse.json({ error: 'A valid email address is required' }, { status: 400 })

  if (!message?.trim() || message.length < 10 || message.length > 4000)
    return NextResponse.json({ error: 'Message must be between 10 and 4000 characters' }, { status: 400 })

  const topicLabel = TOPICS[topic] ?? 'General question'

  const resend = new Resend(process.env.RESEND_API_KEY)

  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? 'Coacheckin <noreply@coacheckin.com>',
    to: 'contact@coacheckin.com',
    replyTo: email,
    subject: `[${topicLabel}] Message from ${name}`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; color: #0F172A;">
        <div style="margin-bottom: 24px;">
          <span style="font-size: 18px; font-weight: 700; color: #0D9488;">Coacheckin — Contact Form</span>
        </div>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 14px;">
          <tr>
            <td style="padding: 8px 0; color: #64748B; width: 100px;">Name</td>
            <td style="padding: 8px 0; font-weight: 600;">${name}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748B;">Email</td>
            <td style="padding: 8px 0;"><a href="mailto:${email}" style="color: #0D9488;">${email}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748B;">Topic</td>
            <td style="padding: 8px 0;">${topicLabel}</td>
          </tr>
        </table>
        <div style="background: #F8FAFC; border-radius: 8px; padding: 16px; font-size: 14px; line-height: 1.7; white-space: pre-wrap;">${message}</div>
        <p style="color: #94A3B8; font-size: 12px; margin-top: 24px;">Reply directly to this email to respond to ${name}.</p>
      </div>
    `,
  })

  if (error) {
    console.error('[contact] Resend error:', error)
    return NextResponse.json({ error: `Resend error: ${error.message}` }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
