'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface Animal {
  id: string
  tag_id: string
  name: string
  species: string
  breed: string
  weight_kg: number
  status: string
  heart_rate: number
  blood_pressure_sys: number
  blood_pressure_dia: number
  stress_level: number
  temperature: number
  breeding_status: string
  gestation_days: number
  last_heat_date: string
}

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

const BREEDING_CONFIG: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  none:     { label: 'Normal',    color: 'text-white/50',   bg: 'bg-white/5 border-white/10',           icon: '—'  },
  heat:     { label: 'In heat',   color: 'text-pink-400',   bg: 'bg-pink-500/10 border-pink-500/20',    icon: '♥'  },
  pregnant: { label: 'Pregnant',  color: 'text-blue-400',   bg: 'bg-blue-500/10 border-blue-500/20',    icon: '🤰' },
  labour:   { label: 'In labour', color: 'text-red-400',    bg: 'bg-red-500/10 border-red-500/20',      icon: '🚨' },
  nursing:  { label: 'Nursing',   color: 'text-green-400',  bg: 'bg-green-500/10 border-green-500/20',  icon: '🍼' },
}

const GESTATION_DAYS: Record<string, number> = {
  Cattle: 283, Goat: 150, Sheep: 147, Pig: 114, Horse: 340,
}

function VitalBar({ value, max, color, warning, critical }: {
  value: number; max: number; color: string; warning: number; critical: number
}) {
  const pct = Math.min((value / max) * 100, 100)
  const barColor = value >= critical ? '#ef4444' : value >= warning ? '#f59e0b' : color
  return (
    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
      <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${pct}%`, background: barColor }} />
    </div>
  )
}

function StressGauge({ value }: { value: number }) {
  const color = value >= 70 ? '#ef4444' : value >= 45 ? '#f59e0b' : '#22c55e'
  const label = value >= 70 ? 'High' : value >= 45 ? 'Moderate' : 'Low'
  const r = 28
  const circ = 2 * Math.PI * r
  const dash = (value / 100) * circ
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-16 h-16">
        <svg viewBox="0 0 64 64" className="w-full h-full -rotate-90">
          <circle cx="32" cy="32" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6"/>
          <circle cx="32" cy="32" r={r} fill="none" stroke={color} strokeWidth="6"
            strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 1s ease, stroke 0.5s ease' }}/>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-black" style={{ color }}>{value}%</span>
        </div>
      </div>
      <span className="text-xs mt-1" style={{ color }}>{label}</span>
    </div>
  )
}

export default function HealthPage() {
  const [animals, setAnimals] = useState<Animal[]>([])
  const [alerts, setAlerts] = useState<HealthAlert[]>([])
  const [baselines, setBaselines] = useState<Baseline[]>([])
  const [loading, setLoading] = useState(true)
  const [testing, setTesting] = useState<string | null>(null)
  const [selected, setSelected] = useState<Animal | null>(null)
  const [tab, setTab] = useState<'vitals'|'breeding'|'alerts'>('vitals')
  const [simVitals, setSimVitals] = useState<Record<string, Partial<Animal>>>({})

  useEffect(() => {
    async function load() {
      const [{ data: a }, { data: al }, { data: b }] = await Promise.all([
        supabase.from('animals').select('*').order('name'),
        supabase.from('health_alerts').select('*').eq('resolved', false).order('created_at', { ascending: false }),
        supabase.from('activity_baselines').select('*'),
      ])
      if (a) { setAnimals(a); setSelected(a[0] || null) }
      if (al) setAlerts(al)
      if (b) setBaselines(b)
      setLoading(false)
    }
    load()

    const channel = supabase.channel('health-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'health_alerts' },
        (payload: any) => setAlerts(prev => [payload.new, ...prev])
      )
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'animals' },
        (payload: any) => {
          setAnimals(prev => prev.map(a => a.id === payload.new.id ? { ...a, ...payload.new } : a))
          setSelected(prev => prev?.id === payload.new.id ? { ...prev, ...payload.new } : prev)
        }
      ).subscribe()

    // Simulate live vitals fluctuation
    const vitalsInterval = setInterval(() => {
      setSimVitals(prev => {
        const updated: Record<string, Partial<Animal>> = {}
        animals.forEach(a => {
          const base = prev[a.id] || {}
          updated[a.id] = {
            heart_rate: Math.max(50, Math.min(130, (base.heart_rate || a.heart_rate) + Math.round((Math.random() - 0.5) * 4))),
            stress_level: Math.max(0, Math.min(100, (base.stress_level || a.stress_level) + Math.round((Math.random() - 0.5) * 5))),
            temperature: Math.round((Math.max(37, Math.min(40.5, (base.temperature || a.temperature) + (Math.random() - 0.5) * 0.1))) * 10) / 10,
          }
        })
        return updated
      })
    }, 2000)

    return () => { supabase.removeChannel(channel); clearInterval(vitalsInterval) }
  }, [animals.length])

  function getVital(animal: Animal, key: keyof Animal) {
    return (simVitals[animal.id]?.[key] ?? animal[key]) as number
  }

  async function simulateReading(animal: Animal, low = false) {
    setTesting(animal.id)
    const score = low ? Math.round(20 + Math.random() * 25) : Math.round(80 + Math.random() * 20)
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

  function getGestationProgress(animal: Animal) {
    const total = GESTATION_DAYS[animal.species] || 283
    const days = animal.gestation_days || 0
    return { pct: Math.min((days / total) * 100, 100), total, days, remaining: Math.max(total - days, 0) }
  }

  const breedingAnimals = animals.filter(a => a.breeding_status && a.breeding_status !== 'none')
  const labourAnimals = animals.filter(a => a.breeding_status === 'labour')

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
      <style>{`
        @keyframes pulse-ring { 0%{transform:scale(1);opacity:0.6} 100%{transform:scale(2);opacity:0} }
        @keyframes heartbeat { 0%,100%{transform:scale(1)} 14%{transform:scale(1.15)} 28%{transform:scale(1)} 42%{transform:scale(1.08)} 56%{transform:scale(1)} }
        .heartbeat { animation: heartbeat 1.2s ease infinite; }
      `}</style>

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
            {labourAnimals.length > 0 && (
              <div className="flex items-center gap-1.5 text-xs bg-red-500/10 border border-red-500/30 text-red-400 px-3 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse"></span>
                {labourAnimals.length} in labour
              </div>
            )}
            <a href="/dashboard" className="text-xs border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-lg text-white/60 hover:text-white">Dashboard</a>
            <a href="/map" className="text-xs border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-lg text-white/60 hover:text-white">Map</a>
            <a href="/documents" className="text-xs border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-lg text-white/60 hover:text-white">Documents</a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6">

        {/* Labour alert banner */}
        {labourAnimals.length > 0 && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl px-6 py-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-2xl heartbeat">🚨</div>
              <div>
                <div className="font-bold text-red-400">Labour in progress</div>
                <div className="text-red-400/70 text-sm">
                  {labourAnimals.map(a => a.name).join(', ')} — immediate attention required
                </div>
              </div>
            </div>
            <button onClick={() => { setTab('breeding'); setSelected(labourAnimals[0]) }}
              className="text-xs bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-2 rounded-lg hover:bg-red-500/30 transition-colors">
              View now
            </button>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6">

          {/* Animal list */}
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-white/10">
              <div className="text-xs font-medium text-white/30 uppercase tracking-wider">Herd · {animals.length}</div>
            </div>
            <div className="divide-y divide-white/5 overflow-y-auto" style={{ maxHeight: '70vh' }}>
              {animals.map(a => {
                const hr = getVital(a, 'heart_rate')
                const stress = getVital(a, 'stress_level')
                const breeding = BREEDING_CONFIG[a.breeding_status] || BREEDING_CONFIG.none
                const isSelected = selected?.id === a.id
                const isCritical = stress >= 70 || hr > 100 || a.breeding_status === 'labour'

                return (
                  <div key={a.id} onClick={() => setSelected(a)}
                    className={`px-4 py-3.5 cursor-pointer transition-all ${
                      isSelected ? 'bg-white/10' : 'hover:bg-white/5'
                    }`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {isCritical && (
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse flex-shrink-0"></span>
                        )}
                        <span className="font-medium text-sm text-white">{a.name}</span>
                        <span className="text-white/30 text-xs">{a.tag_id}</span>
                      </div>
                      {a.breeding_status !== 'none' && (
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${breeding.bg} ${breeding.color}`}>
                          {breeding.icon}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <div className="text-white/30 mb-0.5">HR</div>
                        <div className={`font-mono font-medium ${hr > 100 ? 'text-red-400' : hr > 85 ? 'text-amber-400' : 'text-green-400'}`}>
                          {hr}bpm
                        </div>
                      </div>
                      <div>
                        <div className="text-white/30 mb-0.5">Stress</div>
                        <div className={`font-mono font-medium ${stress >= 70 ? 'text-red-400' : stress >= 45 ? 'text-amber-400' : 'text-green-400'}`}>
                          {stress}%
                        </div>
                      </div>
                      <div>
                        <div className="text-white/30 mb-0.5">Temp</div>
                        <div className={`font-mono font-medium ${getVital(a, 'temperature') > 39.5 ? 'text-red-400' : 'text-white/60'}`}>
                          {getVital(a, 'temperature')}°C
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Main panel */}
          <div className="md:col-span-2 space-y-4">

            {/* Tabs */}
            <div className="flex gap-1 bg-white/5 border border-white/10 rounded-xl p-1 w-fit">
              {(['vitals', 'breeding', 'alerts'] as const).map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className={`px-5 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                    tab === t ? 'bg-white text-black' : 'text-white/50 hover:text-white'
                  }`}>
                  {t === 'alerts' ? `Alerts${alerts.length > 0 ? ` (${alerts.length})` : ''}` : t}
                </button>
              ))}
            </div>

            {/* VITALS TAB */}
            {tab === 'vitals' && selected && (() => {
              const hr = getVital(selected, 'heart_rate')
              const stress = getVital(selected, 'stress_level')
              const temp = getVital(selected, 'temperature')
              const sys = selected.blood_pressure_sys
              const dia = selected.blood_pressure_dia
              return (
                <div className="space-y-4">
                  {/* Animal header */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center justify-between">
                    <div>
                      <div className="font-black text-xl text-white">{selected.name}</div>
                      <div className="text-white/40 text-sm mt-0.5">{selected.breed} {selected.species} · {selected.tag_id}</div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => simulateReading(selected, false)} disabled={testing === selected.id}
                        className="text-xs bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 px-3 py-1.5 rounded-lg disabled:opacity-40">
                        Normal reading
                      </button>
                      <button onClick={() => simulateReading(selected, true)} disabled={testing === selected.id}
                        className="text-xs bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 px-3 py-1.5 rounded-lg disabled:opacity-40">
                        {testing === selected.id ? '...' : 'Low reading'}
                      </button>
                    </div>
                  </div>

                  {/* Vitals grid */}
                  <div className="grid grid-cols-2 gap-3">

                    {/* Heart rate */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-xs text-white/30 uppercase tracking-wider">Heart rate</div>
                        <span className={`heartbeat text-lg ${hr > 100 ? 'text-red-400' : 'text-pink-400'}`}>♥</span>
                      </div>
                      <div className={`text-4xl font-black mb-1 ${hr > 100 ? 'text-red-400' : hr > 85 ? 'text-amber-400' : 'text-green-400'}`}>
                        {hr}
                      </div>
                      <div className="text-white/30 text-xs mb-3">bpm · normal 60–90</div>
                      <VitalBar value={hr} max={140} color="#22c55e" warning={90} critical={110}/>
                      <div className="text-xs mt-2 text-white/30">
                        {hr > 100 ? '⚠ Elevated — check animal' : hr < 55 ? '⚠ Low — monitor closely' : '✓ Normal range'}
                      </div>
                    </div>

                    {/* Blood pressure */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                      <div className="text-xs text-white/30 uppercase tracking-wider mb-3">Blood pressure</div>
                      <div className={`text-4xl font-black mb-1 ${sys > 135 ? 'text-red-400' : sys > 125 ? 'text-amber-400' : 'text-green-400'}`}>
                        {sys}<span className="text-xl text-white/40">/{dia}</span>
                      </div>
                      <div className="text-white/30 text-xs mb-3">mmHg · systolic/diastolic</div>
                      <VitalBar value={sys} max={180} color="#22c55e" warning={130} critical={145}/>
                      <div className="text-xs mt-2 text-white/30">
                        {sys > 140 ? '⚠ Hypertension — vet required' : sys > 130 ? '⚠ Elevated pressure' : '✓ Normal range'}
                      </div>
                    </div>

                    {/* Stress */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                      <div className="text-xs text-white/30 uppercase tracking-wider mb-3">Stress level</div>
                      <div className="flex items-center gap-4">
                        <StressGauge value={stress}/>
                        <div className="flex-1">
                          <div className="text-xs text-white/30 mb-2">Indicators</div>
                          {[
                            ['Behaviour', stress > 60 ? 'Agitated' : stress > 30 ? 'Restless' : 'Calm'],
                            ['Cortisol',  stress > 70 ? 'High' : stress > 40 ? 'Moderate' : 'Normal'],
                            ['Movement',  stress > 50 ? 'Erratic' : 'Regular'],
                          ].map(([k, v]) => (
                            <div key={k} className="flex justify-between text-xs py-1 border-b border-white/5 last:border-0">
                              <span className="text-white/30">{k}</span>
                              <span className={stress > 60 ? 'text-red-400' : stress > 35 ? 'text-amber-400' : 'text-green-400'}>{v}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Temperature */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                      <div className="text-xs text-white/30 uppercase tracking-wider mb-3">Temperature</div>
                      <div className={`text-4xl font-black mb-1 ${temp > 39.5 ? 'text-red-400' : temp > 39 ? 'text-amber-400' : 'text-green-400'}`}>
                        {temp}°C
                      </div>
                      <div className="text-white/30 text-xs mb-3">normal 38.0–39.5°C</div>
                      <VitalBar value={temp - 36} max={5} color="#22c55e" warning={3} critical={3.8}/>
                      <div className="text-xs mt-2 text-white/30">
                        {temp > 39.5 ? '⚠ Fever — vet attention needed' : temp < 37.5 ? '⚠ Hypothermia risk' : '✓ Normal range'}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })()}

            {/* BREEDING TAB */}
            {tab === 'breeding' && (
              <div className="space-y-4">
                {breedingAnimals.length === 0 ? (
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
                    <div className="text-4xl mb-4">🐄</div>
                    <p className="text-white font-medium">No breeding activity</p>
                    <p className="text-white/40 text-sm mt-1">No animals currently in heat, pregnant, or nursing</p>
                  </div>
                ) : breedingAnimals.map(a => {
                  const breeding = BREEDING_CONFIG[a.breeding_status] || BREEDING_CONFIG.none
                  const gestation = a.breeding_status === 'pregnant' ? getGestationProgress(a) : null
                  return (
                    <div key={a.id} className={`border rounded-2xl p-5 ${breeding.bg}`}>
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <span className="text-2xl">{breeding.icon}</span>
                            <div>
                              <div className="font-black text-white text-lg">{a.name}</div>
                              <div className="text-white/40 text-xs">{a.breed} {a.species} · {a.tag_id}</div>
                            </div>
                          </div>
                        </div>
                        <span className={`text-sm font-bold px-3 py-1.5 rounded-full border ${breeding.bg} ${breeding.color}`}>
                          {breeding.label}
                        </span>
                      </div>

                      {/* Labour */}
                      {a.breeding_status === 'labour' && (
                        <div className="space-y-3">
                          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                            <div className="font-bold text-red-400 mb-2 flex items-center gap-2">
                              <span className="heartbeat">🚨</span> Labour tracker
                            </div>
                            <div className="grid grid-cols-3 gap-3 text-xs">
                              {[
                                ['Stage',       'Active labour'],
                                ['Heart rate',  `${getVital(a, 'heart_rate')} bpm`],
                                ['Stress',      `${getVital(a, 'stress_level')}% — High`],
                                ['Temperature', `${getVital(a, 'temperature')}°C`],
                                ['BP',          `${a.blood_pressure_sys}/${a.blood_pressure_dia}`],
                                ['Action',      'Call vet NOW'],
                              ].map(([k, v]) => (
                                <div key={k} className="bg-red-500/10 rounded-lg p-2">
                                  <div className="text-red-400/60 mb-0.5">{k}</div>
                                  <div className="text-red-300 font-medium">{v}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="text-xs text-red-400/60 text-center">
                            Monitoring vitals every 30 seconds · LiveStack AI watching
                          </div>
                        </div>
                      )}

                      {/* Pregnant */}
                      {a.breeding_status === 'pregnant' && gestation && (
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-white/50">Gestation progress</span>
                            <span className="text-blue-400 font-medium">Day {gestation.days} of {gestation.total}</span>
                          </div>
                          <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full transition-all duration-1000"
                              style={{ width: `${gestation.pct}%` }}/>
                          </div>
                          <div className="grid grid-cols-3 gap-3 text-xs">
                            {[
                              ['Days remaining', `${gestation.remaining} days`],
                              ['Heart rate',     `${getVital(a, 'heart_rate')} bpm`],
                              ['Temperature',    `${getVital(a, 'temperature')}°C`],
                            ].map(([k, v]) => (
                              <div key={k} className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-2">
                                <div className="text-blue-400/60 mb-0.5">{k}</div>
                                <div className="text-blue-300 font-medium">{v}</div>
                              </div>
                            ))}
                          </div>
                          {gestation.remaining <= 14 && (
                            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-2 text-xs text-amber-400 text-center">
                              ⚠ Due within 2 weeks — prepare birthing area
                            </div>
                          )}
                        </div>
                      )}

                      {/* Heat */}
                      {a.breeding_status === 'heat' && (
                        <div className="space-y-3">
                          <div className="grid grid-cols-3 gap-3 text-xs">
                            {[
                              ['Heart rate',  `${getVital(a, 'heart_rate')} bpm`],
                              ['Stress',      `${getVital(a, 'stress_level')}%`],
                              ['Temperature', `${getVital(a, 'temperature')}°C`],
                            ].map(([k, v]) => (
                              <div key={k} className="bg-pink-500/10 border border-pink-500/20 rounded-lg p-2">
                                <div className="text-pink-400/60 mb-0.5">{k}</div>
                                <div className="text-pink-300 font-medium">{v}</div>
                              </div>
                            ))}
                          </div>
                          <div className="bg-pink-500/10 border border-pink-500/20 rounded-xl px-4 py-2 text-xs text-pink-400 text-center">
                            ♥ Optimal breeding window — 12–18 hours
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}

                {/* All animals breeding status table */}
                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                  <div className="px-5 py-3 border-b border-white/10">
                    <div className="text-xs font-medium text-white/30 uppercase tracking-wider">Full herd breeding status</div>
                  </div>
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/5">
                        {['Animal', 'Species', 'Status', 'Notes'].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-xs text-white/20 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {animals.map(a => {
                        const b = BREEDING_CONFIG[a.breeding_status] || BREEDING_CONFIG.none
                        return (
                          <tr key={a.id} className="hover:bg-white/5">
                            <td className="px-4 py-3 text-sm font-medium text-white">{a.name}</td>
                            <td className="px-4 py-3 text-xs text-white/50">{a.species}</td>
                            <td className="px-4 py-3">
                              <span className={`text-xs px-2 py-0.5 rounded-full border ${b.bg} ${b.color}`}>
                                {b.icon} {b.label}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-xs text-white/30">
                              {a.breeding_status === 'pregnant' ? `Day ${a.gestation_days}` :
                               a.breeding_status === 'labour' ? '🚨 Immediate attention' :
                               a.breeding_status === 'heat' ? 'Breeding window open' : '—'}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ALERTS TAB */}
            {tab === 'alerts' && (
              <div className="space-y-3">
                {alerts.length === 0 ? (
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
                    <div className="w-12 h-12 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <span className="text-green-400">✓</span>
                    </div>
                    <p className="text-white font-medium text-sm">No active alerts</p>
                    <p className="text-white/30 text-xs mt-1">All animals within normal parameters</p>
                  </div>
                ) : alerts.map(alert => {
                  const animal = animals.find(a => a.id === alert.animal_id)
                  return (
                    <div key={alert.id} className={`border rounded-2xl p-5 ${
                      alert.severity === 'high' ? 'bg-red-500/5 border-red-500/20' :
                      alert.severity === 'medium' ? 'bg-amber-500/5 border-amber-500/20' :
                      'bg-white/5 border-white/10'
                    }`}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-sm text-white">{animal?.name || 'Unknown'}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
                              alert.severity === 'high' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                              'bg-amber-500/10 border-amber-500/20 text-amber-400'
                            }`}>{alert.severity}</span>
                            <span className="text-xs text-white/30">{alert.alert_type.replace(/_/g, ' ')}</span>
                          </div>
                          <p className="text-sm text-white/60 leading-relaxed">{alert.message}</p>
                          <p className="text-xs text-white/20 mt-2">{new Date(alert.created_at).toLocaleString()}</p>
                        </div>
                        <button onClick={() => resolveAlert(alert.id)}
                          className="text-xs bg-white/5 border border-white/10 hover:border-white/20 text-white/40 hover:text-white px-3 py-1.5 rounded-lg flex-shrink-0">
                          Resolve
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}