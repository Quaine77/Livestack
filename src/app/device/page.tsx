import Link from 'next/link'

export default function DevicePage() {
  return (
    <div className="min-h-screen bg-black text-white">

      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 hover:opacity-70 transition-opacity">
            <div className="w-7 h-7 bg-green-500 rounded-lg flex items-center justify-center">
              <div className="w-2.5 h-2.5 bg-black rounded-full animate-pulse" />
            </div>
            <span className="font-bold text-sm">LiveStack</span>
          </a>
          <span className="text-white/40 text-sm">The device</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-16">

        {/* Hero */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium px-4 py-2 rounded-full mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
            Patent pending · LiveStack Hardware
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6">
            Invisible to thieves.<br/>
            <span className="text-green-400">Visible to the law.</span>
          </h1>
          <p className="text-white/50 text-xl max-w-2xl mx-auto">
            A waterproof NFC chip bonded under the hoof using medical-grade epoxy.
            No external tag. No visible marker. Just a tap to verify.
          </p>
        </div>

        {/* Device visual */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
          <div className="relative">
            {/* NFC chip visual */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-12 flex items-center justify-center relative overflow-hidden">
              {/* Background glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent" />

              {/* Chip illustration */}
              <div className="relative z-10 text-center">
                <div className="relative inline-block mb-6">
                  {/* Outer ring */}
                  <div className="w-32 h-32 rounded-full border-2 border-green-500/30 flex items-center justify-center">
                    {/* Middle ring */}
                    <div className="w-20 h-20 rounded-full border-2 border-green-500/50 flex items-center justify-center">
                      {/* Inner chip */}
                      <div className="w-12 h-12 rounded-xl bg-green-500/20 border border-green-500/40 flex items-center justify-center">
                        <div className="w-6 h-6 rounded-lg bg-green-500 flex items-center justify-center">
                          <div className="w-3 h-3 rounded bg-black" />
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Pulse rings */}
                  <div className="absolute inset-0 w-32 h-32 rounded-full border border-green-500/20 animate-ping" />
                </div>

                <div className="text-white font-bold text-lg mb-1">LiveStack NFC Tag</div>
                <div className="text-white/40 text-sm">Model LS-H1 · Waterproof</div>
                <div className="mt-3 font-mono text-xs text-green-400 bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-full inline-block">
                  JM-001 · RADA-2024-001
                </div>
              </div>
            </div>

            {/* Size indicator */}
            <div className="mt-4 flex items-center justify-center gap-4 text-xs text-white/30">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-base">🪙</div>
                <span>Smaller than a 10¢ coin</span>
              </div>
              <div className="w-px h-4 bg-white/10" />
              <span>2mm thin</span>
              <div className="w-px h-4 bg-white/10" />
              <span>0.8g weight</span>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-black mb-4">Why under the hoof?</h2>
              <div className="space-y-3">
                {[
                  ['Invisible', 'No external marker means thieves cannot find, remove or swap the tag. What they can\'t see, they can\'t defeat.', '👁'],
                  ['Durable', 'Hooves endure daily pressure, mud, water and heat. Our epoxy bond is rated for 5+ years of active livestock use.', '🛡'],
                  ['Universal', 'Works on cattle, goats, sheep, pigs and horses. Any hoof. Any size. Same chip.', '🐄'],
                  ['Instant verify', 'Any modern smartphone can read it. No app needed. Just tap the hoof — result in under a second.', '📱'],
                ].map(([title, desc, icon]) => (
                  <div key={title as string} className="flex gap-4 p-4 bg-white/5 border border-white/10 rounded-xl hover:border-white/20 transition-colors">
                    <div className="text-2xl flex-shrink-0">{icon}</div>
                    <div>
                      <div className="font-bold text-sm text-white mb-1">{title}</div>
                      <div className="text-white/50 text-xs leading-relaxed">{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* How it works */}
        <div className="mb-20">
          <div className="text-xs font-medium text-white/30 uppercase tracking-widest mb-8 text-center">Installation process</div>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { step: '01', title: 'Clean hoof', desc: 'Hoof underside is cleaned and dried. Takes 2 minutes.', color: 'text-blue-400', icon: '🧹' },
              { step: '02', title: 'Apply epoxy', desc: 'Medical-grade waterproof epoxy applied to chip surface.', color: 'text-purple-400', icon: '🔧' },
              { step: '03', title: 'Bond chip', desc: 'Chip pressed firmly into natural hoof groove. Sets in 60 seconds.', color: 'text-amber-400', icon: '📎' },
              { step: '04', title: 'Program & register', desc: 'Farmer taps phone to chip. LiveStack writes the verify URL. Done.', color: 'text-green-400', icon: '✓' },
            ].map(({ step, title, desc, color, icon }) => (
              <div key={step} className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-colors">
                <div className="text-xs font-mono text-white/20 mb-3">{step}</div>
                <div className="text-2xl mb-3">{icon}</div>
                <div className={`font-bold text-sm mb-2 ${color}`}>{title}</div>
                <div className="text-white/40 text-xs leading-relaxed">{desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Specs */}
        <div className="grid md:grid-cols-2 gap-6 mb-20">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="text-xs font-medium text-white/30 uppercase tracking-wider mb-4">Technical specs</div>
            <div className="space-y-2">
              {[
                ['Standard',      'ISO 14443-A / NFC Forum Type 2'],
                ['Chip',          'NTAG213 / 144 bytes storage'],
                ['Read range',    '1–4cm (direct tap)'],
                ['Dimensions',    '13mm diameter · 2mm thick'],
                ['Weight',        '0.8 grams'],
                ['Water rating',  'IP68 — fully waterproof'],
                ['Temp range',    '-20°C to +85°C'],
                ['Bond strength', '2.5 MPa shear strength'],
                ['Lifespan',      '5+ years field use'],
                ['Reads',         '100,000+ read cycles'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between py-2 border-b border-white/5 text-xs last:border-0">
                  <span className="text-white/40">{k}</span>
                  <span className="text-white font-mono">{v}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="text-xs font-medium text-white/30 uppercase tracking-wider mb-4">Compatibility</div>
            <div className="space-y-2 mb-6">
              {[
                ['iPhone 7+',         '✓ Native NFC — no app needed'],
                ['Android (NFC)',      '✓ Chrome browser — no app needed'],
                ['Samsung Galaxy',     '✓ Supported'],
                ['Older devices',      '✓ Manual tag ID entry fallback'],
                ['RFID readers',       '✓ 13.56MHz compatible'],
                ['Livestock species',  '✓ Cattle, goat, sheep, pig, horse'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between py-2 border-b border-white/5 text-xs last:border-0">
                  <span className="text-white/40">{k}</span>
                  <span className="text-green-400">{v}</span>
                </div>
              ))}
            </div>

            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-xs text-green-400/70 leading-relaxed">
              <span className="font-bold text-green-400 block mb-1">No app required</span>
              When a butcher taps their phone to the hoof, the browser opens automatically and shows the verification result. Nothing to download. Nothing to install.
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-green-500 rounded-3xl p-10 text-center">
          <h2 className="text-3xl font-black text-black mb-3">Ready to tag your herd?</h2>
          <p className="text-black/60 text-sm mb-8 max-w-md mx-auto">
            Register your animals on LiveStack. Each animal gets a unique NFC chip ID — bonded under the hoof by a RADA-certified technician.
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/register"
              className="bg-black text-white font-bold px-8 py-3 rounded-xl hover:bg-black/80 transition-colors text-sm">
              Register an animal
            </Link>
            <Link href="/verify"
              className="bg-white/20 text-black font-bold px-8 py-3 rounded-xl hover:bg-white/30 transition-colors text-sm">
              Try butcher verify
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}