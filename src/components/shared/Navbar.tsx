'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { LogOut, Zap } from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'

interface NavbarProps {
  fullName: string
  role: 'coach' | 'client'
}

export function Navbar({ fullName, role }: NavbarProps) {
  const router = useRouter()

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <nav className="h-16 border-b border-[var(--border-8)] flex items-center px-6 justify-between bg-[var(--bg-nav)]">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-lg bg-[var(--accent)] flex items-center justify-center">
          <Zap className="h-4 w-4 text-[var(--accent-on-solid)]" fill="currentColor" />
        </div>
        <span className="font-bold text-lg tracking-tight">FitCoach</span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--accent-tint)] text-[var(--accent-fg)] font-medium uppercase tracking-wider ml-1">
          {role}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-[var(--fg-50)]">{fullName}</span>
        <ThemeToggle />
        <button
          onClick={signOut}
          className="flex items-center gap-2 text-sm text-[var(--fg-40)] hover:text-[var(--fg-70)] transition-colors px-2 py-1.5"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </nav>
  )
}
