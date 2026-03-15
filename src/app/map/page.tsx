'use client'
import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Animal } from '@/lib/types'

const FARM_BOUNDARY = [
  { lat: 18.0020, lng: -76.8000 },
  { lat: 18.0020, lng: -76.7850 },
  { lat: 17.9900, lng: -76.7850 },
  { lat: 17.9900, lng: -76.8000 },
]

const CENTER = { lat: 17.9960, lng: -76.7925 }
const SCALE = 8000

function toPixel(lat: number, lng: number, w: number, h: number) {
  const x = (lng - CENTER.lng) * SCALE * (w / 680) + w / 2
  const y = -(lat - CENTER.lat) * SCALE * (h / 480) + h / 2
  return { x, y }
}

const STATUS_COLOR: Record<string, string> = {
  active:   '#22c55e',
  alert:    '#f59e0b',
  blocked:  '#ef4444',
  for_sale: '#3b82f6',
}

export default function MapPage() {
  const [animals, setAnimals] = useState<Animal[]>([])
  const [selected, setSelected] = useState<Animal | null>(null)
  const [simulating, setSimulating] = useState(false)
  const [escapeId, setEscapeId] = useState('')
  const [size] = useState({ w: 680, h: 480 })
  const [alerts, setAlerts] = useState<string[]>([])

  useEffect(() => {
    supabase.from('animals').select('*').then(({ data }) => {
      if (data) setAnimals(data)
    })

    const channel = supabase.channel('map-realtime')
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'animals' },
        (payload: any) => {
          setAnimals(prev => prev.map(a =>
            a.id === payload.new.id ? { ...a, ...payload.new } : a
          ))
          if (payload.new.status === 'alert' && payload.old.status !== 'alert') {
            setAlerts(prev => [`${payload.new.name} left the farm boundary`, ...prev.slice(0, 3)])
          }
        }
      ).subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  const runSimulation = useCallback(async () => {
    setSimulating(true)
    await fetch('/api/simulate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ escape_tag_id: escapeId || null }),
    })
    setTimeout(() => setSimulating(false), 800)
  }, [escapeId])

  useEffect(() => {
    const id = setInterval(runSimulation, 3000)
    return () => clearInterval(id)
  }, [runSimulation])

  const boundaryPoints = FARM_BOUNDARY.map(p => toPixel(p.lat, p.lng, size.w, size.h))
  const polygonStr = boundaryPoints.map(p => `${p.x},${p.y}`).join(' ')

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">

      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/" className="flex items-center gap-2 hover:opacity-70 transition-opacity">
              <div className="w-7 h-7 bg-green-500 rounded-lg flex items-center justify-center">
                <div className="w-2.5 h-2.5 bg-black rounded-full animate-pulse" />
              </div>
              <span className="font-bold text-sm">LiveStack</span>
            </a>
            <span className="text-white/20">/</span>
            <span className="text-white/60 text-sm">Live map</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-all ${
              simulating
                ? 'bg-green-500/10 border-green-500/20 text-green-400'
                : 'bg-white/5 border-white/10 text-white/40'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${simulating ? 'bg-green-400 animate-pulse' : 'bg-white/20'}`}></span>
              {simulating ? 'Updating' : 'Live'}
            </div>
            <a href="/dashboard" className="text-xs border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-lg text-white/60 hover:text-white transition-all">
              Dashboard
            </a>
            <a href="/health" className="text-xs border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-lg text-white/60 hover:text-white transition-all">
              Health
            </a>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden" style={{ height: 'calc(100vh - 65px)' }}>

        {/* Map */}
        <div className="flex-1 relative bg-black overflow-hidden">
          <svg width="100%" height="100%" viewBox={`0 0 ${size.w} ${size.h}`} className="absolute inset-0">
            {/* Grid lines */}
            {Array.from({ length: 12 }).map((_, i) => (
              <g key={i}>
                <line x1={i * 57} y1="0" x2={i * 57} y2={size.h} stroke="#ffffff08" strokeWidth="1"/>
                <line x1="0" y1={i * 40} x2={size.w} y2={i * 40} stroke="#ffffff08" strokeWidth="1"/>
              </g>
            ))}

            {/* Farm boundary */}
            <polygon
              points={polygonStr}
              fill="#22c55e"
              fillOpacity="0.05"
              stroke="#22c55e"
              strokeWidth="1.5"
              strokeDasharray="6 3"
            />

            {/* Boundary label */}
            <text x="16" y="24" fill="#22c55e" fontSize="11" fontFamily="monospace" opacity="0.5">
              Greenview Farm
            </text>

            {/* Animals */}
            {animals.filter(a => a.lat && a.lng).map(a => {
              const { x, y } = toPixel(a.lat, a.lng, size.w, size.h)
              const color = STATUS_COLOR[a.status] || '#6b7280'
              const isSelected = selected?.id === a.id

              return (
                <g key={a.id} onClick={() => setSelected(selected?.id === a.id ? null : a)} style={{ cursor: 'pointer' }}>
                  {/* Pulse ring */}
                  {a.status === 'active' && (
                    <circle cx={x} cy={y} r="14" fill={color} opacity="0.08">
                      <animate attributeName="r" values="10;18;10" dur="2.5s" repeatCount="indefinite"/>
                      <animate attributeName="opacity" values="0.08;0.02;0.08" dur="2.5s" repeatCount="indefinite"/>
                    </circle>
                  )}
                  {a.status === 'alert' && (
                    <circle cx={x} cy={y} r="18" fill={color} opacity="0.12">
                      <animate attributeName="r" values="14;22;14" dur="1.2s" repeatCount="indefinite"/>
                    </circle>
                  )}

                  {/* Dot */}
                  <circle
                    cx={x} cy={y}
                    r={isSelected ? 9 : 7}
                    fill={color}
                    stroke="black"
                    strokeWidth="2"
                  />

                  {/* Label */}
                  <text
                    x={x} y={y - 13}
                    textAnchor="middle"
                    fill="white"
                    fontSize="10"
                    fontFamily="sans-serif"
                    opacity={isSelected ? 1 : 0.6}
                  >
                    {a.name}
                  </text>
                </g>
              )
            })}
          </svg>

          {/* Alert toasts */}
          {alerts.length > 0 && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 space-y-2 w-80">
              {alerts.map((alert, i) => (
                <div key={i} className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-400 text-center backdrop-blur-sm">
                  ⚠ {alert}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="w-64 border-l border-white/10 flex flex-col overflow-hidden bg-black">

          {/* Selected animal */}
          {selected && (
            <div className="p-4 border-b border-white/10 bg-white/5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: STATUS_COLOR[selected.status] }}></span>
                  <span className="font-semibold text-sm">{selected.name}</span>
                </div>
                <button onClick={() => setSelected(null)} className="text-white/30 hover:text-white text-xs">✕</button>
              </div>
              {[
                ['Tag', selected.tag_id],
                ['Breed', selected.breed],
                ['Weight', `${selected.weight_kg}kg`],
                ['Status', selected.status.replace('_', ' ')],
                ['Lat', selected.lat?.toFixed(4)],
                ['Lng', selected.lng?.toFixed(4)],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between py-1.5 border-b border-white/5 text-xs last:border-0">
                  <span className="text-white/30">{k}</span>
                  <span className="text-white/70 font-mono">{v}</span>
                </div>
              ))}
            </div>
          )}

          {/* Escape simulator */}
          <div className="p-4 border-b border-white/10">
            <div className="text-xs font-medium text-white/30 uppercase tracking-wider mb-3">Simulate escape</div>
            <select
              value={escapeId}
              onChange={e => setEscapeId(e.target.value)}
              className="w-full bg-white/5 border border-white/10 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-white/20"
            >
              <option value="">All inside boundary</option>
              {animals.filter(a => a.status !== 'blocked').map(a => (
                <option key={a.tag_id} value={a.tag_id}>{a.name}</option>
              ))}
            </select>
          </div>

          {/* Herd list */}
          <div className="p-4 flex-1 overflow-y-auto">
            <div className="text-xs font-medium text-white/30 uppercase tracking-wider mb-3">
              Herd · {animals.length}
            </div>
            <div className="space-y-1">
              {animals.map(a => (
                <div
                  key={a.id}
                  onClick={() => setSelected(a)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                    selected?.id === a.id
                      ? 'bg-white/10 border border-white/10'
                      : 'hover:bg-white/5'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: STATUS_COLOR[a.status] }}></span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-white truncate">{a.name}</div>
                    <div className="text-xs text-white/30">{a.tag_id}</div>
                  </div>
                  {a.status === 'alert' && (
                    <span className="text-xs bg-amber-500/10 border border-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-md">OUT</span>
                  )}
                  {a.status === 'blocked' && (
                    <span className="text-xs bg-red-500/10 border border-red-500/20 text-red-400 px-1.5 py-0.5 rounded-md">🔒</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="p-4 border-t border-white/10">
            <div className="text-xs font-medium text-white/30 uppercase tracking-wider mb-2">Legend</div>
            <div className="space-y-1.5">
              {[
                ['#22c55e', 'Active'],
                ['#f59e0b', 'Alert / outside'],
                ['#ef4444', 'Blocked'],
                ['#3b82f6', 'For sale'],
              ].map(([color, label]) => (
                <div key={label} className="flex items-center gap-2 text-xs text-white/40">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }}></span>
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}