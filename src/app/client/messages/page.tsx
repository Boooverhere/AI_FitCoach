import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ChatThread, type Message } from '@/app/coach/messages/[clientId]/ChatThread'

export default async function ClientMessagesPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get this client's coach
  const { data: profile } = await supabase
    .from('profiles')
    .select('coach_id, full_name')
    .eq('id', user.id)
    .single()

  if (!profile?.coach_id) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="h-14 w-14 rounded-2xl bg-[var(--bg-hover)] flex items-center justify-center mb-4">
          <span className="text-2xl">💬</span>
        </div>
        <h2 className="font-semibold text-lg mb-2">No coach connected</h2>
        <p className="text-sm text-[var(--fg-40)] max-w-xs">
          You&apos;ll be able to message your coach once you&apos;ve been added to their roster.
        </p>
      </div>
    )
  }

  // Get coach name
  const { data: coach } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', profile.coach_id)
    .single()

  const coachName = coach?.full_name ?? 'Your Coach'

  // Fetch message history
  let initialMessages: Message[] = []
  try {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('coach_id', profile.coach_id)
      .eq('client_id', user.id)
      .order('created_at', { ascending: true })
      .limit(200)
    initialMessages = (data ?? []) as Message[]
  } catch {
    // messages table not yet created
  }

  return (
    <div
      className="-m-4 sm:-m-6 flex flex-col overflow-hidden"
      style={{ height: 'calc(100dvh - 64px)' }}
    >
      <ChatThread
        coachId={profile.coach_id}
        clientId={user.id}
        userId={user.id}
        peerName={coachName}
        initialMessages={initialMessages}
        backHref="/client"
      />
    </div>
  )
}
