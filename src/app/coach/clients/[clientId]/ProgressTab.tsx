'use client'

import { useState } from 'react'
import { X, GitCompare, LayoutGrid, TrendingDown, Camera } from 'lucide-react'

export interface PhotoRecord {
  id: string
  date: string
  weight_kg: number | null
  signed_url: string
}

interface Props { photos: PhotoRecord[] }

type Mode = 'grid' | 'compare'

/* ── Date helpers ──────────────────────────────────────── */
function fmtShort(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })
}
function fmtLong(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
}

/* ── Weight trend chart (pure SVG) ─────────────────────── */
function WeightChart({ photos }: { photos: PhotoRecord[] }) {
  const pts = [...photos]
    .filter((p) => p.weight_kg != null)
    .sort((a, b) => a.date.localeCompare(b.date))

  if (pts.length < 2) return null

  const W = 440, H = 120
  const PAD = { top: 22, right: 20, bottom: 30, left: 44 }
  const iW = W - PAD.left - PAD.right
  const iH = H - PAD.top - PAD.bottom

  const vals = pts.map((p) => p.weight_kg!)
  const lo = Math.min(...vals), hi = Math.max(...vals)
  const span = hi - lo || 1
  const pad = span * 0.2

  const xOf = (i: number) => PAD.left + (i / (pts.length - 1)) * iW
  const yOf = (v: number) => PAD.top + ((hi + pad - v) / (span + pad * 2)) * iH

  // Smooth cubic bezier through points
  const linePath = pts.map((p, i) => {
    const x = xOf(i), y = yOf(p.weight_kg!)
    if (i === 0) return `M${x},${y}`
    const px = xOf(i - 1), py = yOf(pts[i - 1].weight_kg!)
    const mx = (x + px) / 2
    return `C${mx},${py} ${mx},${y} ${x},${y}`
  }).join(' ')

  const areaPath =
    linePath +
    ` L${xOf(pts.length - 1)},${PAD.top + iH} L${PAD.left},${PAD.top + iH} Z`

  // Y axis ticks (3 levels)
  const ticks = [lo, (lo + hi) / 2, hi]

  return (
    <div className="border-t border-[var(--border-8)] px-4 pt-4 pb-3">
      <p className="text-xs font-semibold text-[var(--fg-40)] uppercase tracking-wider mb-3 flex items-center gap-1.5">
        <TrendingDown className="h-3.5 w-3.5" />
        Weight Trend
      </p>
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H}`} style={{ minWidth: W, height: H }} className="w-full">
          <defs>
            <linearGradient id="wGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="var(--accent)" stopOpacity={0.18} />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity={0}    />
            </linearGradient>
          </defs>

          {/* Y axis grid + labels */}
          {ticks.map((v, i) => {
            const y = yOf(v)
            return (
              <g key={i}>
                <line x1={PAD.left} y1={y} x2={W - PAD.right} y2={y}
                  stroke="var(--border-5)" strokeWidth={1} strokeDasharray="3 3" />
                <text x={PAD.left - 6} y={y + 3.5} textAnchor="end" fontSize={9} fill="var(--fg-30)">
                  {v.toFixed(1)}
                </text>
              </g>
            )
          })}

          {/* Area + line */}
          <path d={areaPath} fill="url(#wGrad)" />
          <path d={linePath} fill="none" stroke="var(--accent)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />

          {/* Dots + x-labels */}
          {pts.map((p, i) => {
            const x = xOf(i), y = yOf(p.weight_kg!)
            const showLabel = pts.length <= 7 || i === 0 || i === pts.length - 1
            return (
              <g key={i}>
                <circle cx={x} cy={y} r={4} fill="var(--accent)" opacity={0.9} />
                <circle cx={x} cy={y} r={2} fill="var(--bg-surface)" />
                {showLabel && (
                  <text x={x} y={H - 4} textAnchor="middle" fontSize={8.5} fill="var(--fg-30)">
                    {new Date(p.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </text>
                )}
              </g>
            )
          })}
        </svg>
      </div>
    </div>
  )
}

/* ── Compare slot ──────────────────────────────────────── */
function CompareSlot({ label, photo }: { label: 'BEFORE' | 'AFTER'; photo: PhotoRecord | null }) {
  const accent = label === 'BEFORE' ? 'text-blue-400' : 'text-[var(--accent-fg)]'
  return (
    <div className="flex flex-col gap-1.5">
      <span className={`text-[11px] font-bold uppercase tracking-widest text-center ${accent}`}>{label}</span>
      <div className="aspect-[3/4] rounded-xl overflow-hidden bg-[var(--bg-hover)] border border-[var(--border-8)]">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo.signed_url} alt={label} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[var(--fg-20)] text-xs">
            Select date
          </div>
        )}
      </div>
      {photo && (
        <p className="text-center text-[11px] text-[var(--fg-40)]">
          {fmtShort(photo.date)}{photo.weight_kg != null ? ` · ${photo.weight_kg} kg` : ''}
        </p>
      )}
    </div>
  )
}

/* ── Main component ────────────────────────────────────── */
export function ProgressTab({ photos }: Props) {
  const [mode, setMode]         = useState<Mode>('grid')
  const [lightbox, setLightbox] = useState<PhotoRecord | null>(null)
  const [beforeId, setBeforeId] = useState('')
  const [afterId, setAfterId]   = useState('')

  const sorted     = [...photos].sort((a, b) => b.date.localeCompare(a.date))
  const beforePhoto = photos.find((p) => p.id === beforeId) ?? null
  const afterPhoto  = photos.find((p) => p.id === afterId)  ?? null

  if (photos.length === 0) {
    return (
      <div className="p-12 flex flex-col items-center gap-3 text-center">
        <Camera className="h-8 w-8 text-[var(--fg-20)]" />
        <p className="font-medium">No progress photos yet</p>
        <p className="text-sm text-[var(--fg-40)]">The client hasn&apos;t uploaded any photos yet.</p>
      </div>
    )
  }

  return (
    <>
      {/* Controls bar */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border-8)]">
        <div className="flex bg-[var(--bg-hover)] rounded-xl p-1 gap-0.5">
          {([['grid', 'Grid', LayoutGrid], ['compare', 'Compare', GitCompare]] as const).map(([m, label, Icon]) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                mode === m
                  ? 'bg-[var(--bg-surface)] text-[var(--fg)] shadow-sm'
                  : 'text-[var(--fg-40)] hover:text-[var(--fg)]'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>
        <span className="ml-auto text-xs text-[var(--fg-40)]">
          {photos.length} photo{photos.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* ── Grid mode ─────────────────────────────── */}
      {mode === 'grid' && (
        <>
          <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {sorted.map((photo) => (
              <button
                key={photo.id}
                onClick={() => setLightbox(photo)}
                className="group relative aspect-square rounded-xl overflow-hidden bg-[var(--bg-hover)]
                  hover:ring-2 hover:ring-[var(--accent)] transition-all cursor-pointer"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.signed_url}
                  alt={`Progress ${photo.date}`}
                  className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-300"
                />
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent px-2.5 py-2">
                  <p className="text-white text-[11px] font-medium leading-none">{fmtShort(photo.date)}</p>
                  {photo.weight_kg != null && (
                    <p className="text-white/70 text-[10px] mt-0.5">{photo.weight_kg} kg</p>
                  )}
                </div>
              </button>
            ))}
          </div>
          <WeightChart photos={photos} />
        </>
      )}

      {/* ── Compare mode ──────────────────────────── */}
      {mode === 'compare' && (
        <div className="p-4 flex flex-col gap-4">
          {/* Selectors */}
          <div className="grid grid-cols-2 gap-3">
            {(
              [
                { label: 'Before', value: beforeId, set: setBeforeId },
                { label: 'After',  value: afterId,  set: setAfterId  },
              ] as const
            ).map(({ label, value, set }) => (
              <div key={label}>
                <label className="text-xs font-semibold text-[var(--fg-40)] uppercase tracking-wider block mb-1.5">
                  {label}
                </label>
                <select
                  value={value}
                  onChange={(e) => set(e.target.value)}
                  className="w-full bg-[var(--bg-input)] border border-[var(--border-8)] rounded-xl px-3 py-2 text-sm text-[var(--fg)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                >
                  <option value="">Select date…</option>
                  {sorted.map((p) => (
                    <option key={p.id} value={p.id}>
                      {fmtShort(p.date)}{p.weight_kg != null ? ` · ${p.weight_kg} kg` : ''}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          {/* Side-by-side */}
          {(beforeId || afterId) ? (
            <div className="grid grid-cols-2 gap-3">
              <CompareSlot label="BEFORE" photo={beforePhoto} />
              <CompareSlot label="AFTER"  photo={afterPhoto}  />
            </div>
          ) : (
            <div className="text-center py-10 text-[var(--fg-30)] text-sm">
              Select two dates above to compare side by side.
            </div>
          )}

          {/* Delta if both selected with weights */}
          {beforePhoto?.weight_kg != null && afterPhoto?.weight_kg != null && (
            <div className="flex items-center justify-center gap-3 bg-[var(--bg-hover)] rounded-xl px-4 py-3">
              <span className="text-xs text-[var(--fg-40)]">Weight change:</span>
              <span className={`text-sm font-bold ${
                afterPhoto.weight_kg < beforePhoto.weight_kg ? 'text-green-400' : 'text-orange-400'
              }`}>
                {afterPhoto.weight_kg < beforePhoto.weight_kg ? '−' : '+'}
                {Math.abs(afterPhoto.weight_kg - beforePhoto.weight_kg).toFixed(1)} kg
              </span>
              <span className="text-xs text-[var(--fg-30)]">
                ({beforePhoto.weight_kg} → {afterPhoto.weight_kg} kg)
              </span>
            </div>
          )}
        </div>
      )}

      {/* ── Lightbox ──────────────────────────────── */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/92 p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors z-10"
            onClick={() => setLightbox(null)}
          >
            <X className="h-5 w-5" />
          </button>
          <div className="max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={lightbox.signed_url}
              alt={`Progress ${lightbox.date}`}
              className="w-full rounded-2xl object-contain max-h-[80dvh]"
            />
            <div className="mt-3 text-center">
              <p className="text-white font-medium">{fmtLong(lightbox.date)}</p>
              {lightbox.weight_kg != null && (
                <p className="text-white/60 text-sm mt-1">{lightbox.weight_kg} kg</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
