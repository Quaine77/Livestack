'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { Animal } from '@/lib/types'

const HOOF_LABELS: Record<string, string> = {
  left_front_hoof:  'Left front hoof',
  right_front_hoof: 'Right front hoof',
  left_rear_hoof:   'Left rear hoof',
  right_rear_hoof:  'Right rear hoof',
}

function VerifyContent() {
  const params = useSearchParams()
  const tagId = params.get('tagId')
  const [animal, setAnimal] = useState<Animal | null>(null)
  const [loading, setLoading] = useState(true)
  const [demo, setDemo] = useState<'real'|'clear'|'blocked'|'unreg'>('real')
  const [manualTag, setManualTag] = useState('')
  const [searching, setSearching] = useState(false)
  const [declared, setDeclared] = useState(false)
  const [declaring, setDeclaring] = useState(false)
  const [currentTagId, setCurrentTagId] = useState(tagId || '')
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!currentTagId) { setLoading(false); return }
    setLoading(true)
    setNotFound(false)
    setAnimal(null)
    supabase
      .from('animals')
      .select('*')
      .eq('tag_id', currentTagId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (data) {
          setAnimal(data)
          setNotFound(false)
        } else {
          setAnimal(null)
          setNotFound(true)
        }
        setLoading(false)
      })
  }, [currentTagId])

  async function searchManual() {
    if (!manualTag.trim()) return
    setSearching(true)
    setDeclared(false)
    setCurrentTagId(manualTag.trim().toUpperCase())
    setSearching(false)
  }

  async function declareP() {
    setDeclaring(true)
    await new Promise(r => setTimeout(r, 1000))
    setDeclaring(false)
    setDeclared(true)
  }

  const status =
    demo !== 'real'          ? demo :
    !currentTagId            ? 'search' :
    loading                  ? 'loading' :
    notFound                 ? 'unreg' :
    !animal                  ? 'unreg' :
    animal.status === 'blocked' ? 'blocked' : 'clear'

  const themes = {
    search:  { bg: 'bg-black',      label: '',              sub: '' },
    loading: { bg: 'bg-black',      label: '',              sub: '' },
    clear:   { bg: 'bg-green-600',  label: 'CLEAR',         sub: 'Safe to purchase' },
    blocked: { bg: 'bg-red-600',    label: 'BLOCKED',       sub: 'Reported stolen' },
    unreg:   { bg: 'bg-amber-500',  label: 'UNREGISTERED',  sub: 'Do not purchase' },
  }

  const theme = themes[status as keyof typeof themes]

  if (status === 'loading') return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-white/40 text-sm">Checking registry...</p>
      </div>
    </div>
  )

  // Search screen
  if (status === 'search') {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col">
        <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 hover:opacity-70 transition-opacity">
            <div className="w-7 h-7 bg-green-500 rounded-lg flex items-center justify-center">
              <div className="w-2.5 h-2.5 bg-black rounded-full animate-pulse" />
            </div>
            <span className="font-bold text-sm">LiveStack</span>
          </a>
          <span className="text-white/40 text-sm">Butcher verification</span>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <div className="w-full max-w-sm">

            <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6 mb-6 text-center">
              <div className="text-4xl mb-3">📱</div>
              <div className="font-bold text-green-400 text-lg mb-2">Tap to verify</div>
              <div className="text-white/60 text-sm leading-relaxed">
                Hold your phone to the animal's hoof tag to verify instantly.
              </div>
              <div className="mt-4 bg-black/30 rounded-xl p-3">
                <div className="text-xs text-white/30 uppercase tracking-wider mb-2">Tag location</div>
                <div className="flex justify-center gap-2 flex-wrap">
                  {Object.values(HOOF_LABELS).map(label => (
                    <span key={label} className="text-xs bg-white/10 text-white/60 px-2 py-1 rounded-full">
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px bg-white/10"></div>
              <span className="text-white/30 text-xs">or enter tag manually</span>
              <div className="flex-1 h-px bg-white/10"></div>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={manualTag}
                onChange={e => setManualTag(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && searchManual()}
                placeholder="Tag ID — e.g. JM-001"
                className="flex-1 bg-white/5 border border-white/10 text-white placeholder-white/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/30"
              />
              <button
                onClick={searchManual}
                disabled={searching || !manualTag.trim()}
                className="bg-green-500 hover:bg-green-400 disabled:opacity-30 text-black font-bold px-5 py-3 rounded-xl transition-colors"
              >
                {searching ? '...' : 'Check'}
              </button>
            </div>

            <p className="text-white/20 text-xs text-center mt-4">
              Praedial Larceny Prevention Act 2023 · LiveStack Registry
            </p>
          </div>
        </div>

        <div className="p-4">
          <div className="text-white/20 text-xs text-center mb-2">Demo</div>
          <div className="flex justify-center gap-2">
            {(['clear','blocked','unreg'] as const).map(s => (
              <button key={s} onClick={() => setDemo(s)}
                className="px-3 py-1.5 rounded-full text-xs border border-white/20 text-white/40 hover:text-white hover:border-white/40 transition-all">
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Result screen
  return (
    <div className={`min-h-screen ${theme.bg} flex flex-col`}>

      <div className="px-6 py-4 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2 hover:opacity-70 transition-opacity">
          <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center">
            <div className="w-2.5 h-2.5 bg-white rounded-full" />
          </div>
          <span className="font-bold text-sm text-white">LiveStack</span>
        </a>
        <button
          onClick={() => {
            setCurrentTagId('')
            setAnimal(null)
            setManualTag('')
            setDeclared(false)
            setNotFound(false)
            setDemo('real')
          }}
          className="text-white/60 hover:text-white text-sm border border-white/20 px-3 py-1.5 rounded-lg transition-colors"
        >
          Scan another
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 text-white text-center">

        <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mb-6 text-5xl">
          {status === 'clear' ? '✓' : status === 'blocked' ? '✗' : '?'}
        </div>

        <div className="text-5xl font-black mb-2">{theme.label}</div>
        <div className="text-lg opacity-70 mb-8">{theme.sub}</div>

        {/* Clear */}
        {status === 'clear' && animal && (
          <div className="w-full max-w-sm">
            <div className="bg-white/20 rounded-2xl p-5 mb-4 text-left">
              <div className="text-xs font-medium opacity-60 uppercase tracking-wider mb-3">Animal details</div>
              {[
                ['Name',         animal.name],
                ['Tag ID',       animal.tag_id],
                ['Species',      animal.species],
                ['Breed',        animal.breed],
                ['Weight',       `${animal.weight_kg}kg`],
                ['RADA Licence', animal.rada_licence],
                ['Tag location', HOOF_LABELS[(animal as any).tag_location] || 'Hoof tag'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between py-2 border-b border-white/20 text-sm last:border-0">
                  <span className="opacity-60">{k}</span>
                  <span className="font-medium">{v}</span>
                </div>
              ))}
            </div>
            {!declared ? (
              <button onClick={declareP} disabled={declaring}
                className="w-full bg-white text-green-700 font-bold py-4 rounded-xl hover:bg-green-50 transition-colors disabled:opacity-70">
                {declaring ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-green-700 border-t-transparent rounded-full animate-spin"></span>
                    Recording...
                  </span>
                ) : 'Declare purchase'}
              </button>
            ) : (
              <div className="bg-white/20 rounded-xl p-4 text-center">
                <div className="font-bold mb-1">Purchase declared</div>
                <div className="text-sm opacity-70">Transaction recorded on LiveStack ledger</div>
              </div>
            )}
          </div>
        )}

        {/* Blocked */}
        {status === 'blocked' && (
          <div className="bg-white/20 rounded-2xl p-6 w-full max-w-sm">
            <div className="font-bold text-xl mb-2">Criminal offence to purchase</div>
            <div className="text-sm opacity-70 mb-4">Praedial Larceny Prevention Act 2023</div>
            <div className="bg-black/20 rounded-xl p-3 text-xs opacity-60">
              Police case: JCF-2025-0441<br/>
              Reported: {new Date().toLocaleDateString()}
            </div>
          </div>
        )}

        {/* Unregistered */}
        {status === 'unreg' && (
          <div className="bg-white/20 rounded-2xl p-6 w-full max-w-sm">
            <div className="font-bold text-lg mb-2">No registry record found</div>
            <div className="text-sm opacity-70 leading-relaxed">
              Tag ID: <span className="font-mono">{currentTagId}</span><br/>
              This animal is not registered in the LiveStack registry.<br/>
              Illegal to purchase unregistered livestock under the Praedial Larceny Prevention Act 2023.
            </div>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex justify-center gap-2">
          {(['real','clear','blocked','unreg'] as const).map(s => (
            <button key={s}
              onClick={() => { setDemo(s); setDeclared(false) }}
              className={`px-3 py-1.5 rounded-full text-xs border border-white/30 transition-all ${
                demo === s ? 'bg-white text-gray-800' : 'text-white/40 hover:text-white'
              }`}>
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white/40">Loading...</div>
      </div>
    }>
      <VerifyContent />
    </Suspense>
  )
}