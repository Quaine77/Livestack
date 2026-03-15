import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white overflow-hidden">

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 border-b border-white/10 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
            <div className="w-3 h-3 bg-black rounded-full animate-pulse" />
          </div>
          <span className="font-bold text-lg tracking-tight">LiveStack</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-sm text-white/60 hover:text-white transition-colors">Dashboard</Link>
          <Link href="/map" className="text-sm text-white/60 hover:text-white transition-colors">Live map</Link>
          <Link href="/documents" className="text-sm text-white/60 hover:text-white transition-colors">Documents</Link>
          <Link href="/verify?tagId=JM-005" className="text-sm bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-white/90 transition-colors">
            Verify animal
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-16">
        <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium px-3 py-1.5 rounded-full mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
          Live across Jamaica — real-time tracking active
        </div>

        <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none mb-6">
          Every animal.
          <br />
          <span className="text-green-400">Accountable.</span>
        </h1>

        <p className="text-white/50 text-xl max-w-xl mb-10 leading-relaxed">
          Jamaica loses $48 million a year to livestock theft.
          LiveStack ends it — with real-time GPS tracking, AI health monitoring,
          and a meat block that makes stolen animals unsellable.
        </p>

        <div className="flex flex-wrap gap-4 mb-20">
          <Link href="/dashboard"
            className="bg-green-500 hover:bg-green-400 text-black font-bold px-8 py-4 rounded-xl transition-colors text-sm">
            Open dashboard
          </Link>
          <Link href="/verify?tagId=JM-005"
            className="border border-white/20 hover:border-white/40 text-white px-8 py-4 rounded-xl transition-colors text-sm">
            Try butcher verify
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/10 rounded-2xl overflow-hidden">
          {[
            { num: '$48M', label: 'Lost annually to theft', color: 'text-red-400' },
            { num: '60%', label: 'Of farmers victimised', color: 'text-red-400' },
            { num: '222K', label: 'Registered farmers', color: 'text-green-400' },
            { num: '0', label: 'Digital systems existed', color: 'text-white' },
          ].map(({ num, label, color }) => (
            <div key={num} className="bg-black px-6 py-8">
              <div className={`text-4xl font-black mb-2 ${color}`}>{num}</div>
              <div className="text-white/40 text-sm">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-16 border-t border-white/10">
        <div className="text-xs font-medium text-white/30 uppercase tracking-widest mb-12">
          What LiveStack does
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: '◉',
              title: 'Real-time GPS tracking',
              desc: 'Every animal tagged. Every movement logged. Farm boundary alerts fire the moment an animal leaves the zone.',
              link: '/map',
              linkLabel: 'View live map',
              color: 'text-green-400',
            },
            {
              icon: '◈',
              title: 'AI health monitoring',
              desc: 'Movement anomaly detection flags illness 24-48 hours before visible symptoms. Claude explains every alert in plain English.',
              link: '/health',
              linkLabel: 'View health dashboard',
              color: 'text-blue-400',
            },
            {
              icon: '◆',
              title: 'Meat block system',
              desc: 'Report a theft in one tap. Every marketplace, butcher, and checkpoint is instantly blocked from buying that animal.',
              link: '/verify?tagId=JM-005',
              linkLabel: 'Try butcher verify',
              color: 'text-amber-400',
            },
            {
              icon: '◇',
              title: 'RADA registration',
              desc: 'Digital animal papers issued through RADA. Movement permits, sale certificates, and health declarations generated automatically.',
              link: '/documents',
              linkLabel: 'Generate documents',
              color: 'text-purple-400',
            },
            {
              icon: '◎',
              title: 'Verified marketplace',
              desc: 'Only RADA-registered animals can be listed. Ownership transfers on a tamper-proof ledger. Both parties get a digital certificate.',
              link: '/dashboard',
              linkLabel: 'Open dashboard',
              color: 'text-pink-400',
            },
            {
              icon: '○',
              title: 'Butcher verification',
              desc: 'Scan any animal tag in 2 seconds. Instantly see CLEAR, BLOCKED, or UNREGISTERED. Declare every purchase on the ledger.',
              link: '/verify?tagId=JM-001',
              linkLabel: 'Try it now',
              color: 'text-teal-400',
            },
          ].map(({ icon, title, desc, link, linkLabel, color }) => (
            <div key={title} className="border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-colors group">
              <div className={`text-2xl mb-4 ${color}`}>{icon}</div>
              <h3 className="font-bold text-white mb-2">{title}</h3>
              <p className="text-white/40 text-sm leading-relaxed mb-4">{desc}</p>
              <Link href={link} className={`text-xs font-medium ${color} hover:underline`}>
                {linkLabel} →
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-7xl mx-auto px-6 py-16 border-t border-white/10">
        <div className="text-xs font-medium text-white/30 uppercase tracking-widest mb-12">
          From tag to table
        </div>
        <div className="grid md:grid-cols-5 gap-4">
          {[
            { step: '01', label: 'Tag attached', desc: 'RFID + GPS ear tag fitted at birth or first registration' },
            { step: '02', label: 'RADA registered', desc: 'Digital licence issued. Animal enters national registry' },
            { step: '03', label: 'Live tracked', desc: 'GPS pings every 30 seconds. AI watches for anomalies' },
            { step: '04', label: 'Verified sale', desc: 'Ownership transfers on ledger. Papers auto-generated' },
            { step: '05', label: 'Butcher declares', desc: 'Source farmer declared. Full chain of custody complete' },
          ].map(({ step, label, desc }) => (
            <div key={step} className="relative">
              <div className="text-xs font-mono text-white/20 mb-3">{step}</div>
              <div className="w-8 h-0.5 bg-green-500 mb-3"></div>
              <div className="font-bold text-sm text-white mb-2">{label}</div>
              <div className="text-white/40 text-xs leading-relaxed">{desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 py-16 border-t border-white/10">
        <div className="bg-green-500 rounded-3xl p-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h2 className="text-3xl font-black text-black mb-2">
              The law passed. We built the system.
            </h2>
            <p className="text-black/60 text-sm">
              Praedial Larceny Prevention Act 2023 mandates animal traceability.
              LiveStack is the digital infrastructure Jamaica needs.
            </p>
          </div>
          <div className="flex gap-3 flex-shrink-0">
            <Link href="/dashboard"
              className="bg-black text-white font-bold px-6 py-3 rounded-xl hover:bg-black/80 transition-colors text-sm whitespace-nowrap">
              Open dashboard
            </Link>
            <Link href="/verify?tagId=JM-005"
              className="bg-white/20 text-black font-bold px-6 py-3 rounded-xl hover:bg-white/30 transition-colors text-sm whitespace-nowrap">
              Butcher verify
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-8 max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-6 h-6 bg-green-500 rounded-md flex items-center justify-center">
            <div className="w-2 h-2 bg-black rounded-full animate-pulse" />
          </div>
          <span className="text-sm font-bold">LiveStack</span>
        </Link>
        <div className="text-white/30 text-xs">
          Solving Jamaica's $48M livestock theft problem · 2025
        </div>
        <div className="flex gap-4">
          {[['Dashboard', '/dashboard'], ['Map', '/map'], ['Health', '/health'], ['Documents', '/documents']].map(([label, href]) => (
            <Link key={label} href={href} className="text-xs text-white/30 hover:text-white transition-colors">
              {label}
            </Link>
          ))}
        </div>
      </footer>

    </main>
  )
}