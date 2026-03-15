'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
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

interface Ticket {
  id: string
  time: string
  level: 'info' | 'warning' | 'critical'
  message: string
}

const ESCAPE_ROUTE = [
  { lat: 17.9970, lng: -76.7936 },
  { lat: 17.9962, lng: -76.7918 },
  { lat: 17.9950, lng: -76.7898 },
  { lat: 17.9935, lng: -76.7875 },
  { lat: 17.9918, lng: -76.7848 },
  { lat: 17.9900, lng: -76.7820 },
  { lat: 17.9878, lng: -76.7795 },
  { lat: 17.9855, lng: -76.7768 },
  { lat: 17.9830, lng: -76.7740 },
]

export default function MapPage() {
  const [animals, setAnimals] = useState<Animal[]>([])
  const [selected, setSelected] = useState<Animal | null>(null)
  const [simulating, setSimulating] = useState(false)
  const [escapeId, setEscapeId] = useState('')
  const [size] = useState({ w: 680, h: 480 })
  const [demoMode, setDemoMode] = useState(false)
  const [demoStep, setDemoStep] = useState(0)
  const [trail, setTrail] = useState<{ lat: number; lng: number }[]>([])
  const [demoPos, setDemoPos] = useState(ESCAPE_ROUTE[0])
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [activeAlert, setActiveAlert] = useState<string | null>(null)
  const [alertLevel, setAlertLevel] = useState<'info'|'warning'|'critical'>('info')
  const demoRef = useRef<NodeJS.Timeout | null>(null)
  const audioCtx = useRef<AudioContext | null>(null)

  function playSound(type: 'ping' | 'warning' | 'alarm' | 'blocked') {
    try {
      if (!audioCtx.current) {
        audioCtx.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      }
      const ctx = audioCtx.current
      const now = ctx.currentTime

      if (type === 'ping') {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain); gain.connect(ctx.destination)
        osc.frequency.setValueAtTime(880, now)
        osc.frequency.exponentialRampToValueAtTime(660, now + 0.1)
        gain.gain.setValueAtTime(0.12, now)
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25)
        osc.start(now); osc.stop(now + 0.25)
      }

      if (type === 'warning') {
        [0, 0.28].forEach(delay => {
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.connect(gain); gain.connect(ctx.destination)
          osc.type = 'square'
          osc.frequency.setValueAtTime(520, now + delay)
          gain.gain.setValueAtTime(0.07, now + delay)
          gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.22)
          osc.start(now + delay); osc.stop(now + delay + 0.22)
        })
      }

      if (type === 'alarm') {
        [0, 0.18, 0.36, 0.54, 0.72].forEach((delay, i) => {
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.connect(gain); gain.connect(ctx.destination)
          osc.type = 'sawtooth'
          osc.frequency.setValueAtTime(i % 2 === 0 ? 700 : 560, now + delay)
          gain.gain.setValueAtTime(0.09, now + delay)
          gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.16)
          osc.start(now + delay); osc.stop(now + delay + 0.16)
        })
      }

      if (type === 'blocked') {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain); gain.connect(ctx.destination)
        osc.type = 'sawtooth'
        osc.frequency.setValueAtTime(220, now)
        osc.frequency.exponentialRampToValueAtTime(55, now + 0.7)
        gain.gain.setValueAtTime(0.18, now)
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7)
        osc.start(now); osc.stop(now + 0.7)

        const osc2 = ctx.createOscillator()
        const gain2 = ctx.createGain()
        osc2.connect(gain2); gain2.connect(ctx.destination)
        osc2.frequency.setValueAtTime(80, now)
        gain2.gain.setValueAtTime(0.25, now)
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.06)
        osc2.start(now); osc2.stop(now + 0.06)
      }
    } catch {}
  }

  useEffect(() => {
    supabase.from('animals').select('*').then(({ data }) => {
      if (data) setAnimals(data)
    })
    const channel = supabase.channel('map-realtime')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'animals' }, (payload: any) => {
        setAnimals(prev => prev.map(a => a.id === payload.new.id ? { ...a, ...payload.new } : a))
      }).subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  const runSimulation = useCallback(async () => {
    if (demoMode) return
    setSimulating(true)
    await fetch('/api/simulate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ escape_tag_id: escapeId || null }),
    })
    setTimeout(() => setSimulating(false), 800)
  }, [escapeId, demoMode])

  useEffect(() => {
    if (demoMode) return
    const id = setInterval(runSimulation, 3000)
    return () => clearInterval(id)
  }, [runSimulation, demoMode])

  function addTicket(level: Ticket['level'], message: string) {
    setTickets(prev => [{
      id: `TKT-${Date.now().toString().slice(-6)}`,
      time: new Date().toLocaleTimeString(),
      level,
      message,
    }, ...prev])
    setActiveAlert(message)
    setAlertLevel(level)
    setTimeout(() => setActiveAlert(null), 4000)
  }

  function startDemo() {
    setDemoMode(true)
    setDemoStep(0)
    setTrail([ESCAPE_ROUTE[0]])
    setDemoPos(ESCAPE_ROUTE[0])
    setTickets([])
    setActiveAlert(null)
    addTicket('info', 'Duchess (JM-005) — movement detected. Monitoring...')
    playSound('ping')

    let step = 0
    demoRef.current = setInterval(() => {
      step++
      if (step >= ESCAPE_ROUTE.length) {
        if (demoRef.current) clearInterval(demoRef.current)
        return
      }
      setDemoPos(ESCAPE_ROUTE[step])
      setDemoStep(step)
      setTrail(prev => [...prev, ESCAPE_ROUTE[step]])
      playSound('ping')

      if (step === 2) { addTicket('info', 'Duchess approaching farm boundary. Distance: 180m') }
      if (step === 3) { addTicket('warning', 'Duchess 40m from boundary — unusual movement pattern'); playSound('warning') }
      if (step === 4) { addTicket('warning', 'Duchess has crossed the farm boundary'); playSound('warning') }
      if (step === 6) { addTicket('critical', 'Duchess 600m outside boundary — possible theft'); playSound('alarm') }
      if (step === 8) { addTicket('critical', 'Duchess flagged stolen. Buyers blocked. JCF notified.'); playSound('blocked') }
    }, 1400)
  }

  function stopDemo() {
    if (demoRef.current) clearInterval(demoRef.current)
    setDemoMode(false)
    setDemoStep(0)
    setTrail([])
    setActiveAlert(null)
    setTickets([])
  }

  const boundaryPoints = FARM_BOUNDARY.map(p => toPixel(p.lat, p.lng, size.w, size.h))
  const polygonStr = boundaryPoints.map(p => `${p.x},${p.y}`).join(' ')
  const demoPixel = toPixel(demoPos.lat, demoPos.lng, size.w, size.h)

  const demoStage =
    demoStep < 3 ? 'monitoring' :
    demoStep < 4 ? 'warning' :
    demoStep < 6 ? 'breach' :
    demoStep < 8 ? 'suspected' : 'stolen'

  const demoColor =
    demoStage === 'monitoring' ? '#22c55e' :
    demoStage === 'warning'    ? '#f59e0b' :
    demoStage === 'breach'     ? '#f97316' :
    demoStage === 'suspected'  ? '#ef4444' : '#a855f7'

  const boundaryStroke = demoMode && demoStep >= 4 ? '#ef4444' : '#22c55e'

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.2} }
        @keyframes slidein { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes glow { 0%,100%{filter:drop-shadow(0 0 6px currentColor)} 50%{filter:drop-shadow(0 0 18px currentColor)} }
        @keyframes dash { to { stroke-dashoffset: -20; } }
        @keyframes scanline { 0%{transform:translateY(-100%)} 100%{transform:translateY(500%)} }
        .dash-anim { animation: dash 0.6s linear infinite; }
        .demo-glow { animation: glow 1.5s ease infinite; }
      `}</style>

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
            {demoMode ? (
              <>
                <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border transition-all duration-700"
                  style={{ background: `${demoColor}18`, borderColor: `${demoColor}50`, color: demoColor }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: demoColor, animation: 'blink 0.8s ease infinite' }}></span>
                  {demoStage === 'monitoring' ? 'Monitoring' :
                   demoStage === 'warning'    ? 'Near boundary' :
                   demoStage === 'breach'     ? '⚠ Boundary breached' :
                   demoStage === 'suspected'  ? '⚠ Possible theft' : '🔒 Animal stolen'}
                </div>
                <button onClick={stopDemo} className="text-xs border border-white/10 px-3 py-1.5 rounded-lg text-white/40 hover:text-white">End</button>
              </>
            ) : (
              <div className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border ${
                simulating ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-white/5 border-white/10 text-white/40'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${simulating ? 'bg-green-400 animate-pulse' : 'bg-white/20'}`}></span>
                {simulating ? 'Updating' : 'Live'}
              </div>
            )}
            <a href="/dashboard" className="text-xs border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-lg text-white/60 hover:text-white">Dashboard</a>
            <a href="/health" className="text-xs border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-lg text-white/60 hover:text-white">Health</a>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden" style={{ height: 'calc(100vh - 65px)' }}>

        {/* Map */}
        <div className="flex-1 relative overflow-hidden" style={{
          background: demoMode && demoStep >= 4
            ? 'radial-gradient(ellipse at 55% 60%, #1a0500 0%, #000000 70%)'
            : 'radial-gradient(ellipse at 55% 60%, #001508 0%, #000000 70%)',
          transition: 'background 2s ease'
        }}>

          {/* Scanline */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div style={{
              position: 'absolute', left: 0, right: 0, height: '3px',
              background: demoMode && demoStep >= 4
                ? 'linear-gradient(transparent, #ef444418, transparent)'
                : 'linear-gradient(transparent, #22c55e10, transparent)',
              animation: 'scanline 5s linear infinite'
            }} />
          </div>

          <svg width="100%" height="100%" viewBox={`0 0 ${size.w} ${size.h}`} className="absolute inset-0">
            <defs>
              <radialGradient id="bgGlow" cx="55%" cy="60%" r="50%">
                <stop offset="0%" stopColor={demoMode && demoStep >= 4 ? '#ef4444' : '#22c55e'} stopOpacity="0.07"/>
                <stop offset="100%" stopColor="black" stopOpacity="0"/>
              </radialGradient>
              <filter id="blur4"><feGaussianBlur stdDeviation="4"/></filter>
              <filter id="blur2"><feGaussianBlur stdDeviation="2"/></filter>
            </defs>

            {/* Background ambient glow */}
            <ellipse cx={size.w * 0.55} cy={size.h * 0.6} rx="220" ry="160"
              fill="url(#bgGlow)" style={{ transition: 'all 2s ease' }}/>

            {/* Grid */}
            {Array.from({ length: 20 }).map((_, i) => (
              <g key={i}>
                <line x1={i * 36} y1="0" x2={i * 36} y2={size.h} stroke="#ffffff03" strokeWidth="0.5"/>
                <line x1="0" y1={i * 26} x2={size.w} y2={i * 26} stroke="#ffffff03" strokeWidth="0.5"/>
              </g>
            ))}

            {/* Boundary fill glow */}
            <polygon points={polygonStr}
              fill={demoMode && demoStep >= 4 ? '#ef444410' : '#22c55e08'}
              filter="url(#blur4)"
              style={{ transition: 'all 1.5s ease' }}/>

            {/* Boundary line */}
            <polygon points={polygonStr} fill="none"
              stroke={boundaryStroke} strokeWidth="1.5" strokeDasharray="8 4"
              className="dash-anim" style={{ transition: 'stroke 1.5s ease' }}/>

            {/* Corner dots */}
            {boundaryPoints.map((p, i) => (
              <g key={i}>
                <circle cx={p.x} cy={p.y} r="5" fill={boundaryStroke} opacity="0.15" filter="url(#blur2)" style={{ transition: 'fill 1.5s ease' }}/>
                <circle cx={p.x} cy={p.y} r="2.5" fill={boundaryStroke} opacity="0.5" style={{ transition: 'fill 1.5s ease' }}/>
              </g>
            ))}

            {/* Labels */}
            <text x="20" y="28" fill={boundaryStroke} fontSize="11" fontFamily="monospace" opacity="0.55" style={{ transition: 'fill 1.5s ease' }}>
              ◉ Greenview Farm
            </text>
            <text x="20" y="42" fill={boundaryStroke} fontSize="9" fontFamily="monospace" opacity="0.3" style={{ transition: 'fill 1.5s ease' }}>
              {demoMode && demoStep >= 4 ? '⚠ BOUNDARY BREACHED' : 'Geofence active · St. Catherine'}
            </text>

            {/* Trail glow */}
            {demoMode && trail.length > 1 && (
              <polyline
                points={trail.map(p => { const px = toPixel(p.lat, p.lng, size.w, size.h); return `${px.x},${px.y}` }).join(' ')}
                fill="none" stroke={demoColor} strokeWidth="8" opacity="0.06" filter="url(#blur4)"
              />
            )}

            {/* Trail dots + line */}
            {demoMode && trail.length > 1 && (
              <>
                <polyline
                  points={trail.map(p => { const px = toPixel(p.lat, p.lng, size.w, size.h); return `${px.x},${px.y}` }).join(' ')}
                  fill="none" stroke={demoColor} strokeWidth="1.5" strokeDasharray="4 3" opacity="0.45"
                />
                {trail.map((p, i) => {
                  const px = toPixel(p.lat, p.lng, size.w, size.h)
                  const age = i / trail.length
                  return (
                    <g key={i}>
                      <circle cx={px.x} cy={px.y} r="5" fill={demoColor} opacity={age * 0.12} filter="url(#blur2)"/>
                      <circle cx={px.x} cy={px.y} r="2" fill={demoColor} opacity={0.1 + age * 0.45}/>
                    </g>
                  )
                })}
              </>
            )}

            {/* Regular animals */}
            {animals.filter(a => a.lat && a.lng && (!demoMode || a.tag_id !== 'JM-005')).map(a => {
              const { x, y } = toPixel(a.lat, a.lng, size.w, size.h)
              const color = STATUS_COLOR[a.status] || '#6b7280'
              const isSel = selected?.id === a.id
              return (
                <g key={a.id} onClick={() => setSelected(isSel ? null : a)} style={{ cursor: 'pointer' }}>
                  <circle cx={x} cy={y} r="16" fill={color} opacity="0.05" filter="url(#blur2)"/>
                  {a.status === 'active' && (
                    <circle cx={x} cy={y} r="10" fill={color} opacity="0.07">
                      <animate attributeName="r" values="6;16;6" dur="3s" repeatCount="indefinite"/>
                      <animate attributeName="opacity" values="0.07;0.01;0.07" dur="3s" repeatCount="indefinite"/>
                    </circle>
                  )}
                  <circle cx={x} cy={y} r={isSel ? 11 : 9} fill="none" stroke={color} strokeWidth="1" opacity={isSel ? 0.5 : 0.15}/>
                  <circle cx={x} cy={y} r={isSel ? 6 : 5} fill={color} stroke="black" strokeWidth="1.5"/>
                  <rect x={x - 20} y={y - 23} width="40" height="11" rx="3" fill="black" opacity="0.5"/>
                  <text x={x} y={y - 14} textAnchor="middle" fill={isSel ? 'white' : color} fontSize="9" fontFamily="sans-serif" opacity={isSel ? 1 : 0.65}>
                    {a.name}
                  </text>
                </g>
              )
            })}

            {/* Demo animal */}
            {demoMode && (() => {
              const { x, y } = demoPixel
              return (
                <g className="demo-glow" style={{ color: demoColor }}>
                  {/* Outer ripple 1 */}
                  <circle cx={x} cy={y} r="10" fill={demoColor} opacity="0">
                    <animate attributeName="r" values="10;55;10" dur="2.2s" repeatCount="indefinite"/>
                    <animate attributeName="opacity" values="0.5;0;0.5" dur="2.2s" repeatCount="indefinite"/>
                  </circle>
                  {/* Outer ripple 2 */}
                  <circle cx={x} cy={y} r="10" fill={demoColor} opacity="0">
                    <animate attributeName="r" values="10;30;10" dur="1.6s" begin="0.5s" repeatCount="indefinite"/>
                    <animate attributeName="opacity" values="0.6;0;0.6" dur="1.6s" begin="0.5s" repeatCount="indefinite"/>
                  </circle>
                  {/* Glow blob */}
                  <circle cx={x} cy={y} r="22" fill={demoColor} opacity="0.1" filter="url(#blur4)"/>
                  {/* Outer ring */}
                  <circle cx={x} cy={y} r="13" fill="none" stroke={demoColor} strokeWidth="1.5" opacity="0.4"/>
                  {/* Core */}
                  <circle cx={x} cy={y} r="8" fill={demoColor} stroke="white" strokeWidth="2.5"/>
                  {/* Inner dot */}
                  <circle cx={x} cy={y} r="3" fill="white" opacity="0.95"/>

                  {/* Label pill */}
                  <rect x={x - 44} y={y - 37} width="88" height="18" rx="5" fill={demoColor} opacity="0.92"/>
                  <text x={x} y={y - 23} textAnchor="middle" fill="black" fontSize="8.5" fontFamily="monospace" fontWeight="bold">
                    {demoStage === 'monitoring' ? '● DUCHESS · tracking' :
                     demoStage === 'warning'    ? '⚠ DUCHESS · near edge' :
                     demoStage === 'breach'     ? '⚠ DUCHESS · breached' :
                     demoStage === 'suspected'  ? '! DUCHESS · suspected' :
                     '🔒 DUCHESS · STOLEN'}
                  </text>

                  {/* Distance */}
                  {demoStep >= 4 && (
                    <>
                      <rect x={x - 32} y={y + 14} width="64" height="14" rx="4" fill="black" opacity="0.65"/>
                      <text x={x} y={y + 24} textAnchor="middle" fill={demoColor} fontSize="9" fontFamily="monospace">
                        {Math.round((demoStep - 3) * 180)}m outside
                      </text>
                    </>
                  )}
                </g>
              )
            })()}
          </svg>

          {/* Toast alert */}
          {activeAlert && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 w-96" style={{ animation: 'slidein 0.3s ease' }}>
              <div className={`rounded-2xl px-5 py-3.5 text-sm text-center border backdrop-blur-md shadow-2xl ${
                alertLevel === 'critical' ? 'bg-red-950/85 border-red-500/40 text-red-200' :
                alertLevel === 'warning'  ? 'bg-amber-950/85 border-amber-500/40 text-amber-200' :
                                            'bg-green-950/85 border-green-500/40 text-green-200'
              }`}>
                {activeAlert}
              </div>
            </div>
          )}

          {/* Progress bar */}
          {demoMode && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10" style={{ animation: 'slidein 0.5s ease' }}>
              <div className="bg-black/80 border border-white/10 rounded-2xl px-5 py-3 flex items-center gap-4 backdrop-blur-md">
                <span className="text-xs text-white/30">Tracking</span>
                <div className="flex gap-1 items-center">
                  {ESCAPE_ROUTE.map((_, i) => (
                    <div key={i} className="rounded-full transition-all duration-700"
                      style={{
                        width: i === demoStep ? '22px' : '6px',
                        height: '6px',
                        background: i > demoStep ? 'rgba(255,255,255,0.08)' :
                          i < 4 ? '#22c55e' : i < 6 ? '#f97316' : '#ef4444',
                        boxShadow: i === demoStep ? `0 0 10px ${demoColor}` : 'none',
                      }}
                    />
                  ))}
                </div>
                <span className="text-xs font-medium transition-all" style={{ color: demoColor }}>
                  {demoStage === 'monitoring' ? 'Inside farm' :
                   demoStage === 'warning'    ? 'Near boundary' :
                   demoStage === 'breach'     ? 'Boundary crossed' :
                   demoStage === 'suspected'  ? 'Far from farm' : '🔒 Stolen'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="w-72 border-l border-white/10 flex flex-col bg-black overflow-hidden">

          {/* Demo / tracking panel */}
          {!demoMode ? (
            <div className="p-4 border-b border-white/10">
              <div className="text-xs font-medium text-white/30 uppercase tracking-wider mb-3">Demo</div>
              <button onClick={startDemo}
                className="w-full bg-gradient-to-r from-amber-500/10 to-red-500/10 border border-amber-500/20 text-amber-400 hover:from-amber-500/20 hover:to-red-500/20 py-3 rounded-xl text-sm font-medium transition-all">
                ▶ Simulate theft detection
              </button>
              <p className="text-white/20 text-xs mt-2 text-center leading-relaxed">
                Watch LiveStack detect and escalate a theft in real time
              </p>
            </div>
          ) : (
            <div className="p-4 border-b border-white/10 transition-all duration-700" style={{ background: `${demoColor}08` }}>
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs font-medium uppercase tracking-wider" style={{ color: demoColor }}>◉ Live tracking</div>
                <button onClick={stopDemo} className="text-xs text-white/30 hover:text-white">end</button>
              </div>
              <div className="space-y-1.5 text-xs">
                {[
                  ['Animal',   'Duchess · JM-005'],
                  ['Stage',    demoStage.charAt(0).toUpperCase() + demoStage.slice(1)],
                  ['Lat',      demoPos.lat.toFixed(4)],
                  ['Lng',      demoPos.lng.toFixed(4)],
                  ['Distance', demoStep >= 4 ? `${Math.round((demoStep - 3) * 180)}m outside` : 'Inside farm'],
                  ['Buyers',   demoStep >= 8 ? '🔒 All blocked' : '—'],
                  ['JCF',      demoStep >= 8 ? '✓ Notified' : '—'],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between py-1 border-b border-white/5 last:border-0">
                    <span className="text-white/30">{k}</span>
                    <span className="font-mono text-white/70" style={k === 'Stage' ? { color: demoColor } : {}}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ticket log */}
          {tickets.length > 0 && (
            <div className="p-4 border-b border-white/10 overflow-y-auto" style={{ maxHeight: '260px' }}>
              <div className="text-xs font-medium text-white/30 uppercase tracking-wider mb-3">
                Incident log · {tickets.length}
              </div>
              <div className="space-y-2">
                {tickets.map((t, i) => (
                  <div key={t.id}
                    className={`rounded-xl p-3 border text-xs ${
                      t.level === 'critical' ? 'bg-red-500/8 border-red-500/20' :
                      t.level === 'warning'  ? 'bg-amber-500/8 border-amber-500/20' :
                                               'bg-white/5 border-white/10'
                    }`}
                    style={{ animation: i === 0 ? 'slidein 0.3s ease' : 'none' }}>
                    <div className="flex justify-between mb-1">
                      <span className={`font-mono font-bold ${
                        t.level === 'critical' ? 'text-red-400' :
                        t.level === 'warning'  ? 'text-amber-400' : 'text-white/40'
                      }`}>#{t.id}</span>
                      <span className="text-white/20">{t.time}</span>
                    </div>
                    <p className={
                      t.level === 'critical' ? 'text-red-300/80' :
                      t.level === 'warning'  ? 'text-amber-300/80' : 'text-white/40'
                    }>{t.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Escape sim */}
          {!demoMode && (
            <div className="p-4 border-b border-white/10">
              <div className="text-xs font-medium text-white/30 uppercase tracking-wider mb-3">Simulate escape</div>
              <select value={escapeId} onChange={e => setEscapeId(e.target.value)}
                className="w-full bg-white/5 border border-white/10 text-white text-xs rounded-lg px-3 py-2 focus:outline-none">
                <option value="">All inside boundary</option>
                {animals.filter(a => a.status !== 'blocked').map(a => (
                  <option key={a.tag_id} value={a.tag_id}>{a.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Herd list */}
          {!demoMode && (
            <div className="p-4 flex-1 overflow-y-auto">
              <div className="text-xs font-medium text-white/30 uppercase tracking-wider mb-3">Herd · {animals.length}</div>
              <div className="space-y-1">
                {animals.map(a => (
                  <div key={a.id} onClick={() => setSelected(a)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer transition-all hover:bg-white/5 ${
                      selected?.id === a.id ? 'bg-white/10 border border-white/10' : ''
                    }`}>
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: STATUS_COLOR[a.status] }}></span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-white truncate">{a.name}</div>
                      <div className="text-xs text-white/30">{a.tag_id}</div>
                    </div>
                    {a.status === 'alert'   && <span className="text-xs bg-amber-500/10 border border-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded">OUT</span>}
                    {a.status === 'blocked' && <span className="text-base">🔒</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="p-4 border-t border-white/10 flex-shrink-0">
            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
              {[['#22c55e','Active'],['#f59e0b','Alert'],['#f97316','Breach'],['#ef4444','Stolen']].map(([color, label]) => (
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