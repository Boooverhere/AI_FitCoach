import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Bot } from 'lucide-react'
import { AISettingsForm } from './AISettingsForm'
import type { CoachSettings, ParsedCredential } from '@/lib/coachSystemPrompt'

export default async function AISettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/onboarding')
  if (profile.role !== 'coach') redirect('/client')

  const { data: aiRow } = await supabase
    .from('coach_ai_settings')
    .select('settings, credentials, cert_files, updated_at')
    .eq('coach_id', user.id)
    .single()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="h-9 w-9 rounded-xl bg-[var(--accent-tint)] flex items-center justify-center">
            <Bot className="h-5 w-5 text-[var(--accent-fg)]" />
          </div>
          <h1 className="text-2xl font-bold">My AI Settings</h1>
        </div>
        <p className="text-[var(--fg-40)] text-sm ml-12">
          Configure how the AI represents you and responds on your behalf.
        </p>
      </div>

      <AISettingsForm
        coachId={user.id}
        coachName={profile.full_name}
        initialSettings={(aiRow?.settings as CoachSettings) ?? null}
        initialCredentials={(aiRow?.credentials as ParsedCredential[]) ?? []}
        initialCertFiles={(aiRow?.cert_files as string[]) ?? []}
        updatedAt={aiRow?.updated_at ?? null}
      />
    </div>
  )
}
