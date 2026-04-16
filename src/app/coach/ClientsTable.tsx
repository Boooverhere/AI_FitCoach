'use client'

import Link from 'next/link'
import { CheckCircle2, XCircle, Flame, ChevronRight } from 'lucide-react'

interface ClientRow {
  id: string
  full_name: string
  checkedInToday: boolean
  streak: number
  completionRate: number
}

export function ClientsTable({
  clients,
  coachId,
}: {
  clients: ClientRow[]
  coachId: string
}) {
  if (clients.length === 0) {
    return (
      <div className="bg-[var(--bg-surface)] border border-[var(--border-8)] rounded-2xl p-12 flex flex-col items-center gap-3 text-center">
        <div className="h-14 w-14 rounded-2xl bg-[var(--bg-hover)] flex items-center justify-center">
          <span className="text-2xl">👥</span>
        </div>
        <h3 className="font-semibold text-lg">No clients yet</h3>
        <p className="text-[var(--fg-40)] text-sm max-w-xs">
          Share your invite code with clients. They&apos;ll appear here once they join.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-8)] rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-[var(--border-8)] flex items-center justify-between">
        <h2 className="font-semibold">Clients</h2>
        <span className="text-sm text-[var(--fg-40)]">{clients.length} total</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--border-5)]">
              <th className="text-left px-6 py-3 text-xs font-medium text-[var(--fg-40)] uppercase tracking-wider">
                Name
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-[var(--fg-40)] uppercase tracking-wider">
                Today
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-[var(--fg-40)] uppercase tracking-wider">
                Streak
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-[var(--fg-40)] uppercase tracking-wider">
                30-day rate
              </th>
              <th className="px-6 py-3" />
            </tr>
          </thead>
          <tbody>
            {clients.map((c, i) => (
              <tr
                key={c.id}
                className={`border-b border-[var(--border-5)] hover:bg-[var(--bg-subtle)] transition-colors ${
                  i === clients.length - 1 ? 'border-b-0' : ''
                }`}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[var(--accent-wash)] to-[var(--accent-tint)] border border-[var(--accent-border-sub)] flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-semibold text-[var(--accent-fg)]">
                        {c.full_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="font-medium">{c.full_name}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {c.checkedInToday ? (
                    <span className="flex items-center gap-1.5 text-[var(--accent-fg)]">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="text-sm">Done</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-[var(--fg-30)]">
                      <XCircle className="h-4 w-4" />
                      <span className="text-sm">Pending</span>
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5">
                    <Flame
                      className={`h-4 w-4 ${c.streak > 0 ? 'text-orange-400' : 'text-[var(--fg-20)]'}`}
                    />
                    <span className={`text-sm font-semibold ${c.streak > 0 ? 'text-orange-400' : 'text-[var(--fg-30)]'}`}>
                      {c.streak}d
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 min-w-[80px] h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          c.completionRate >= 80
                            ? 'bg-[var(--accent)]'
                            : c.completionRate >= 50
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${c.completionRate}%` }}
                      />
                    </div>
                    <span className="text-sm text-[var(--fg-60)] w-9 text-right">
                      {c.completionRate}%
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <Link
                    href={`/coach/clients/${c.id}`}
                    className="flex items-center gap-1 text-sm text-[var(--fg-40)] hover:text-[var(--accent-fg)] transition-colors"
                  >
                    View
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
