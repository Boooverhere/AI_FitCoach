'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Dumbbell, Bot, Bell, MessageSquare, Layers, CreditCard } from 'lucide-react'

const mainLinks = [
  { href: '/coach',                label: 'Dashboard',     icon: LayoutDashboard, exact: true  },
  { href: '/coach/messages',       label: 'Messages',      icon: MessageSquare,   exact: false },
  { href: '/coach/habits',         label: 'Habits',        icon: Dumbbell,        exact: false },
  { href: '/coach/programs',       label: 'Programs',      icon: Layers,          exact: false },
  { href: '/coach/notifications',  label: 'Notifications', icon: Bell,            exact: false },
]

const bottomLinks = [
  { href: '/coach/settings/ai',      label: 'AI Settings', icon: Bot,        exact: false },
  { href: '/coach/settings/billing', label: 'Billing',     icon: CreditCard, exact: false },
]

interface Props {
  unreadNotifications?: number
  unreadMessages?: number
  subscriptionStatus?: string
}

export function CoachSidebar({ unreadNotifications = 0, unreadMessages = 0, subscriptionStatus }: Props) {
  const pathname = usePathname()

  function navLink(l: { href: string; label: string; icon: React.ElementType; exact: boolean }) {
    const active = l.exact ? pathname === l.href : pathname.startsWith(l.href)
    const badge =
      l.label === 'Notifications' && unreadNotifications > 0 ? unreadNotifications
      : l.label === 'Messages' && unreadMessages > 0 ? unreadMessages
      : 0

    const needsAttention = l.label === 'Billing' &&
      ['on_hold', 'cancelled', 'expired', 'failed'].includes(subscriptionStatus ?? '')

    return (
      <Link
        key={l.href}
        href={l.href}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
          active
            ? 'bg-[var(--bg-active-nav)] text-[var(--fg-active-nav)] font-medium'
            : 'text-[var(--fg-50)] hover:text-[var(--fg)] hover:bg-[var(--bg-hover)]'
        }`}
      >
        <l.icon className={`h-4 w-4 shrink-0 ${needsAttention ? 'text-amber-400' : ''}`} />
        <span className="flex-1">{l.label}</span>
        {badge > 0 && (
          <span className="h-4 min-w-4 px-1 rounded-full bg-[var(--accent)] text-[var(--accent-on-solid)] text-[10px] font-bold flex items-center justify-center leading-none">
            {badge > 9 ? '9+' : badge}
          </span>
        )}
        {needsAttention && (
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
        )}
      </Link>
    )
  }

  return (
    <aside className="hidden md:flex w-56 border-r border-[var(--border-8)] flex-shrink-0 flex-col pt-4 px-3 bg-[var(--bg-nav)]">
      <div className="flex flex-col gap-1 flex-1">
        {mainLinks.map(navLink)}
      </div>
      <div className="flex flex-col gap-1 pb-4 border-t border-[var(--border-8)] pt-3 mt-3">
        {bottomLinks.map(navLink)}
      </div>
    </aside>
  )
}
