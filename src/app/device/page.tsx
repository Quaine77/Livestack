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

      <main className="max-w-5xl mx-auto px-6 py-12">

        {/* Hero */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
            Patent pending · LiveStack Hardware
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6">
            Invisible to thieves.<br/>
            <span className="text-green-400">Visible to the law.</span>
          </h1>
          <p className="text-white/50 text-lg max-w-xl mx-auto">
            A waterproof NFC chip bonded under the hoof.
            No wires. No battery. No visibility from outside.
            Just tap and verify.
          </p>
        </div>

        {/* Device visual */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">

          {/* Chip illustration */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col items-center justify-center">
            <div className="relative mb-6">
              {/* Outer ring */}
              <div className="w-48 h-48 rounded-full border-2 border-green-500/20 flex items-center justify-center relative">
                {/* Signal rings */}
                <div className="absolute inset-0 rounded-full border border-green-500/10 animate-ping" style={{ animationDuration: '3s' }}></div>
                <div className="absolute inset-4 rounded-full border border-green-500/15 animate-ping" style={{ animationDuration: '2s', animationDelay: '0.5s' }}></div>

                {/* Middle ring */}
                <div className="w-32 h-32 rounded-full border-2 border-green-500/30 flex items-center justify-center">
                  {/* Chip */}
                  <div className="w-16 h-16 bg-green-500/20 border-2 border-green-500/50 rounded-xl flex items-center justify-center relative">
                    {/* Circuit lines */}
                    <div className="absolute top-0 left-1/2 w-px h-3 bg-green-500/40 -translate-y-3"></div>
                    <div className="absolute bottom-0 left-1/2 w-px h-3 bg-green-500/40 translate-y-3"></div>
                    <div className="absolute left-0 top-1/2 h-px w-3 bg-green-500/40 -translate-x-3"></div>
                    <div className="absolute right-0 top-1/2 h-px w-3 bg-green-500/40 translate-x-3"></div>
                    {/* Chip core */}
                    <div className="w-8 h-8 bg-green-500/30 border border-green-500/60 rounded flex items-center justify-center">
                      <div className="w-3 h-3 bg-green-400 rounded-sm opacity-80"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-center">
              <div className="font-bold text-white mb-1">LiveStack NFC Tag</div>
              <div className="text-white/40 text-sm">Model LS-01 · 13.56 MHz</div>
              <div className="mt-3 flex gap-2 justify-center">
                <span className="text-xs bg-green-500/10 border border-green-500/20 text-green-400 px-2 py-1 rounded-full">Waterproof</span>
                <span className="text-xs bg-green-500/10 border border-green-500/20 text-green-400 px-2 py-1 rounded-full">Epoxy sealed</span>
                <span className="text-xs bg-green-500/10 border border-green-500/20 text-green-400 px-2 py-1 rounded-full">5yr lifespan</span>
              </div>
            </div>
          </div>

          {/* Specs */}
          <div className="space-y-4">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <div className="text-xs font-medium text-white/30 uppercase tracking-wider mb-4">Specifications</div>
              <div className="space-y-3">
                {[
                  ['Size',         '25mm diameter · 0.8mm thin'],
                  ['Weight',       '0.3 grams'],
                  ['Technology',   'NFC ISO 14443A · 13.56 MHz'],
                  ['Storage',      '880 bytes — stores verify URL'],
                  ['Read range',   '1–4 cm tap range'],
                  ['Durability',   'IP68 waterproof · epoxy bonded'],
                  ['Battery',      'None — passive RFID'],
                  ['Lifespan',     '5+ years under hoof'],
                  ['Cost',         'J$500 per tag (~USD $3)'],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between py-2 border-b border-white/5 last:border-0 text-sm">
                    <span className="text-white/40">{k}</span>
                    <span className="text-white/80 text-right">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* How it works */}
        <div className="mb-16">
          <div className="text-xs font-medium text-white/30 uppercase tracking-widest mb-8 text-center">Installation process</div>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { step: '01', icon: '🐄', title: 'Animal registered', desc: 'Farmer registers animal in LiveStack. System generates unique tag ID and verify URL.' },
              { step: '02', icon: '🔧', title: 'Tag prepared', desc: 'NFC chip is programmed with the animal\'s verify URL. Takes 2 seconds.' },
              { step: '03', icon: '🧲', title: 'Bonded under hoof', desc: 'Tag is bonded to the underside of the selected hoof using waterproof epoxy. Dries in 24 hours.' },
              { step: '04', icon: '📱', title: 'Ready to verify', desc: 'Any phone can tap the hoof to instantly verify ownership. No app needed.' },
            ].map(({ step, icon, title, desc }) => (
              <div key={step} className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-colors">
                <div className="text-xs font-mono text-white/20 mb-2">{step}</div>
                <div className="text-3xl mb-3">{icon}</div>
                <div className="font-bold text-white text-sm mb-2">{title}</div>
                <div className="text-white/40 text-xs leading-relaxed">{desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Size comparison */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 mb-16">
          <div className="text-xs font-medium text-white/30 uppercase tracking-widest mb-6 text-center">Size comparison</div>
          <div className="flex items-center justify-center gap-12 flex-wrap">
            {[
              { label: 'LiveStack tag', size: 'w-10 h-10', color: 'bg-green-500/30 border-green-500/50', desc: '25mm' },
              { label: '1 dollar coin', size: 'w-12 h-12', color: 'bg-yellow-500/20 border-yellow-500/40', desc: '26.5mm' },
              { label: 'Sim card',      size: 'w-6 h-8',  color: 'bg-blue-500/20 border-blue-500/40',   desc: '15×25mm' },
              { label: 'Fingernail',    size: 'w-8 h-6',  color: 'bg-white/10 border-white/20',         desc: '~15mm' },
            ].map(({ label, size, color, desc }) => (
              <div key={label} className="flex flex-col items-center gap-3">
                <div className={`${size} rounded-full border-2 ${color} flex items-center justify-center`}>
                  <span className="text-white/20 text-xs">{desc}</span>
                </div>
                <div className="text-xs text-white/50 text-center">{label}</div>
              </div>
            ))}
          </div>
          <p className="text-center text-white/30 text-xs mt-6">
            The LiveStack tag is smaller than a coin — completely invisible under the hoof
          </p>
        </div>

        {/* Why under the hoof */}
        <div className="bg-gradient-to-r from-green-500/10 to-transparent border border-green-500/20 rounded-3xl p-8 mb-16">
          <div className="text-xs font-medium text-green-400/60 uppercase tracking-widest mb-4">Why under the hoof?</div>
          <h2 className="text-3xl font-black mb-4">The thief never sees it.<br/><span className="text-green-400">The butcher always finds it.</span></h2>
          <div className="grid md:grid-cols-3 gap-4 mt-6">
            {[
              { icon: '🦹', title: 'Invisible to thieves', desc: 'Tags on ears or necks can be removed. Under the hoof — no thief thinks to look there.' },
              { icon: '🔍', title: 'Known to inspectors', desc: 'RADA officers, vets, and butchers are trained to check the hoof. One tap reveals everything.' },
              { icon: '💧', title: 'Survives farm conditions', desc: 'Mud, water, manure — the epoxy-sealed chip survives everything a farm throws at it.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="bg-black/30 rounded-2xl p-4">
                <div className="text-2xl mb-2">{icon}</div>
                <div className="font-bold text-white text-sm mb-1">{title}</div>
                <div className="text-white/40 text-xs leading-relaxed">{desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-3xl font-black mb-4">Ready to tag your herd?</h2>
          <p className="text-white/40 mb-8">Register your first animal and get your NFC tags through RADA.</p>
          <div className="flex gap-4 justify-center">
            <Link href="/register"
              className="bg-green-500 hover:bg-green-400 text-black font-bold px-8 py-4 rounded-2xl transition-colors">
              Register an animal
            </Link>
            <Link href="/verify"
              className="border border-white/20 hover:border-white/40 text-white px-8 py-4 rounded-2xl transition-colors">
              Try butcher verify
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-8 mt-16">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-70 transition-opacity">
            <div className="w-6 h-6 bg-green-500 rounded-md flex items-center justify-center">
              <div className="w-2 h-2 bg-black rounded-full animate-pulse" />
            </div>
            <span className="text-sm font-bold">LiveStack</span>
          </Link>
          <p className="text-white/20 text-xs">LiveStack Hardware · LS-01 NFC Hoof Tag · 2025</p>
        </div>
      </footer>
    </div>
  )
}