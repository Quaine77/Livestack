'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, signOut } from '@/lib/supabase'
import { useAuth } from '@/lib/useAuth'
import type { Animal } from '@/lib/types'

const STATUS_DOT: Record<string, string> = {
  active:   'bg-green-500 animate-pulse',
  alert:    'bg-amber-400',
  blocked:  'bg-red-500',
  for_sale: 'bg-blue-400',
}

const STATUS_BADGE: Record<string, string> = {
  active:   'bg-green-500/10 text-green-400 border border-green-500/20',
  alert:    'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  blocked:  'bg-red-500/10 text-red-400 border border-red-500/20',
  for_sale: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
}

const SPECIES_ICON: Record<string, string> = {
  Cattle: '🐄', Goat: '🐐', Sheep: '🐑', Pig: '🐖', Horse: '🐴',
}

export default function Dashboard() {
  const { user, profile, loading: authLoading } = useAuth()
  const router = useRouter()
  const [animals, setAnimals] = useState<Animal[]>([])
  const [tab, setTab] = useState<'herd' | 'alerts'>('herd')
  const [loading, setLoading] = useState(true)
  const [reporting, setReporting] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Animal | null>(null)
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    if (!authLoading && !user) router.push('/login')
  }, [user, authLoading, router])

  useEffect(() => {
    if (!user) return
    supabase.from('animals').select('*').order('created_at')
      .then(({ data }) => {
        if (data) setAnimals(data)
        setLoading(false)
      })

    const channel = supabase.channel('dashboard-realtime')
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'animals' },
        (payload: any) => {
          setAnimals(prev => prev.map(a => a.id === payload.new.id ? { ...a, ...payload.new } : a))
        }
      ).subscribe()

    const clock = setInterval(() => setTime(new Date()), 1000)
    return () => { supabase.removeChannel(channel); clearInterval(clock) }
  }, [user])

  async function reportTheft(animal: Animal) {
    if (!confirm(`Report ${animal.name} as stolen?\n\nThis will immediately block all sales of this animal.`)) return
    setReporting(animal.id)
    await supabase.from('animals').update({ status: 'blocked' }).eq('id', animal.id)
    await supabase.from('theft_reports').insert({
      animal_id: animal.id,
      tag_id: animal.tag_id,
      description: 'Reported stolen via dashboard',
      police_case: `JCF-${Date.now()}`,
    })
    setReporting(null)
  }

  const stats = {
    total:   animals.length,
    active:  animals.filter(a => a.status === 'active').length,
    alerts:  animals.filter(a => a.status === 'alert').length,
    blocked: animals.filter(a => a.status === 'blocked').length,
  }

  const filtered = animals.filter(a =>
    a.name?.toLowerCase().includes(search.toLowerCase()) ||
    a.tag_id?.toLowerCase().includes(search.toLowerCase()) ||
    a.breed?.toLowerCase().includes(search.toLowerCase()) ||
    a.species?.toLowerCase().includes(search.toLowerCase())
  )

  if (authLoading || loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-white/40 text-sm">Loading your herd...</p>
      </div>
    </div>
  )

  if (!user) return null

  return (
    <div className="min-h-screen bg-black text-white">

      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/" className="flex items-center gap-2 hover:opacity-70 transition-opacity">
              <div className="w-7 h-7 bg-green-500 rounded-lg flex items-center justify-center">
                <div className="w-2.5 h-2.5 bg-black rounded-full animate-pulse" />
              </div>
              <span className="font-bold text-sm">LiveStack</span>
            </a>
            <span className="text-white/20">/</span>
            <span className="text-white/60 text-sm">Dashboard</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-green-400 bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
              Live · {time.toLocaleTimeString()}
            </div>
            <a href="/register" className="text-xs bg-green-500 hover:bg-green-400 text-black font-bold px-3 py-1.5 rounded-lg transition-colors">+ Register</a>
            <a href="/map" className="text-xs border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-lg text-white/60 hover:text-white transition-all">Map</a>
            <a href="/health" className="text-xs border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-lg text-white/60 hover:text-white transition-all">Health</a>
            <a href="/documents" className="text-xs border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-lg text-white/60 hover:text-white transition-all">Documents</a>
            <a href="/verify?tagId=JM-005" className="text-xs bg-white text-black font-medium px-3 py-1.5 rounded-lg hover:bg-white/90 transition-colors">Verify</a>
            <a href="/profile"
              className="flex items-center gap-1.5 text-xs border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-lg text-white/60 hover:text-white transition-all">
              <span className="text-base">👨‍🌾</span>
              {profile?.full_name?.split(' ')[0] || 'Profile'}
            </a>
            <button
              onClick={() => signOut()}
              className="text-xs border border-white/10 hover:border-red-500/30 px-3 py-1.5 rounded-lg text-white/40 hover:text-red-400 transition-all"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">

        {/* Farm info */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-black tracking-tight">
                {profile?.farm_name || 'My Farm'}
              </h1>
              <span className="text-xs bg-green-500/10 border border-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                Verified
              </span>
            </div>
            <p className="text-white/40 text-sm">
              {profile?.full_name || user.email} ·{' '}
              {profile?.parish || 'Jamaica'} ·{' '}
              {profile?.rada_id || 'RADA pending'}
            </p>
          </div>
          <div className="text-right">
            <div className="text-white/40 text-xs">Last updated</div>
            <div className="text-white/60 text-sm font-mono">{time.toLocaleTimeString()}</div>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { label: 'Total herd', value: stats.total,   color: 'text-white',     sub: 'registered' },
            { label: 'Active',     value: stats.active,  color: 'text-green-400', sub: 'healthy & tracked' },
            { label: 'Alerts',     value: stats.alerts,  color: 'text-amber-400', sub: 'need attention' },
            { label: 'Blocked',    value: stats.blocked, color: 'text-red-400',   sub: 'theft reported' },
          ].map(({ label, value, color, sub }) => (
            <div key={label} className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-colors">
              <div className="text-white/40 text-xs mb-2 uppercase tracking-wider">{label}</div>
              <div className={`text-4xl font-black mb-1 ${color}`}>{value}</div>
              <div className="text-white/30 text-xs">{sub}</div>
            </div>
          ))}
        </div>

        {/* Empty state */}
        {animals.length === 0 && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center mb-6">
            <div className="text-5xl mb-4">🐄</div>
            <h2 className="text-xl font-bold text-white mb-2">No animals yet</h2>
            <p className="text-white/40 text-sm mb-6">
              Register your first animal to start tracking your herd
            </p>
            <a href="/register"
              className="inline-block bg-green-500 hover:bg-green-400 text-black font-bold px-8 py-3 rounded-xl transition-colors">
              Register first animal
            </a>
          </div>
        )}

        {animals.length > 0 && (
          <>
            {/* Search */}
            <div className="relative mb-4">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35" strokeLinecap="round"/>
              </svg>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name, tag ID, breed or species..."
                className="w-full bg-white/5 border border-white/10 text-white placeholder-white/20 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-white/30"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white text-lg">×</button>
              )}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-6 bg-white/5 border border-white/10 rounded-xl p-1 w-fit">
              {(['herd', 'alerts'] as const).map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                    tab === t ? 'bg-white text-black' : 'text-white/50 hover:text-white'
                  }`}>
                  {t === 'herd'
                    ? `Live herd${search ? ` (${filtered.length})` : ''}`
                    : `Alerts${stats.alerts > 0 ? ` (${stats.alerts})` : ''}`}
                </button>
              ))}
            </div>

            {/* Herd table */}
            {tab === 'herd' && (
              <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      {['Animal', 'Tag ID', 'Breed', 'Weight', 'Status', ''].map(h => (
                        <th key={h} className="px-5 py-4 text-left text-xs font-medium text-white/30 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filtered.length === 0 ? (
                      <tr><td colSpan={6} className="px-5 py-10 text-center text-white/30 text-sm">No animals match "{search}"</td></tr>
                    ) : filtered.map(a => (
                      <>
                        <tr key={a.id}
                          className="hover:bg-white/5 transition-colors group cursor-pointer"
                          onClick={() => setSelected(selected?.id === a.id ? null : a)}
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${STATUS_DOT[a.status]}`} />
                              <span className="font-medium text-sm text-white">{a.name}</span>
                              <span className="text-base">{SPECIES_ICON[a.species] || ''}</span>
                            </div>
                          </td>
                          <td className="px-5 py-4 font-mono text-xs text-white/40">{a.tag_id}</td>
                          <td className="px-5 py-4 text-sm text-white/60">{a.breed}</td>
                          <td className="px-5 py-4 text-sm text-white/60">{a.weight_kg}kg</td>
                          <td className="px-5 py-4">
                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_BADGE[a.status]}`}>
                              {a.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right">
                            {a.status !== 'blocked' && (
                              <button
                                onClick={e => { e.stopPropagation(); reportTheft(a) }}
                                disabled={reporting === a.id}
                                className="text-xs text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-all disabled:opacity-50"
                              >
                                {reporting === a.id ? 'Reporting...' : 'Report stolen'}
                              </button>
                            )}
                            {a.status === 'blocked' && <span className="text-xs text-red-400/60">🔒 Blocked</span>}
                          </td>
                        </tr>

                        {/* Expanded row */}
                        {selected?.id === a.id && (
                          <tr key={`${a.id}-detail`}>
                            <td colSpan={6} className="bg-white/5 border-t border-white/10 px-5 py-4">
                              <div className="flex gap-6 flex-wrap items-center">
                                <div>
                                  <div className="text-xs text-white/30 mb-1">RADA Licence</div>
                                  <div className="text-sm font-mono text-white">{a.rada_licence}</div>
                                </div>
                                <div>
                                  <div className="text-xs text-white/30 mb-1">Coordinates</div>
                                  <div className="text-sm font-mono text-white/60">{a.lat?.toFixed(4)}, {a.lng?.toFixed(4)}</div>
                                </div>
                                <div>
                                  <div className="text-xs text-white/30 mb-1">Owner</div>
                                  <div className="text-sm text-white">{profile?.full_name || user.email}</div>
                                </div>
                                <div className="flex gap-2 ml-auto">
                                  <a href={`/verify?tagId=${a.tag_id}`} className="text-xs bg-green-500/10 border border-green-500/20 text-green-400 px-3 py-1.5 rounded-lg hover:bg-green-500/20">Verify</a>
                                  <a href="/health" className="text-xs bg-blue-500/10 border border-blue-500/20 text-blue-400 px-3 py-1.5 rounded-lg hover:bg-blue-500/20">Health</a>
                                  <a href="/documents" className="text-xs bg-purple-500/10 border border-purple-500/20 text-purple-400 px-3 py-1.5 rounded-lg hover:bg-purple-500/20">Papers</a>
                                  <a href="/map" className="text-xs bg-amber-500/10 border border-amber-500/20 text-amber-400 px-3 py-1.5 rounded-lg hover:bg-amber-500/20">Map</a>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Alerts tab */}
            {tab === 'alerts' && (
              <div className="space-y-3">
                {animals.filter(a => a.status === 'alert' || a.status === 'blocked').length === 0 ? (
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
                    <div className="w-12 h-12 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <span className="text-green-400 text-xl">✓</span>
                    </div>
                    <p className="text-white font-medium">All animals healthy</p>
                    <p className="text-white/40 text-sm mt-1">No active alerts</p>
                  </div>
                ) : animals.filter(a => a.status === 'alert' || a.status === 'blocked').map(a => (
                  <div key={a.id} className={`border rounded-2xl p-5 flex items-center justify-between ${
                    a.status === 'blocked' ? 'bg-red-500/5 border-red-500/20' : 'bg-amber-500/5 border-amber-500/20'
                  }`}>
                    <div className="flex items-center gap-4">
                      <div className="text-2xl">{SPECIES_ICON[a.species] || '🐾'}</div>
                      <div>
                        <div className="font-medium text-sm text-white flex items-center gap-2">
                          {a.name}
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[a.status]}`}>
                            {a.status}
                          </span>
                        </div>
                        <div className="text-xs text-white/40 mt-0.5">
                          {a.status === 'blocked'
                            ? `Theft reported · ${a.tag_id} · Contact JCF`
                            : `AI detected reduced movement · ${a.tag_id}`}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <a href="/health" className="text-xs bg-amber-500/10 border border-amber-500/20 text-amber-400 px-3 py-1.5 rounded-lg hover:bg-amber-500/20">
                        Check health
                      </a>
                      {a.status !== 'blocked' && (
                        <button onClick={() => reportTheft(a)}
                          className="text-xs bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-500/20">
                          Report stolen
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}