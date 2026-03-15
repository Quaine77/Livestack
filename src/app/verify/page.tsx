'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { Animal } from '@/lib/types'

function VerifyContent() {
  const params = useSearchParams()
  const tagId = params.get('tagId')
  const [animal, setAnimal] = useState<Animal | null>(null)
  const [loading, setLoading] = useState(true)
  const [demo, setDemo] = useState<'real' | 'clear' | 'blocked' | 'unreg'>('real')

  useEffect(() => {
    if (!tagId) { setLoading(false); return }
    supabase.from('animals').select('*').eq('tag_id', tagId).single()
      .then(({ data }) => { setAnimal(data); setLoading(false) })
  }, [tagId])

  const status = demo !== 'real' ? demo
    : !animal ? 'unreg'
    : animal.status === 'blocked' ? 'blocked' : 'clear'

  const themes = {
    clear:   { bg: 'bg-green-600',  label: 'CLEAR', sub: 'Safe to purchase' },
    blocked: { bg: 'bg-red-600',    label: 'BLOCKED', sub: 'Stolen animal — do not buy' },
    unreg:   { bg: 'bg-amber-500',  label: 'UNREGISTERED', sub: 'No RADA papers found' },
  }
  const theme = themes[status as keyof typeof themes]

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-green-700 font-medium">Checking RADA registry...</div>
    </div>
  )

  return (
    <div className={`min-h-screen ${theme.bg} flex flex-col`}>
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-white text-center">

        <div className="text-6xl font-bold mb-2">{theme.label}</div>
        <div className="text-xl opacity-80 mb-8">{theme.sub}</div>

        {status === 'clear' && animal && (
          <div className="bg-white/20 backdrop-blur rounded-2xl p-6 w-full max-w-sm mb-6">
            <div className="text-sm opacity-70 mb-4 uppercase tracking-wide font-medium">Animal details</div>
            {[
              ['Name',         animal.name],
              ['Tag ID',       animal.tag_id],
              ['Species',      animal.species],
              ['Breed',        animal.breed],
              ['Weight',       `${animal.weight_kg}kg`],
              ['RADA Licence', animal.rada_licence],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between py-2 border-b border-white/20 text-sm last:border-0">
                <span className="opacity-70">{k}</span>
                <span className="font-medium">{v}</span>
              </div>
            ))}
          </div>
        )}

        {status === 'blocked' && (
          <div className="bg-white/20 backdrop-blur rounded-2xl p-6 w-full max-w-sm mb-6 text-center">
            <div className="text-2xl mb-3">⛔</div>
            <div className="font-semibold mb-2">Purchasing this animal is a criminal offence</div>
            <div className="text-sm opacity-80">Under the Praedial Larceny Prevention Act 2023</div>
            <div className="text-xs opacity-60 mt-3">Police case: JCF-2025-0441</div>
          </div>
        )}

        {status === 'unreg' && (
          <div className="bg-white/20 backdrop-blur rounded-2xl p-6 w-full max-w-sm mb-6 text-center">
            <div className="text-2xl mb-3">⚠️</div>
            <div className="font-semibold mb-2">Animal not in RADA registry</div>
            <div className="text-sm opacity-80">
              Illegal to purchase unregistered livestock under the Praedial Larceny Prevention Act 2023
            </div>
          </div>
        )}

        <a href="/dashboard" className="text-sm opacity-60 hover:opacity-100 underline">
          Back to dashboard
        </a>
      </div>

      <div className="p-4 border-t border-white/10">
        <div className="flex justify-center gap-2 mb-2">
          {(['clear', 'blocked', 'unreg'] as const).map(s => (
            <button key={s} onClick={() => setDemo(s)}
              className={`px-3 py-1 rounded-full text-xs border border-white/40 transition ${
                demo === s ? 'bg-white text-gray-800' : 'text-white hover:bg-white/10'
              }`}>
              {s}
            </button>
          ))}
        </div>
        <div className="text-center text-white/40 text-xs">Demo toggle — cycles through all 3 states</div>
      </div>
    </div>
  )
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-green-700">Loading...</div>
      </div>
    }>
      <VerifyContent />
    </Suspense>
  )
}
