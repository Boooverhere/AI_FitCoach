import { createClient } from '@/lib/supabase/server'
import { Bell, UserPlus, Flame, AlertTriangle, XCircle } from 'lucide-react'
import { MarkAllRead } from './MarkAllRead'

export type NotificationType = 'missed_checkin' | 'streak_7' | 'flagged_note' | 'new_client'

export interface Notification {
  id: string
  type: NotificationType
  client_id: string | null
  message: string
  read: boolean
  created_at: string
}

const typeConfig: Record<NotificationType, {
  icon: React.ElementType
  iconBg: string
  iconColor: string
  label: string
}> = {
  new_client: {
    icon: UserPlus,
    iconBg: 'bg-[var(--accent-tint)]',
    iconColor: 'text-[var(--accent-fg)]',
    label: 'New client',
  },
  streak_7: {
    icon: Flame,
    iconBg: 'bg-orange-500/15',
    iconColor: 'text-orange-400',
    label: '7-day streak',
  },
  flagged_note: {
    icon: AlertTriangle,
    iconBg: 'bg-yellow-500/15',
    iconColor: 'text-yellow-400',
    label: 'Flagged note',
  },
  missed_checkin: {
    icon: XCircle,
    iconBg: 'bg-red-500/15',
    iconColor: 'text-red-400',
    label: 'Missed check-in',
  },
}

export default async function NotificationsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Fetch notifications — graceful if table doesn't exist yet
  let notifications: Notification[] = []
  let tableExists = true
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('id, type, client_id, message, read, created_at')
      .eq('coach_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      if (error.code === '42P01') tableExists = false // relation does not exist
      else throw error
    }
    notifications = (data ?? []) as Notification[]
  } catch {
    tableExists = false
  }

  // Mark all as read in the background (fire and forget — server action would be cleaner but this works)
  if (notifications.some((n) => !n.read)) {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('coach_id', user.id)
      .eq('read', false)
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Notifications</h1>
          <p className="text-[var(--fg-40)] text-sm mt-0.5">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
          </p>
        </div>
        {notifications.length > 0 && <MarkAllRead coachId={user.id} />}
      </div>

      {!tableExists && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-5 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-sm text-yellow-300">Database table not set up yet</p>
            <p className="text-sm text-yellow-400/70 mt-1">
              Run the notifications table SQL in your Supabase dashboard to enable this feature.
            </p>
          </div>
        </div>
      )}

      {tableExists && notifications.length === 0 && (
        <div className="bg-[var(--bg-surface)] border border-[var(--border-8)] rounded-2xl p-16 flex flex-col items-center gap-3 text-center">
          <div className="h-14 w-14 rounded-2xl bg-[var(--bg-hover)] flex items-center justify-center">
            <Bell className="h-6 w-6 text-[var(--fg-30)]" />
          </div>
          <h3 className="font-semibold">No notifications yet</h3>
          <p className="text-[var(--fg-40)] text-sm max-w-xs leading-relaxed">
            You will see alerts here when clients miss check-ins, hit streaks, submit flagged notes, or join via your invite link.
          </p>
        </div>
      )}

      {notifications.length > 0 && (
        <div className="bg-[var(--bg-surface)] border border-[var(--border-8)] rounded-2xl overflow-hidden">
          <div className="divide-y divide-[var(--border-5)]">
            {notifications.map((n) => {
              const cfg = typeConfig[n.type] ?? typeConfig.missed_checkin
              const Icon = cfg.icon
              const timeAgo = formatTimeAgo(n.created_at)

              return (
                <div
                  key={n.id}
                  className={`flex items-start gap-4 px-5 py-4 transition-colors ${
                    !n.read ? 'bg-[var(--accent-wash)]' : ''
                  }`}
                >
                  <div className={`h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${cfg.iconBg}`}>
                    <Icon className={`h-4 w-4 ${cfg.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className={`text-xs font-semibold uppercase tracking-wider ${cfg.iconColor}`}>
                          {cfg.label}
                        </span>
                        <p className="text-sm text-[var(--fg)] mt-0.5 leading-relaxed">{n.message}</p>
                      </div>
                      {!n.read && (
                        <span className="h-2 w-2 rounded-full bg-red-500 shrink-0 mt-1.5" />
                      )}
                    </div>
                    <p className="text-xs text-[var(--fg-30)] mt-1">{timeAgo}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function formatTimeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
