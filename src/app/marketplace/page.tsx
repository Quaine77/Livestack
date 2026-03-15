'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface Listing {
  id: string
  animal_id: string
  tag_id: string
  price: number
  description: string
  status: string
  created_at: string
  animals?: {
    name: string
    species: string
    breed: string
    weight_kg: number
    rada_licence: string
    status: string
  }
}

interface Offer {
  listing_id: string
  buyer_name: string
  buyer_contact: string
  offer_price: number
  message: string
}

export default function MarketplacePage() {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Listing | null>(null)
  const [offer, setOffer] = useState<Offer>({ listing_id: '', buyer_name: '', buyer_contact: '', offer_price: 0, message: '' })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    supabase
      .from('listings')
      .select('*, animals(*)')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setListings(data)
        setLoading(false)
      })
  }, [])

  async function submitOffer() {
    if (!selected) return
    setSubmitting(true)
    await supabase.from('offers').insert({
      listing_id: selected.id,
      buyer_name: offer.buyer_name,
      buyer_contact: offer.buyer_contact,
      offer_price: offer.offer_price,
      message: offer.message,
      status: 'pending',
    })
    setSubmitting(false)
    setSubmitted(true)
  }

  const SPECIES = ['all', 'Cattle', 'Goat', 'Sheep', 'Pig', 'Horse']

  const filtered = listings.filter(l => {
    const matchFilter = filter === 'all' || l.animals?.species === filter
    const matchSearch = search === '' ||
      l.animals?.name.toLowerCase().includes(search.toLowerCase()) ||
      l.animals?.breed.toLowerCase().includes(search.toLowerCase()) ||
      l.tag_id.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-white/40 text-sm">Loading marketplace...</p>
      </div>
    </div>
  )

  if (selected && !submitted) return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-white/10 px-6 py-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 hover:opacity-70 transition-opacity">
            <div className="w-7 h-7 bg-green-500 rounded-lg flex items-center justify-center">
              <div className="w-2.5 h-2.5 bg-black rounded-full animate-pulse" />
            </div>
            <span className="font-bold text-sm">LiveStack</span>
          </a>
          <button onClick={() => setSelected(null)} className="text-white/40 hover:text-white text-sm transition-colors">
            ← Back to listings
          </button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-6 py-8">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-6">
          <div className="text-xs text-white/30 uppercase tracking-wider mb-3">You are making an offer on</div>
          <div className="font-black text-xl text-white mb-1">{selected.animals?.name}</div>
          <div className="text-white/50 text-sm">{selected.animals?.breed} {selected.animals?.species} · {selected.animals?.weight_kg}kg · {selected.tag_id}</div>
          <div className="text-green-400 font-bold text-lg mt-3">
            Listed at J${selected.price.toLocaleString()}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-black">Make an offer</h2>

          <div>
            <label className="text-xs text-white/30 uppercase tracking-wider block mb-2">Your name</label>
            <input
              value={offer.buyer_name}
              onChange={e => setOffer(p => ({ ...p, buyer_name: e.target.value }))}
              placeholder="Full name"
              className="w-full bg-white/5 border border-white/10 text-white placeholder-white/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/30"
            />
          </div>

          <div>
            <label className="text-xs text-white/30 uppercase tracking-wider block mb-2">Contact (phone or email)</label>
            <input
              value={offer.buyer_contact}
              onChange={e => setOffer(p => ({ ...p, buyer_contact: e.target.value }))}
              placeholder="How the farmer can reach you"
              className="w-full bg-white/5 border border-white/10 text-white placeholder-white/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/30"
            />
          </div>

          <div>
            <label className="text-xs text-white/30 uppercase tracking-wider block mb-2">Your offer (J$)</label>
            <input
              type="number"
              value={offer.offer_price || ''}
              onChange={e => setOffer(p => ({ ...p, offer_price: parseFloat(e.target.value) }))}
              placeholder={`Listed at J$${selected.price.toLocaleString()}`}
              className="w-full bg-white/5 border border-white/10 text-white placeholder-white/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/30"
            />
          </div>

          <div>
            <label className="text-xs text-white/30 uppercase tracking-wider block mb-2">Message (optional)</label>
            <textarea
              value={offer.message}
              onChange={e => setOffer(p => ({ ...p, message: e.target.value }))}
              placeholder="Any questions or details for the farmer..."
              rows={3}
              className="w-full bg-white/5 border border-white/10 text-white placeholder-white/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/30 resize-none"
            />
          </div>

          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 text-xs text-green-400/70">
            All animals on LiveStack are RADA-certified and verified. Ownership transfers digitally on acceptance.
          </div>

          <button
            onClick={submitOffer}
            disabled={submitting || !offer.buyer_name || !offer.buyer_contact || !offer.offer_price}
            className="w-full bg-green-500 hover:bg-green-400 disabled:opacity-30 text-black font-bold py-4 rounded-xl transition-colors"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                Submitting offer...
              </span>
            ) : 'Submit offer'}
          </button>
        </div>
      </main>
    </div>
  )

  if (submitted) return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="w-full max-w-sm text-center">
        <div className="w-16 h-16 bg-green-500/20 border border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">✓</div>
        <h1 className="text-2xl font-black mb-2">Offer submitted</h1>
        <p className="text-white/50 text-sm mb-6">
          The farmer will be notified and will contact you at <span className="text-white">{offer.buyer_contact}</span>.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => { setSelected(null); setSubmitted(false); setOffer({ listing_id:'', buyer_name:'', buyer_contact:'', offer_price:0, message:'' }) }}
            className="flex-1 bg-green-500 hover:bg-green-400 text-black font-bold py-3 rounded-xl text-sm transition-colors"
          >
            Browse more
          </button>
          <a href="/dashboard" className="flex-1 border border-white/10 hover:border-white/20 text-white/60 hover:text-white py-3 rounded-xl text-sm text-center transition-colors">
            Dashboard
          </a>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-black text-white">
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
            <span className="text-white/60 text-sm">Marketplace</span>
          </div>
          <div className="flex items-center gap-2">
            <a href="/dashboard" className="text-xs border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-lg text-white/60 hover:text-white transition-all">Dashboard</a>
            <a href="/register" className="text-xs bg-green-500 hover:bg-green-400 text-black font-bold px-3 py-1.5 rounded-lg transition-colors">List animal</a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-black tracking-tight">Livestock marketplace</h1>
          <p className="text-white/40 text-sm mt-1">RADA-verified animals only · Secure ownership transfer · {listings.length} listings</p>
        </div>

        {/* Search + filter */}
        <div className="flex gap-3 mb-6 flex-wrap">
          <div className="flex-1 relative min-w-48">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35" strokeLinecap="round"/>
            </svg>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search animals..."
              className="w-full bg-white/5 border border-white/10 text-white placeholder-white/20 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-white/30"
            />
          </div>
          <div className="flex gap-1 bg-white/5 border border-white/10 rounded-xl p-1">
            {SPECIES.map(s => (
              <button key={s} onClick={() => setFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
                  filter === s ? 'bg-white text-black' : 'text-white/50 hover:text-white'
                }`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Listings grid */}
        {filtered.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
            <p className="text-white/40 text-sm">No listings found</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(listing => (
              <div key={listing.id}
                className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all group cursor-pointer"
                onClick={() => { setSelected(listing); setOffer(p => ({ ...p, listing_id: listing.id, offer_price: listing.price })) }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="font-black text-white text-lg">{listing.animals?.name}</div>
                    <div className="text-white/40 text-xs mt-0.5">{listing.animals?.breed} · {listing.animals?.species}</div>
                  </div>
                  <span className="text-xs bg-green-500/10 border border-green-500/20 text-green-400 px-2 py-1 rounded-full font-medium">
                    Verified
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-4">
                  {[
                    ['Weight', `${listing.animals?.weight_kg}kg`],
                    ['Tag ID', listing.tag_id],
                    ['RADA', listing.animals?.rada_licence?.split('-').slice(-1)[0] || '—'],
                    ['Status', 'Available'],
                  ].map(([k, v]) => (
                    <div key={k} className="bg-black/30 rounded-lg p-2">
                      <div className="text-white/30 text-xs">{k}</div>
                      <div className="text-white text-xs font-medium font-mono">{v}</div>
                    </div>
                  ))}
                </div>

                {listing.description && (
                  <p className="text-white/40 text-xs mb-4 leading-relaxed line-clamp-2">{listing.description}</p>
                )}

                <div className="flex items-center justify-between">
                  <div className="text-green-400 font-black text-xl">
                    J${listing.price.toLocaleString()}
                  </div>
                  <button className="text-xs bg-green-500 hover:bg-green-400 text-black font-bold px-4 py-2 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                    Make offer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}