'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

const SPECIES = ['Cattle', 'Goat', 'Sheep', 'Pig', 'Horse']

const BREEDS: Record<string, string[]> = {
  Cattle: ['Black Angus', 'Brahman', 'Holstein', 'Red Poll', 'Charolais', 'Hereford'],
  Goat:   ['Boer', 'Nubian', 'Saanen', 'Alpine', 'Jamaican Creole'],
  Sheep:  ['Dorper', 'Barbados Blackbelly', 'Rambouillet', 'Suffolk'],
  Pig:    ['Duroc', 'Yorkshire', 'Landrace', 'Berkshire'],
  Horse:  ['Thoroughbred', 'Quarter Horse', 'Arabian'],
}

const HOOFS = [
  { id: 'left_front_hoof',  label: 'Left front' },
  { id: 'right_front_hoof', label: 'Right front' },
  { id: 'left_rear_hoof',   label: 'Left rear' },
  { id: 'right_rear_hoof',  label: 'Right rear' },
]

const PARISHES = [
  'Kingston','St. Andrew','St. Thomas','Portland','St. Mary',
  'St. Ann','Trelawny','St. James','Hanover','Westmoreland',
  'St. Elizabeth','Manchester','Clarendon','St. Catherine',
]

function NFCWriter({ url, hoof }: { url: string; hoof: string }) {
  const [status, setStatus] = useState<'idle'|'writing'|'done'|'error'|'unsupported'>('idle')
  const [message, setMessage] = useState('')

  async function writeNFC() {
    if (!('NDEFReader' in window)) {
      setStatus('unsupported')
      setMessage('NFC writing requires Android Chrome. Use the URL below to program manually.')
      return
    }
    try {
      setStatus('writing')
      setMessage('Hold your phone to the NFC sticker under the hoof...')
      const ndef = new (window as any).NDEFReader()
      await ndef.write({ records: [{ recordType: 'url', data: url }] })
      setStatus('done')
      setMessage('NFC chip programmed successfully!')
    } catch (err: any) {
      setStatus('error')
      setMessage(err.message || 'Write failed — try again')
    }
  }

  return (
    <div className={`rounded-xl p-4 mb-6 border text-left ${
      status === 'done'    ? 'bg-green-500/10 border-green-500/20' :
      status === 'error'   ? 'bg-red-500/10 border-red-500/20' :
      status === 'writing' ? 'bg-amber-500/10 border-amber-500/20' :
                             'bg-white/5 border-white/10'
    }`}>
      <div className="font-bold text-white text-sm mb-1">Program hoof tag</div>
      <div className="text-white/50 text-xs mb-3">
        Bond an NFC sticker under the <span className="text-white">{hoof}</span>, then tap your phone to it.
      </div>
      {status === 'idle' && (
        <button onClick={writeNFC}
          className="w-full bg-green-500 hover:bg-green-400 text-black font-bold py-3 rounded-lg text-sm transition-colors">
          Tap to write NFC chip
        </button>
      )}
      {status === 'writing' && (
        <div className="flex items-center gap-3 text-amber-400 text-xs">
          <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
          {message}
        </div>
      )}
      {status === 'done' && (
        <div className="text-green-400 text-xs font-medium">✓ {message}</div>
      )}
      {(status === 'error' || status === 'unsupported') && (
        <div>
          <div className="text-red-400 text-xs mb-2">{message}</div>
          <div className="bg-black/20 rounded-lg p-2 font-mono text-xs text-white/40 break-all">{url}</div>
        </div>
      )}
    </div>
  )
}

export default function RegisterPage() {
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [generatedTag, setGeneratedTag] = useState('')
  const [form, setForm] = useState({
    name: '',
    species: '',
    breed: '',
    weight_kg: '',
    dob: '',
    parish: '',
    farm_name: '',
    farmer_name: '',
    rada_id: '',
    tag_location: 'left_front_hoof',
    notes: '',
  })

  function set(key: string, val: string) {
    if (key === 'species') {
      setForm(p => ({ ...p, species: val, breed: '' }))
    } else {
      setForm(p => ({ ...p, [key]: val }))
    }
  }

  async function submit() {
    setSubmitting(true)
    const tagId = `JM-${Math.floor(1000 + Math.random() * 9000)}`
    setGeneratedTag(tagId)

    const { data: { user } } = await supabase.auth.getUser()

    await supabase.from('animals').insert({
      tag_id: tagId,
      name: form.name,
      species: form.species,
      breed: form.breed,
      weight_kg: parseFloat(form.weight_kg) || 0,
      status: 'active',
      lat: 17.9970,
      lng: -76.7936,
      rada_licence: `RADA-PENDING-${tagId}`,
      tag_location: form.tag_location,
      nfc_url: `https://livestack-five.vercel.app/verify?tagId=${tagId}`,
      user_id: user?.id ?? null,
    })

    setSubmitting(false)
    setSubmitted(true)
  }

  const step1ok = form.name && form.species && form.breed && form.weight_kg
  const step2ok = form.farm_name && form.farmer_name && form.parish

  if (submitted) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-sm text-center">
          <div className="w-20 h-20 bg-green-500/20 border border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
            ✓
          </div>
          <h1 className="text-3xl font-black mb-2">Registered</h1>
          <p className="text-white/50 text-sm mb-6">Submitted to RADA for approval.</p>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-4 text-left space-y-1">
            {[
              ['Animal',       form.name],
              ['Tag ID',       generatedTag],
              ['Species',      `${form.species} · ${form.breed}`],
              ['Tag location', HOOFS.find(h => h.id === form.tag_location)?.label + ' hoof'],
              ['Status',       'Pending RADA approval'],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between py-1.5 border-b border-white/5 text-xs last:border-0">
                <span className="text-white/30">{k}</span>
                <span className="text-white font-mono">{v}</span>
              </div>
            ))}
          </div>
          <NFCWriter
            url={`https://livestack-five.vercel.app/verify?tagId=${generatedTag}`}
            hoof={HOOFS.find(h => h.id === form.tag_location)?.label + ' hoof'}
          />
          <div className="flex gap-3">
            <a href="/dashboard"
              className="flex-1 bg-green-500 hover:bg-green-400 text-black font-bold py-3 rounded-xl text-sm text-center transition-colors">
              Dashboard
            </a>
            <button
              onClick={() => {
                setSubmitted(false)
                setStep(1)
                setGeneratedTag('')
                setForm({ name:'',species:'',breed:'',weight_kg:'',dob:'',parish:'',farm_name:'',farmer_name:'',rada_id:'',tag_location:'left_front_hoof',notes:'' })
              }}
              className="flex-1 border border-white/10 hover:border-white/20 text-white/60 hover:text-white py-3 rounded-xl text-sm transition-colors"
            >
              Register another
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-white/10 px-6 py-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 hover:opacity-70 transition-opacity">
            <div className="w-7 h-7 bg-green-500 rounded-lg flex items-center justify-center">
              <div className="w-2.5 h-2.5 bg-black rounded-full animate-pulse" />
            </div>
            <span className="font-bold text-sm">LiveStack</span>
          </a>
          <span className="text-white/40 text-sm">Register animal</span>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-6 py-8">

        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center gap-2 flex-1 last:flex-none">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all ${
                step > s ? 'bg-green-500 text-black' :
                step === s ? 'bg-white text-black' :
                'bg-white/10 text-white/30'
              }`}>
                {step > s ? '✓' : s}
              </div>
              <span className={`text-xs ${step >= s ? 'text-white/60' : 'text-white/20'}`}>
                {s === 1 ? 'Animal' : s === 2 ? 'Farm' : 'Tag'}
              </span>
              {s < 3 && <div className={`flex-1 h-px ${step > s ? 'bg-green-500' : 'bg-white/10'}`} />}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-black mb-1">Animal details</h2>
              <p className="text-white/40 text-sm">Basic information about the animal</p>
            </div>
            <div>
              <label className="text-xs text-white/30 uppercase tracking-wider block mb-2">Name</label>
              <input value={form.name} onChange={e => set('name', e.target.value)}
                placeholder="e.g. Big Boy"
                className="w-full bg-white/5 border border-white/10 text-white placeholder-white/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/30"/>
            </div>
            <div>
              <label className="text-xs text-white/30 uppercase tracking-wider block mb-2">Species</label>
              <div className="grid grid-cols-3 gap-2">
                {SPECIES.map(s => (
                  <button key={s} onClick={() => set('species', s)}
                    className={`py-2.5 rounded-xl text-sm font-medium border transition-all ${
                      form.species === s
                        ? 'bg-green-500 text-black border-green-500'
                        : 'bg-white/5 border-white/10 text-white/50 hover:text-white hover:border-white/20'
                    }`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            {form.species && (
              <div>
                <label className="text-xs text-white/30 uppercase tracking-wider block mb-2">Breed</label>
                <select value={form.breed} onChange={e => set('breed', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/30">
                  <option value="">Select breed...</option>
                  {BREEDS[form.species]?.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-white/30 uppercase tracking-wider block mb-2">Weight (kg)</label>
                <input type="number" value={form.weight_kg} onChange={e => set('weight_kg', e.target.value)}
                  placeholder="e.g. 350"
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-white/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/30"/>
              </div>
              <div>
                <label className="text-xs text-white/30 uppercase tracking-wider block mb-2">Date of birth</label>
                <input type="date" value={form.dob} onChange={e => set('dob', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/30"/>
              </div>
            </div>
            <div>
              <label className="text-xs text-white/30 uppercase tracking-wider block mb-2">Notes (optional)</label>
              <textarea value={form.notes} onChange={e => set('notes', e.target.value)}
                placeholder="Identifying marks, health history..." rows={3}
                className="w-full bg-white/5 border border-white/10 text-white placeholder-white/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/30 resize-none"/>
            </div>
            <button onClick={() => setStep(2)} disabled={!step1ok}
              className="w-full bg-green-500 hover:bg-green-400 disabled:opacity-30 text-black font-bold py-4 rounded-xl transition-colors">
              Next — Farm details
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-black mb-1">Farm details</h2>
              <p className="text-white/40 text-sm">Your farm and RADA information</p>
            </div>
            <div>
              <label className="text-xs text-white/30 uppercase tracking-wider block mb-2">Farmer name</label>
              <input value={form.farmer_name} onChange={e => set('farmer_name', e.target.value)}
                placeholder="Your full name"
                className="w-full bg-white/5 border border-white/10 text-white placeholder-white/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/30"/>
            </div>
            <div>
              <label className="text-xs text-white/30 uppercase tracking-wider block mb-2">Farm name</label>
              <input value={form.farm_name} onChange={e => set('farm_name', e.target.value)}
                placeholder="e.g. Greenview Farm"
                className="w-full bg-white/5 border border-white/10 text-white placeholder-white/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/30"/>
            </div>
            <div>
              <label className="text-xs text-white/30 uppercase tracking-wider block mb-2">Parish</label>
              <select value={form.parish} onChange={e => set('parish', e.target.value)}
                className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/30">
                <option value="">Select parish...</option>
                {PARISHES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-white/30 uppercase tracking-wider block mb-2">RADA ID (if registered)</label>
              <input value={form.rada_id} onChange={e => set('rada_id', e.target.value)}
                placeholder="Leave blank if new to RADA"
                className="w-full bg-white/5 border border-white/10 text-white placeholder-white/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/30"/>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)}
                className="flex-1 border border-white/10 hover:border-white/20 text-white/50 hover:text-white py-4 rounded-xl text-sm transition-colors">
                Back
              </button>
              <button onClick={() => setStep(3)} disabled={!step2ok}
                className="flex-1 bg-green-500 hover:bg-green-400 disabled:opacity-30 text-black font-bold py-4 rounded-xl transition-colors">
                Next — Tag setup
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-black mb-1">Tag placement</h2>
              <p className="text-white/40 text-sm">Which hoof will the NFC chip be placed under?</p>
            </div>
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-xs text-green-400/70 leading-relaxed">
              <span className="font-bold text-green-400 block mb-1">How it works</span>
              A waterproof NFC chip is bonded under the selected hoof using epoxy.
              Invisible from outside. Tap phone to hoof to verify instantly.
            </div>
            <div>
              <label className="text-xs text-white/30 uppercase tracking-wider block mb-3">Select hoof</label>
              <div className="grid grid-cols-2 gap-3">
                {HOOFS.map(h => (
                  <button key={h.id} onClick={() => set('tag_location', h.id)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      form.tag_location === h.id
                        ? 'bg-green-500/10 border-green-500/30 text-white'
                        : 'bg-white/5 border-white/10 text-white/40 hover:border-white/20 hover:text-white'
                    }`}>
                    <div className="text-xl mb-1">🐄</div>
                    <div className="font-medium text-sm">{h.label} hoof</div>
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-1">
              <div className="text-xs text-white/30 uppercase tracking-wider mb-2">Summary</div>
              {[
                ['Animal',  form.name],
                ['Species', `${form.species} · ${form.breed}`],
                ['Weight',  `${form.weight_kg}kg`],
                ['Farm',    `${form.farm_name} · ${form.parish}`],
                ['Farmer',  form.farmer_name],
                ['Tag hoof',HOOFS.find(h => h.id === form.tag_location)?.label],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between text-xs py-1 border-b border-white/5 last:border-0">
                  <span className="text-white/30">{k}</span>
                  <span className="text-white">{v}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(2)}
                className="flex-1 border border-white/10 hover:border-white/20 text-white/50 hover:text-white py-4 rounded-xl text-sm transition-colors">
                Back
              </button>
              <button onClick={submit} disabled={submitting}
                className="flex-1 bg-green-500 hover:bg-green-400 disabled:opacity-30 text-black font-bold py-4 rounded-xl transition-colors">
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    Registering...
                  </span>
                ) : 'Submit to RADA'}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}