import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { ChatThread, type Message } from './ChatThread'

interface Props {
  params: Promise<{ clientId: string }>
}

export default async function CoachChatPage({ params }: Props) {
  const { clientId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Verify this client belongs to this coach
  const { data: client } = await supabase
    .from('profiles')
    .select('id, full_name, coach_id')
    .eq('id', clientId)
    .eq('coach_id', user.id)
    .single()

  if (!client) notFound()

  // Fetch message history (oldest first)
  let initialMessages: Message[] = []
  try {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('coach_id', user.id)
      .eq('client_id', clientId)
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
        coachId={user.id}
        clientId={clientId}
        userId={user.id}
        peerName={client.full_name}
        initialMessages={initialMessages}
        backHref="/coach/messages"
      />
    </div>
  )
}
