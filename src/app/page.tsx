'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

function useInView(threshold = 0.2) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setInView(true) },
      { threshold }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, inView }
}

function FadeIn({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, inView } = useInView()
  return (
    <div ref={ref} className={className} style={{
      opacity: inView ? 1 : 0,
      transform: inView ? 'translateY(0)' : 'translateY(32px)',
      transition: `opacity 0.8s ease ${delay}s, transform 0.8s ease ${delay}s`
    }}>
      {children}
    </div>
  )
}

function WaveBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    let animId: number
    let t = 0

    function resize() {
      if (!canvas) return
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    function draw() {
      if (!canvas || !ctx) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const waves = [
        { color: 'rgba(34,197,94,0.07)',   speed: 0.4, amp: 90,  freq: 0.007, yPct: 0.55 },
        { color: 'rgba(59,130,246,0.05)',  speed: 0.6, amp: 65,  freq: 0.011, yPct: 0.65 },
        { color: 'rgba(34,197,94,0.05)',   speed: 0.3, amp: 110, freq: 0.005, yPct: 0.42 },
        { color: 'rgba(139,92,246,0.04)',  speed: 0.7, amp: 50,  freq: 0.014, yPct: 0.72 },
        { color: 'rgba(20,184,166,0.04)',  speed: 0.5, amp: 75,  freq: 0.009, yPct: 0.48 },
      ]

      waves.forEach(wave => {
        ctx.beginPath()
        ctx.moveTo(0, canvas.height)
        for (let x = 0; x <= canvas.width; x += 3) {
          const y =
            canvas.height * wave.yPct
            + Math.sin(x * wave.freq + t * wave.speed) * wave.amp
            + Math.sin(x * wave.freq * 0.6 + t * wave.speed * 0.8) * wave.amp * 0.4
          ctx.lineTo(x, y)
        }
        ctx.lineTo(canvas.width, canvas.height)
        ctx.closePath()
        ctx.fillStyle = wave.color
        ctx.fill()
      })

      t += 0.016
      animId = requestAnimationFrame(draw)
    }

    resize()
    window.addEventListener('resize', resize)
    draw()
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize) }
  }, [])

  return (
    <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
  )
}

function MoreMenu() {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)}
        className="text-sm text-white/60 hover:text-white transition-colors flex items-center gap-1">
        More
        <span className="text-white/30 text-xs" style={{
          display: 'inline-block',
          transform: open ? 'rotate(180deg)' : 'rotate(0)',
          transition: 'transform 0.2s'
        }}>▾</span>
      </button>
      {open && (
        <div className="absolute top-8 left-0 bg-black border border-white/10 rounded-2xl p-2 min-w-48 shadow-2xl z-50"
          onMouseLeave={() => setOpen(false)}>
          {[
            ['Dashboard',     '/dashboard'],
            ['Live map',      '/map'],
            ['Health',        '/health'],
            ['Marketplace',   '/marketplace'],
            ['Documents',     '/documents'],
            ['Register',      '/register'],
            ['Butcher verify','/verify'],
            ['The device',    '/device'],
          ].map(([label, href]) => (
            <Link key={label} href={href} onClick={() => setOpen(false)}
              className="block px-4 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/5 rounded-xl transition-colors">
              {label}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

const STATS = [
  { num: '$48M', label: 'Lost annually',   color: '#ef4444' },
  { num: '60%',  label: 'Farmers robbed',  color: '#ef4444' },
  { num: '222K', label: 'Farmers waiting', color: '#22c55e' },
  { num: '0',    label: 'Systems existed', color: '#ffffff' },
]

const FEATURES = [
  { num:'01', title:'Real-time GPS tracking',  body:'Every animal moves — LiveStack knows where. GPS pings every 30 seconds. The moment an animal crosses your farm boundary, your phone alerts. Not tomorrow. Now.',                                color:'#22c55e', icon:'◉', link:'/map' },
  { num:'02', title:'AI health monitoring',    body:'Before your animal looks sick, LiveStack already knows. Movement anomaly detection flags illness 24-48 hours before visible symptoms. Claude AI explains every alert in plain English.',     color:'#3b82f6', icon:'◈', link:'/health' },
  { num:'03', title:'Meat block system',       body:'Report a theft in one tap. Every marketplace, butcher, and checkpoint across Jamaica is instantly blocked. Stolen livestock cannot be sold. Theft stops paying.',                           color:'#f59e0b', icon:'◆', link:'/verify?tagId=JM-005' },
  { num:'04', title:'Hoof NFC tagging',        body:'A waterproof NFC chip bonded under the hoof. Invisible to thieves. Butchers tap their phone to verify in one second. No app needed. Just tap.',                                            color:'#8b5cf6', icon:'◇', link:'/device' },
  { num:'05', title:'RADA registration',       body:'Digital animal papers, movement permits, and sale certificates — generated automatically. No forms. No queues. LiveStack is the digital layer the 2023 Act demands.',                      color:'#ec4899', icon:'○', link:'/documents' },
  { num:'06', title:'Verified marketplace',    body:'Only RADA-certified animals can be listed. Every sale transfers ownership on a tamper-proof ledger. Both parties get a digital certificate. No disputes. No fraud.',                      color:'#14b8a6', icon:'◎', link:'/marketplace' },
]

const STEPS = [
  { step:'01', label:'Tag attached',     desc:'NFC chip bonded under hoof' },
  { step:'02', label:'RADA registered',  desc:'Digital licence issued' },
  { step:'03', label:'Live tracked',     desc:'AI watches 24/7' },
  { step:'04', label:'Verified sale',    desc:'Ledger transfer' },
  { step:'05', label:'Butcher declares', desc:'Full chain complete' },
]

export default function Home() {
  const [activeFeature, setActiveFeature] = useState<number | null>(null)
  const [scrollY, setScrollY] = useState(0)
  const [demoStatus, setDemoStatus] = useState<'idle'|'scanning'|'clear'|'blocked'|'unreg'>('idle')
  const [demoAnimal, setDemoAnimal] = useState<any>(null)
  const [tagInput, setTagInput] = useState('')

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  async function runDemo() {
    if (!tagInput.trim()) return
    setDemoStatus('scanning')
    setDemoAnimal(null)
    const { data } = await supabase
      .from('animals')
      .select('*')
      .eq('tag_id', tagInput.trim().toUpperCase())
      .maybeSingle()
    if (!data) setDemoStatus('unreg')
    else if (data.status === 'blocked') { setDemoStatus('blocked'); setDemoAnimal(data) }
    else { setDemoStatus('clear'); setDemoAnimal(data) }
  }

  return (
    <div className="bg-black text-white overflow-x-hidden">
      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes marquee { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        .marquee { animation: marquee 20s linear infinite; }
        html { scroll-behavior: smooth; }
      `}</style>

      {/* NAV */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrollY > 60 ? 'bg-black/80 backdrop-blur-xl border-b border-white/10' : ''}`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <div className="w-3 h-3 bg-black rounded-full animate-pulse" />
            </div>
            <span className="font-bold text-lg tracking-tight">LiveStack</span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm text-white/60 hover:text-white transition-colors">Features</a>
            <a href="#demo" className="text-sm text-white/60 hover:text-white transition-colors">Demo</a>
            <MoreMenu />
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-white/60 hover:text-white transition-colors">Sign in</Link>
            <Link href="/signup" className="text-sm bg-green-500 hover:bg-green-400 text-black font-bold px-4 py-2 rounded-lg transition-colors">
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-16 relative overflow-hidden">
        <WaveBackground />

        <div className="text-center max-w-5xl relative z-10">
          <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium px-4 py-2 rounded-full mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
            Live across Jamaica — Praedial Larceny Prevention Act 2023
          </div>

          <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-none mb-8">
            Every animal.
            <br />
            <span className="text-green-400">Accountable.</span>
          </h1>

          <p className="text-white/50 text-xl md:text-2xl max-w-2xl mx-auto mb-12 leading-relaxed">
            Jamaica loses $48 million a year to livestock theft.
            LiveStack ends it.
          </p>

          <div className="flex flex-wrap gap-4 justify-center mb-20">
            <Link href="/signup"
              className="bg-green-500 hover:bg-green-400 text-black font-bold px-10 py-4 rounded-2xl transition-all text-base hover:scale-105 active:scale-95">
              Start for free
            </Link>
            <a href="#demo"
              className="border border-white/20 hover:border-white/40 text-white px-10 py-4 rounded-2xl transition-all text-base hover:scale-105 active:scale-95">
              See it live
            </a>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {STATS.map(({ num, label, color }, i) => (
              <div key={num}
                className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all hover:scale-105"
                style={{ animation: `float ${3 + i * 0.5}s ease-in-out infinite` }}>
                <div className="text-3xl font-black mb-1" style={{ color }}>{num}</div>
                <div className="text-white/40 text-xs">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="border-y border-white/10 py-4 overflow-hidden bg-white/5">
        <div className="flex marquee whitespace-nowrap">
          {[...Array(2)].map((_, gi) => (
            <div key={gi} className="flex gap-8 mr-8">
              {['GPS Tracking','AI Health Monitoring','NFC Hoof Tags','Meat Block System','RADA Registration','Verified Marketplace','Real-time Alerts','Theft Prevention','Digital Papers'].map(t => (
                <span key={t} className="text-white/30 text-sm font-medium px-4">◆ {t}</span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* FEATURES */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-32">
        <FadeIn>
          <div className="text-xs font-medium text-white/30 uppercase tracking-widest mb-4">What LiveStack does</div>
          <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-20 max-w-2xl">
            Six ways LiveStack protects your herd.
          </h2>
        </FadeIn>
        <div className="space-y-4">
          {FEATURES.map((f, i) => (
            <FadeIn key={f.num} delay={i * 0.05}>
              <div
                className="border rounded-2xl overflow-hidden cursor-pointer transition-all hover:border-white/20"
                style={{
                  background: activeFeature === i ? `${f.color}08` : 'transparent',
                  borderColor: activeFeature === i ? `${f.color}30` : 'rgba(255,255,255,0.1)'
                }}
                onClick={() => setActiveFeature(activeFeature === i ? null : i)}
              >
                <div className="flex items-center justify-between px-8 py-6">
                  <div className="flex items-center gap-6">
                    <span className="text-xs font-mono text-white/20">{f.num}</span>
                    <span className="text-2xl" style={{ color: activeFeature === i ? f.color : 'rgba(255,255,255,0.3)' }}>{f.icon}</span>
                    <h3 className="font-bold text-lg text-white">{f.title}</h3>
                  </div>
                  <span className="text-white/30 text-xl transition-transform duration-300 flex-shrink-0"
                    style={{ transform: activeFeature === i ? 'rotate(45deg)' : 'rotate(0)' }}>+</span>
                </div>
                <div style={{ maxHeight: activeFeature === i ? '200px' : '0', overflow: 'hidden', transition: 'max-height 0.4s ease' }}>
                  <div className="px-8 pb-8">
                    <div className="w-8 h-0.5 mb-4" style={{ background: f.color }} />
                    <p className="text-white/60 leading-relaxed max-w-2xl">{f.body}</p>
                    <Link href={f.link}
                      className="inline-flex items-center gap-2 mt-4 text-sm font-medium hover:opacity-70 transition-opacity"
                      style={{ color: f.color }}>
                      Try it now →
                    </Link>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="border-t border-white/10 py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <FadeIn>
            <div className="text-xs font-medium text-white/30 uppercase tracking-widest mb-4">The journey</div>
            <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-20">
              From tag to table.<br/>
              <span className="text-green-400">Every step recorded.</span>
            </h2>
          </FadeIn>
          <div className="relative">
            <div className="absolute top-8 left-0 right-0 h-px bg-white/10 hidden md:block" />
            <div className="grid md:grid-cols-5 gap-8">
              {STEPS.map(({ step, label, desc }, i) => (
                <FadeIn key={step} delay={i * 0.1}>
                  <div className="relative">
                    <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-4 relative z-10 hover:border-green-500/30 hover:bg-green-500/5 transition-all">
                      <span className="text-xs font-mono text-white/40">{step}</span>
                    </div>
                    <div className="w-6 h-0.5 bg-green-500 mb-3" />
                    <div className="font-bold text-white mb-1">{label}</div>
                    <div className="text-white/40 text-xs leading-relaxed">{desc}</div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* LIVE DEMO */}
      <section id="demo" className="border-t border-white/10 py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <FadeIn>
            <div className="text-xs font-medium text-white/30 uppercase tracking-widest mb-4">Try it now</div>
            <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-4">
              Butcher verification.<br/>
              <span className="text-green-400">Live.</span>
            </h2>
            <p className="text-white/40 mb-12 max-w-lg">
              This is what a butcher sees when they tap an animal's hoof tag.
              Try <span className="text-white font-mono">JM-001</span> for clear,{' '}
              <span className="text-white font-mono">JM-005</span> for blocked,
              or anything random for unregistered.
            </p>
          </FadeIn>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <FadeIn>
              <div className="space-y-4">
                <input
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && runDemo()}
                  placeholder="Enter tag ID — e.g. JM-001"
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-white/20 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-white/30 font-mono"
                />
                <button onClick={runDemo} disabled={!tagInput || demoStatus === 'scanning'}
                  className="w-full bg-green-500 hover:bg-green-400 disabled:opacity-30 text-black font-bold py-4 rounded-2xl transition-all hover:scale-105 active:scale-95">
                  {demoStatus === 'scanning' ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      Checking registry...
                    </span>
                  ) : 'Verify animal'}
                </button>
                <button onClick={() => { setDemoStatus('idle'); setTagInput(''); setDemoAnimal(null) }}
                  className="w-full border border-white/10 hover:border-white/20 text-white/40 hover:text-white py-3 rounded-2xl text-sm transition-colors">
                  Reset
                </button>
              </div>
            </FadeIn>

            <FadeIn delay={0.2}>
              <div className={`rounded-3xl p-8 text-center transition-all duration-500 min-h-64 flex flex-col items-center justify-center ${
                demoStatus === 'idle'     ? 'bg-white/5 border border-white/10' :
                demoStatus === 'scanning' ? 'bg-white/5 border border-white/10' :
                demoStatus === 'clear'    ? 'bg-green-600' :
                demoStatus === 'blocked'  ? 'bg-red-600' :
                                            'bg-amber-500'
              }`}>
                {demoStatus === 'idle' && (
                  <div className="text-center">
                    <div className="text-5xl mb-4 opacity-20">📱</div>
                    <p className="text-white/30 text-sm">Enter a tag ID and click Verify</p>
                  </div>
                )}
                {demoStatus === 'scanning' && (
                  <div>
                    <div className="w-16 h-16 border-2 border-white/30 rounded-full mx-auto mb-4 relative">
                      <div className="w-16 h-16 border-2 border-white rounded-full absolute inset-0 animate-ping opacity-30" />
                      <div className="w-4 h-4 bg-white rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <p className="text-white/60 text-sm">Checking LiveStack registry...</p>
                  </div>
                )}
                {demoStatus === 'clear' && demoAnimal && (
                  <div className="text-white text-center w-full">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">✓</div>
                    <div className="text-4xl font-black mb-2">CLEAR</div>
                    <div className="text-white/70 text-sm mb-4">Safe to purchase</div>
                    <div className="bg-white/20 rounded-xl p-4 text-left text-sm space-y-1">
                      <div className="flex justify-between"><span className="opacity-60">Name</span><span className="font-medium">{demoAnimal.name}</span></div>
                      <div className="flex justify-between"><span className="opacity-60">Tag</span><span className="font-mono">{demoAnimal.tag_id}</span></div>
                      <div className="flex justify-between"><span className="opacity-60">Breed</span><span>{demoAnimal.breed}</span></div>
                      <div className="flex justify-between"><span className="opacity-60">Status</span><span className="font-medium">RADA Verified</span></div>
                    </div>
                  </div>
                )}
                {demoStatus === 'blocked' && (
                  <div className="text-white text-center">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">✗</div>
                    <div className="text-4xl font-black mb-2">BLOCKED</div>
                    <div className="text-white/70 text-sm mb-4">Reported stolen — do not purchase</div>
                    <div className="bg-black/20 rounded-xl p-4 text-xs space-y-1 text-left">
                      <div className="flex justify-between"><span className="opacity-60">Animal</span><span>{demoAnimal?.name}</span></div>
                      <div className="flex justify-between"><span className="opacity-60">Police case</span><span className="font-mono">JCF-2025-0441</span></div>
                      <div className="flex justify-between"><span className="opacity-60">Law</span><span>Praedial Larceny Act 2023</span></div>
                    </div>
                  </div>
                )}
                {demoStatus === 'unreg' && (
                  <div className="text-white text-center">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">?</div>
                    <div className="text-4xl font-black mb-2">UNREGISTERED</div>
                    <div className="text-white/70 text-sm mb-4">No record found</div>
                    <div className="bg-black/20 rounded-xl p-4 text-xs text-left">
                      <p className="opacity-70">Tag ID <span className="font-mono">{tagInput.toUpperCase()}</span> is not in the LiveStack registry. Illegal to purchase under the 2023 Act.</p>
                    </div>
                  </div>
                )}
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-white/10 py-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <FadeIn>
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-8">
              The law passed.<br/>
              <span className="text-green-400">We built the system.</span>
            </h2>
            <p className="text-white/40 text-lg mb-12 max-w-xl mx-auto">
              Praedial Larceny Prevention Act 2023 mandates animal traceability.
              LiveStack is the infrastructure Jamaica was waiting for.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/signup"
                className="bg-green-500 hover:bg-green-400 text-black font-bold px-12 py-5 rounded-2xl transition-all text-lg hover:scale-105 active:scale-95">
                Get started free
              </Link>
              <Link href="/dashboard"
                className="border border-white/20 hover:border-white/40 text-white px-12 py-5 rounded-2xl transition-all text-lg hover:scale-105 active:scale-95">
                View dashboard
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity mb-4">
                <div className="w-7 h-7 bg-green-500 rounded-lg flex items-center justify-center">
                  <div className="w-2.5 h-2.5 bg-black rounded-full animate-pulse" />
                </div>
                <span className="font-bold">LiveStack</span>
              </Link>
              <p className="text-white/30 text-xs leading-relaxed">
                Solving Jamaica's $48M livestock theft problem with technology.
              </p>
            </div>
            <div>
              <div className="text-xs font-medium text-white/30 uppercase tracking-wider mb-3">Platform</div>
              <div className="space-y-2">
                {[['Dashboard','/dashboard'],['Live map','/map'],['Health','/health'],['Marketplace','/marketplace']].map(([l,h]) => (
                  <Link key={l} href={h} className="block text-sm text-white/40 hover:text-white transition-colors">{l}</Link>
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs font-medium text-white/30 uppercase tracking-wider mb-3">Tools</div>
              <div className="space-y-2">
                {[['Register animal','/register'],['Documents','/documents'],['Butcher verify','/verify'],['The device','/device']].map(([l,h]) => (
                  <Link key={l} href={h} className="block text-sm text-white/40 hover:text-white transition-colors">{l}</Link>
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs font-medium text-white/30 uppercase tracking-wider mb-3">Legal</div>
              <div className="space-y-2 text-sm text-white/40">
                <p>Praedial Larceny Prevention Act 2023</p>
                <p>RADA Compliance</p>
                <p>Jamaica Constabulary Force</p>
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 pt-6 flex items-center justify-between flex-wrap gap-4">
            <p className="text-white/20 text-xs">LiveStack · Solving Jamaica's $48M livestock theft problem · 2025</p>
            <div className="flex gap-4">
              {[['Sign in','/login'],['Get started','/signup']].map(([l,h]) => (
                <Link key={l} href={h} className="text-xs text-white/30 hover:text-white transition-colors">{l}</Link>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}