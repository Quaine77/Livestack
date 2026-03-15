'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, signOut } from '@/lib/supabase'
import { useAuth } from '@/lib/useAuth'

const PARISHES = [
  'Kingston','St. Andrew','St. Thomas','Portland','St. Mary',
  'St. Ann','Trelawny','St. James','Hanover','Westmoreland',
  'St. Elizabeth','Manchester','Clarendon','St. Catherine',
]

export default function ProfilePage() {
  const { user, profile, loading: authLoading } = useAuth()
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({
    full_name: '',
    farm_name: '',
    parish: '',
    rada_id: '',
  })

  useEffect(() => {
    if (!authLoading && !user) router.push('/login')
  }, [user, authLoading, router])

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || '',
        farm_name: profile.farm_name || '',
        parish:    profile.parish    || '',
        rada_id:   profile.rada_id   || '',
      })
    }
  }, [profile])

  function set(key: string, val: string) {
    setForm(p => ({ ...p, [key]: val }))
    setSaved(false)
  }

  async function save() {
    if (!user) return
    setSaving(true)
    await supabase.from('profiles').upsert({
      id:        user.id,
      full_name: form.full_name,
      farm_name: form.farm_name,
      parish:    form.parish,
      rada_id:   form.rada_id,
    })
    setSaving(false)
    setSaved(true)
  }

  if (authLoading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  )

  if (!user) return null

  return (
    <div className="min-h-screen bg-black text-white">

      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/" className="flex items-center gap-2 hover:opacity-70 transition-opacity">
              <div className="w-7 h-7 bg-green-500 rounded-lg flex items-center justify-center">
                <div className="w-2.5 h-2.5 bg-black rounded-full animate-pulse" />
              </div>
              <span className="font-bold text-sm">LiveStack</span>
            </a>
            <span className="text-white/20">/</span>
            <span className="text-white/60 text-sm">Profile</span>
          </div>
          <a href="/dashboard" className="text-xs border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-lg text-white/60 hover:text-white transition-all">
            Dashboard
          </a>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-6 py-8">

        {/* Avatar */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 bg-green-500/20 border border-green-500/30 rounded-2xl flex items-center justify-center text-2xl">
            👨‍🌾
          </div>
          <div>
            <div className="font-black text-xl">{form.full_name || 'Farmer'}</div>
            <div className="text-white/40 text-sm">{user.email}</div>
            {form.farm_name && (
              <div className="text-green-400 text-xs mt-0.5">{form.farm_name}</div>
            )}
          </div>
        </div>

        {/* Form */}
        <div className="space-y-4">

          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
            <div className="text-xs font-medium text-white/30 uppercase tracking-wider">Personal info</div>

            <div>
              <label className="text-xs text-white/30 uppercase tracking-wider block mb-2">Full name</label>
              <input
                value={form.full_name}
                onChange={e => set('full_name', e.target.value)}
                placeholder="Your full name"
                className="w-full bg-white/5 border border-white/10 text-white placeholder-white/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/30"
              />
            </div>

            <div>
              <label className="text-xs text-white/30 uppercase tracking-wider block mb-2">Email</label>
              <div className="w-full bg-white/5 border border-white/10 text-white/40 rounded-xl px-4 py-3 text-sm">
                {user.email}
              </div>
              <p className="text-white/20 text-xs mt-1">Email cannot be changed</p>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
            <div className="text-xs font-medium text-white/30 uppercase tracking-wider">Farm details</div>

            <div>
              <label className="text-xs text-white/30 uppercase tracking-wider block mb-2">Farm name</label>
              <input
                value={form.farm_name}
                onChange={e => set('farm_name', e.target.value)}
                placeholder="e.g. Greenview Farm"
                className="w-full bg-white/5 border border-white/10 text-white placeholder-white/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/30"
              />
            </div>

            <div>
              <label className="text-xs text-white/30 uppercase tracking-wider block mb-2">Parish</label>
              <select
                value={form.parish}
                onChange={e => set('parish', e.target.value)}
                className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/30"
              >
                <option value="">Select parish...</option>
                {PARISHES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            <div>
              <label className="text-xs text-white/30 uppercase tracking-wider block mb-2">RADA ID</label>
              <input
                value={form.rada_id}
                onChange={e => set('rada_id', e.target.value)}
                placeholder="e.g. RADA-2024-001"
                className="w-full bg-white/5 border border-white/10 text-white placeholder-white/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/30"
              />
              <p className="text-white/20 text-xs mt-1">Leave blank if not yet registered with RADA</p>
            </div>
          </div>

          {/* Account stats */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <div className="text-xs font-medium text-white/30 uppercase tracking-wider mb-3">Account</div>
            <div className="space-y-2 text-xs">
              {[
                ['Account ID',  user.id.slice(0, 8) + '...'],
                ['Joined',      new Date(user.created_at).toLocaleDateString()],
                ['Status',      'Active · Verified'],
                ['Plan',        'RADA Farmer'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between py-1.5 border-b border-white/5 last:border-0">
                  <span className="text-white/30">{k}</span>
                  <span className="text-white/60 font-mono">{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Save */}
          <button
            onClick={save}
            disabled={saving}
            className="w-full bg-green-500 hover:bg-green-400 disabled:opacity-50 text-black font-bold py-4 rounded-xl transition-colors"
          >
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                Saving...
              </span>
            ) : saved ? '✓ Saved' : 'Save changes'}
          </button>

          {/* Sign out */}
          <button
            onClick={() => signOut()}
            className="w-full border border-red-500/20 hover:border-red-500/40 text-red-400 hover:text-red-300 py-3 rounded-xl text-sm transition-colors"
          >
            Sign out
          </button>
        </div>
      </main>
    </div>
  )
}