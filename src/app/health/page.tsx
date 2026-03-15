'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Animal } from '@/lib/types'

interface HealthAlert {
  id: string
  animal_id: string
  alert_type: string
  severity: string
  message: string
  resolved: boolean
  created_at: string
}

interface Baseline {
  tag_id: string
  avg_score: number
  readings: number
}

const SEVERITY_STYLES: Record<string, { card: string; badge: string }> = {
  high:   { card: 'bg-red-500/5 border-red-500/20',    badge: 'bg-red-500/10 border-red-500/20 text-red-400' },
  medium: { card: 'bg-amber-500/5 border-amber-500/20', badge: 'bg-amber-500/10 border-amber-500/20 text-amber-400' },
  low:    { card: 'bg-blue-500/5 border-blue-500/20',   badge: 'bg-blue-500/10 border-blue-500/20 text-blue-400' },
}

export default function HealthPage() {
  const [animals, setAnimals] = useState<Animal[]>([])
  const [alerts, setAlerts] = useState<HealthAlert[]>([])
  const [baselines, setBaselines] = useState<Baseline[]>([])
  const [loading, setLoading] = useState(true)
  const [testing, setTesting] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const [{ data: a }, { data: al }, { data: b }] = await Promise.all([
        supabase.from('animals').select('*').order('created_at'),
        supabase.from('health_alerts').select('*').eq('resolved', false).order('created_at', { ascending: false }),
        supabase.from('activity_baselines').select('*'),
      ])
      if (a) setAnimals(a)
      if (al) setAlerts(al)
      if (b) setBaselines(b)
      setLoading(false)
    }
    load()

    const channel = supabase.channel('health-realtime')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'health_alerts' },
        (payload: any) => setAlerts(prev => [payload.new, ...prev])
      )
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'animals' },
        (payload: any) => setAnimals(prev =>
          prev.map(a => a.id === payload.new.id ? { ...a, ...payload.new } : a)
        )
      ).subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  async function simulateReading(animal: Animal, low = false) {
    setTesting(animal.id)
    const score = low
      ? Math.round(20 + Math.random() * 25)
      : Math.round(80 + Math.random() * 20)
    await fetch('/api/health', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tag_id: animal.tag_id, activity_score: score }),
    })
    setTesting(null)
  }

  async function resolveAlert(id: string) {
    await supabase.from('health_alerts').update({ resolved: true }).eq('id', id)
    setAlerts(prev => prev.filter(a => a.id !== id))
  }

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-white/40 text-sm">Loading health data...</p>
      </div>
    </div>
  )

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
            <span className="text-white/60 text-sm">AI Health</span>
          </div>
          <div className="flex items-center gap-2">
            <a href="/dashboard" className="text-xs border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-lg text-white/60 hover:text-white transition-all">Dashboard</a>
            <a href="/map" className="text-xs border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-lg text-white/60 hover:text-white transition-all">Map</a>
            <a href="/documents" className="text-xs border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-lg text-white/60 hover:text-white transition-all">Documents</a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">

        <div className="mb-8">
          <h1 className="text-2xl font-black tracking-tight">AI Health Monitor</h1>
          <p className="text-white/40 text-sm mt-1">Movement anomaly detection · Claude-powered alerts · Real-time</p>
        </div>

        {/* Active alerts */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="text-xs font-medium text-white/30 uppercase tracking-wider">
              Active alerts
            </div>
            <div className={`text-xs px-2.5 py-1 rounded-full border font-medium ${
              alerts.length > 0
                ? 'bg-red-500/10 border-red-500/20 text-red-400'
                : 'bg-green-500/10 border-green-500/20 text-green-400'
            }`}>
              {alerts.length} active
            </div>
          </div>

          {alerts.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-10 text-center">
              <div className="w-12 h-12 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-green-400">✓</span>
              </div>
              <p className="text-white font-medium text-sm">All animals healthy</p>
              <p className="text-white/30 text-xs mt-1">No anomalies detected</p>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map(alert => {
                const animal = animals.find(a => a.id === alert.animal_id)
                const style = SEVERITY_STYLES[alert.severity] || SEVERITY_STYLES.low
                return (
                  <div key={alert.id} className={`border rounded-2xl p-5 ${style.card}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-sm text-white">{animal?.name || 'Unknown'}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${style.badge}`}>
                            {alert.severity}
                          </span>
                          <span className="text-xs text-white/30">{alert.alert_type.replace(/_/g, ' ')}</span>
                        </div>
                        <p className="text-sm text-white/70 leading-relaxed">{alert.message}</p>
                        <p className="text-xs text-white/20 mt-2">
                          {new Date(alert.created_at).toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={() => resolveAlert(alert.id)}
                        className="text-xs bg-white/5 border border-white/10 hover:border-white/20 text-white/50 hover:text-white px-3 py-1.5 rounded-lg transition-all flex-shrink-0"
                      >
                        Resolve
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Herd table */}
        <div>
          <div className="text-xs font-medium text-white/30 uppercase tracking-wider mb-4">
            Herd health monitor
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  {['Animal', 'Tag', 'Avg activity', 'Readings', 'Status', 'Simulate'].map(h => (
                    <th key={h} className="px-5 py-4 text-left text-xs font-medium text-white/30 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {animals.map(a => {
                  const b = baselines.find(bl => bl.tag_id === a.tag_id)
                  return (
                    <tr key={a.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                            a.status === 'active'  ? 'bg-green-500 animate-pulse' :
                            a.status === 'alert'   ? 'bg-amber-400' :
                            a.status === 'blocked' ? 'bg-red-500' : 'bg-blue-400'
                          }`}/>
                          <span className="font-medium text-sm text-white">{a.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 font-mono text-xs text-white/30">{a.tag_id}</td>
                      <td className="px-5 py-4">
                        {b ? (
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-white/10 rounded-full h-1.5 max-w-16">
                              <div
                                className="h-1.5 rounded-full bg-green-500"
                                style={{ width: `${Math.min(b.avg_score, 100)}%` }}
                              />
                            </div>
                            <span className="text-xs text-white/50">{b.avg_score}/100</span>
                          </div>
                        ) : (
                          <span className="text-xs text-white/20">No data</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-xs text-white/30">{b?.readings ?? 0} pings</td>
                      <td className="px-5 py-4">
                        <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${
                          a.status === 'active'  ? 'bg-green-500/10 border-green-500/20 text-green-400' :
                          a.status === 'alert'   ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                          a.status === 'blocked' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                                                   'bg-blue-500/10 border-blue-500/20 text-blue-400'
                        }`}>
                          {a.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => simulateReading(a, false)}
                            disabled={testing === a.id}
                            className="text-xs bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 px-2.5 py-1 rounded-lg disabled:opacity-40 transition-colors"
                          >
                            Normal
                          </button>
                          <button
                            onClick={() => simulateReading(a, true)}
                            disabled={testing === a.id}
                            className="text-xs bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 px-2.5 py-1 rounded-lg disabled:opacity-40 transition-colors"
                          >
                            {testing === a.id ? '...' : 'Low'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-white/20 mt-3">
            Click <span className="text-red-400">Low</span> to simulate an anomaly — Claude generates a plain-English alert instantly.
          </p>
        </div>
      </main>
    </div>
  )
}