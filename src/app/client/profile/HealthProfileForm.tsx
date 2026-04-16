'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { User, Heart, Activity, CheckCircle2 } from 'lucide-react'

interface ProfileData {
  // Personal Stats
  weight: string
  height: string
  age: string
  gender: string
  bodyFat: string
  // Medical Data
  bpSystolic: string
  bpDiastolic: string
  heartRate: string
  bloodSugar: string
  cholesterol: string
  // Lifestyle
  activityLevel: string
  primaryGoal: string
  injuries: string
  medications: string
}

const EMPTY: ProfileData = {
  weight: '', height: '', age: '', gender: '', bodyFat: '',
  bpSystolic: '', bpDiastolic: '', heartRate: '', bloodSugar: '', cholesterol: '',
  activityLevel: '', primaryGoal: '', injuries: '', medications: '',
}

const ACTIVITY_OPTIONS = [
  { value: 'sedentary', label: 'Sedentary', desc: 'Little or no exercise' },
  { value: 'lightly_active', label: 'Lightly Active', desc: '1–3 days/week' },
  { value: 'very_active', label: 'Very Active', desc: '6–7 days/week' },
]

const GOAL_OPTIONS = [
  { value: 'fat_loss', label: 'Fat Loss', emoji: '🔥' },
  { value: 'muscle_gain', label: 'Muscle Gain', emoji: '💪' },
  { value: 'endurance', label: 'Endurance', emoji: '🏃' },
  { value: 'general_health', label: 'General Health', emoji: '❤️' },
]

export function HealthProfileForm({
  clientId,
  initialData,
  updatedAt,
}: {
  clientId: string
  initialData: Partial<ProfileData> | null
  updatedAt: string | null
}) {
  const [data, setData] = useState<ProfileData>({ ...EMPTY, ...(initialData ?? {}) })
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  function set(key: keyof ProfileData, value: string) {
    setSaved(false)
    setData((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase
      .from('health_profiles')
      .upsert({ client_id: clientId, data, updated_at: new Date().toISOString() }, {
        onConflict: 'client_id',
      })

    if (error) {
      setError(error.message)
    } else {
      setSaved(true)
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">

      {/* ── Personal Stats ─────────────────────────── */}
      <section className="bg-[var(--bg-surface)] border border-[var(--border-8)] rounded-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-[var(--border-8)]">
          <div className="h-8 w-8 rounded-lg bg-blue-500/15 flex items-center justify-center">
            <User className="h-4 w-4 text-blue-400" />
          </div>
          <h2 className="font-semibold">Personal Stats</h2>
        </div>
        <div className="p-6 grid grid-cols-2 gap-4">
          <Input
            label="Weight (kg)"
            type="number"
            placeholder="70"
            min={20} max={300}
            value={data.weight}
            onChange={(e) => set('weight', e.target.value)}
          />
          <Input
            label="Height (cm)"
            type="number"
            placeholder="175"
            min={50} max={250}
            value={data.height}
            onChange={(e) => set('height', e.target.value)}
          />
          <Input
            label="Age"
            type="number"
            placeholder="25"
            min={10} max={120}
            value={data.age}
            onChange={(e) => set('age', e.target.value)}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--fg-70)]">Gender</label>
            <select
              value={data.gender}
              onChange={(e) => set('gender', e.target.value)}
              className="bg-[var(--bg-input)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--fg)]
                focus:outline-none focus:ring-2 focus:ring-[var(--accent-ring)] focus:border-[var(--accent-border)] transition-all"
            >
              <option value="">Select…</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer_not">Prefer not to say</option>
            </select>
          </div>
          <div className="col-span-2">
            <Input
              label="Body Fat % (optional)"
              type="number"
              placeholder="e.g. 18"
              min={3} max={60}
              value={data.bodyFat}
              onChange={(e) => set('bodyFat', e.target.value)}
            />
          </div>

          {/* BMI indicator */}
          {data.weight && data.height && (
            <div className="col-span-2 bg-[var(--accent-wash)] border border-[var(--accent-border-sub)] rounded-xl px-4 py-3 flex items-center justify-between">
              <span className="text-sm text-[var(--fg-60)]">Calculated BMI</span>
              <span className="font-bold text-[var(--accent-fg)]">
                {(Number(data.weight) / Math.pow(Number(data.height) / 100, 2)).toFixed(1)}
              </span>
            </div>
          )}
        </div>
      </section>

      {/* ── Medical Data ───────────────────────────── */}
      <section className="bg-[var(--bg-surface)] border border-[var(--border-8)] rounded-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-[var(--border-8)]">
          <div className="h-8 w-8 rounded-lg bg-red-500/15 flex items-center justify-center">
            <Heart className="h-4 w-4 text-red-400" />
          </div>
          <h2 className="font-semibold">Medical Data</h2>
        </div>
        <div className="p-6 flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium text-[var(--fg-70)] block mb-2">
              Blood Pressure (mmHg)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <Input
                placeholder="Systolic (e.g. 120)"
                type="number"
                min={60} max={250}
                value={data.bpSystolic}
                onChange={(e) => set('bpSystolic', e.target.value)}
              />
              <Input
                placeholder="Diastolic (e.g. 80)"
                type="number"
                min={40} max={150}
                value={data.bpDiastolic}
                onChange={(e) => set('bpDiastolic', e.target.value)}
              />
            </div>
          </div>
          <Input
            label="Resting Heart Rate (bpm)"
            type="number"
            placeholder="e.g. 65"
            min={30} max={200}
            value={data.heartRate}
            onChange={(e) => set('heartRate', e.target.value)}
          />
          <Input
            label="Fasting Blood Sugar (mg/dL) — optional"
            type="number"
            placeholder="e.g. 95"
            min={40} max={500}
            value={data.bloodSugar}
            onChange={(e) => set('bloodSugar', e.target.value)}
          />
          <Input
            label="Total Cholesterol (mg/dL) — optional"
            type="number"
            placeholder="e.g. 180"
            min={50} max={600}
            value={data.cholesterol}
            onChange={(e) => set('cholesterol', e.target.value)}
          />
        </div>
      </section>

      {/* ── Lifestyle ──────────────────────────────── */}
      <section className="bg-[var(--bg-surface)] border border-[var(--border-8)] rounded-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-[var(--border-8)]">
          <div className="h-8 w-8 rounded-lg bg-[var(--accent-tint)] flex items-center justify-center">
            <Activity className="h-4 w-4 text-[var(--accent-fg)]" />
          </div>
          <h2 className="font-semibold">Lifestyle</h2>
        </div>
        <div className="p-6 flex flex-col gap-5">

          {/* Activity level */}
          <div>
            <label className="text-sm font-medium text-[var(--fg-70)] block mb-2">Activity Level</label>
            <div className="grid grid-cols-3 gap-2">
              {ACTIVITY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => set('activityLevel', opt.value)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 text-center transition-all ${
                    data.activityLevel === opt.value
                      ? 'border-[var(--accent)] bg-[var(--accent-tint)]'
                      : 'border-[var(--border-8)] bg-[var(--bg-elevated)] hover:border-[var(--border)]'
                  }`}
                >
                  <span className={`text-sm font-semibold ${data.activityLevel === opt.value ? 'text-[var(--accent-fg)]' : 'text-[var(--fg)]'}`}>
                    {opt.label}
                  </span>
                  <span className="text-xs text-[var(--fg-40)]">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Primary goal */}
          <div>
            <label className="text-sm font-medium text-[var(--fg-70)] block mb-2">Primary Goal</label>
            <div className="grid grid-cols-2 gap-2">
              {GOAL_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => set('primaryGoal', opt.value)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all ${
                    data.primaryGoal === opt.value
                      ? 'border-[var(--accent)] bg-[var(--accent-tint)]'
                      : 'border-[var(--border-8)] bg-[var(--bg-elevated)] hover:border-[var(--border)]'
                  }`}
                >
                  <span className="text-xl">{opt.emoji}</span>
                  <span className={`text-sm font-medium ${data.primaryGoal === opt.value ? 'text-[var(--accent-fg)]' : 'text-[var(--fg)]'}`}>
                    {opt.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Text fields */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--fg-70)]">
              Injuries or Physical Limitations
            </label>
            <textarea
              value={data.injuries}
              onChange={(e) => set('injuries', e.target.value)}
              placeholder="e.g. Lower back pain, knee surgery in 2022…"
              rows={3}
              className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--fg)] placeholder:text-[var(--fg-30)]
                focus:outline-none focus:ring-2 focus:ring-[var(--accent-ring)] focus:border-[var(--accent-border)] transition-all resize-none"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--fg-70)]">
              Current Medications or Conditions
            </label>
            <textarea
              value={data.medications}
              onChange={(e) => set('medications', e.target.value)}
              placeholder="e.g. Type 2 diabetes, metformin 500mg…"
              rows={3}
              className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--fg)] placeholder:text-[var(--fg-30)]
                focus:outline-none focus:ring-2 focus:ring-[var(--accent-ring)] focus:border-[var(--accent-border)] transition-all resize-none"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      <div className="flex items-center justify-between gap-4">
        {updatedAt ? (
          <p className="text-xs text-[var(--fg-40)]">
            Last saved {new Date(updatedAt).toLocaleDateString('en-US', {
              month: 'short', day: 'numeric', year: 'numeric',
            })}
          </p>
        ) : (
          <p className="text-xs text-[var(--fg-40)]">Not saved yet</p>
        )}
        <Button type="submit" loading={loading} size="lg">
          {saved ? (
            <>
              <CheckCircle2 className="h-4 w-4" />
              Saved!
            </>
          ) : 'Save Profile'}
        </Button>
      </div>
    </form>
  )
}
