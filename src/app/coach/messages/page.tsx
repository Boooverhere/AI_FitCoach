import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { MessageSquare } from 'lucide-react'

interface ClientRow {
  id: string
  full_name: string
}

interface Message {
  id: string
  client_id: string
  sender_id: string
  content: string
  created_at: string
  read: boolean
}

function formatInboxTime(ts: string): string {
  const d = new Date(ts)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  if (diff < 60_000) return 'just now'
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`
  if (diff < 86_400_000 && now.getDate() === d.getDate()) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
  if (diff < 7 * 86_400_000) {
    return d.toLocaleDateString([], { weekday: 'short' })
  }
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

export default async function CoachMessagesPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // All clients of this coach
  const { data: clients } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('coach_id', user.id)
    .eq('role', 'client')
    .order('full_name')

  const clientList: ClientRow[] = clients ?? []

  // Latest message + unread count per client
  let allMessages: Message[] = []
  try {
    const { data } = await supabase
      .from('messages')
      .select('id, client_id, sender_id, content, created_at, read')
      .eq('coach_id', user.id)
      .order('created_at', { ascending: false })
    allMessages = (data ?? []) as Message[]
  } catch {
    // messages table not yet created — render inbox without message data
  }

  // Build per-client summary in JS
  const lastMsg = new Map<string, Message>()
  const unread = new Map<string, number>()

  for (const msg of allMessages) {
    if (!lastMsg.has(msg.client_id)) lastMsg.set(msg.client_id, msg)
    if (!msg.read && msg.sender_id !== user.id) {
      unread.set(msg.client_id, (unread.get(msg.client_id) ?? 0) + 1)
    }
  }

  // Sort clients: those with messages first (most recent first), then alphabetical
  const sorted = [...clientList].sort((a, b) => {
    const ta = lastMsg.get(a.id)?.created_at ?? ''
    const tb = lastMsg.get(b.id)?.created_at ?? ''
    if (ta && tb) return tb.localeCompare(ta)
    if (ta) return -1
    if (tb) return 1
    return a.full_name.localeCompare(b.full_name)
  })

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-5">Messages</h1>

      {sorted.length === 0 && (
        <div className="bg-[var(--bg-surface)] border border-[var(--border-8)] rounded-2xl p-12 flex flex-col items-center gap-3 text-center">
          <div className="h-14 w-14 rounded-2xl bg-[var(--bg-hover)] flex items-center justify-center">
            <MessageSquare className="h-6 w-6 text-[var(--fg-30)]" />
          </div>
          <h3 className="font-semibold">No clients yet</h3>
          <p className="text-[var(--fg-40)] text-sm max-w-xs">
            Once clients join your roster you can message them here.
          </p>
        </div>
      )}

      {sorted.length > 0 && (
        <div className="bg-[var(--bg-surface)] border border-[var(--border-8)] rounded-2xl overflow-hidden divide-y divide-[var(--border-5)]">
          {sorted.map((c) => {
            const last = lastMsg.get(c.id)
            const unreadCount = unread.get(c.id) ?? 0

            return (
              <Link
                key={c.id}
                href={`/coach/messages/${c.id}`}
                className="flex items-center gap-3 px-4 py-3.5 hover:bg-[var(--bg-hover)] transition-colors"
              >
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div className="h-11 w-11 rounded-full bg-gradient-to-br from-[var(--accent-wash)] to-[var(--accent-tint)] border border-[var(--accent-border-sub)] flex items-center justify-center">
                    <span className="text-sm font-bold text-[var(--accent-fg)]">
                      {c.full_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-[var(--accent)] text-[var(--accent-on-solid)] text-[9px] font-bold flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </div>

                {/* Name + preview */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-sm truncate ${unreadCount > 0 ? 'font-semibold text-[var(--fg)]' : 'font-medium text-[var(--fg)]'}`}>
                      {c.full_name}
                    </span>
                    {last && (
                      <span className={`text-[11px] shrink-0 ${unreadCount > 0 ? 'text-[var(--accent-fg)] font-medium' : 'text-[var(--fg-30)]'}`}>
                        {formatInboxTime(last.created_at)}
                      </span>
                    )}
                  </div>
                  <p className={`text-xs truncate mt-0.5 ${unreadCount > 0 ? 'text-[var(--fg-70)]' : 'text-[var(--fg-40)]'}`}>
                    {last
                      ? `${last.sender_id === user.id ? 'You: ' : ''}${last.content}`
                      : 'No messages yet — say hi!'}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
