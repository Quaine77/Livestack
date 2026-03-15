'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [farm, setFarm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  async function signup() {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name, farm_name: farm }
      }
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setDone(true)
    }
  }

  if (done) return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm text-center">
        <div className="w-16 h-16 bg-green-500/20 border border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
          ✓
        </div>
        <h1 className="text-2xl font-black mb-2">Check your email</h1>
        <p className="text-white/50 text-sm mb-6">
          We sent a confirmation link to <span className="text-white">{email}</span>. Click it to activate your account.
        </p>
        <a href="/login" className="block w-full bg-green-500 hover:bg-green-400 text-black font-bold py-4 rounded-xl text-center transition-colors">
          Go to login
        </a>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <a href="/" className="flex items-center gap-2 justify-center mb-8 hover:opacity-70 transition-opacity">
          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
            <div className="w-3 h-3 bg-black rounded-full animate-pulse" />
          </div>
          <span className="font-bold text-lg">LiveStack</span>
        </a>

        <h1 className="text-2xl font-black mb-2 text-center">Create account</h1>
        <p className="text-white/40 text-sm text-center mb-8">Register your farm on LiveStack</p>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-white/30 uppercase tracking-wider block mb-2">Your name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Full name"
              className="w-full bg-white/5 border border-white/10 text-white placeholder-white/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/30"
            />
          </div>
          <div>
            <label className="text-xs text-white/30 uppercase tracking-wider block mb-2">Farm name</label>
            <input
              type="text"
              value={farm}
              onChange={e => setFarm(e.target.value)}
              placeholder="e.g. Greenview Farm"
              className="w-full bg-white/5 border border-white/10 text-white placeholder-white/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/30"
            />
          </div>
          <div>
            <label className="text-xs text-white/30 uppercase tracking-wider block mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-white/5 border border-white/10 text-white placeholder-white/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/30"
            />
          </div>
          <div>
            <label className="text-xs text-white/30 uppercase tracking-wider block mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Min 6 characters"
              className="w-full bg-white/5 border border-white/10 text-white placeholder-white/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/30"
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <button
            onClick={signup}
            disabled={loading || !email || !password || !name}
            className="w-full bg-green-500 hover:bg-green-400 disabled:opacity-30 text-black font-bold py-4 rounded-xl transition-colors"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                Creating account...
              </span>
            ) : 'Create account'}
          </button>
        </div>

        <p className="text-center text-white/30 text-sm mt-6">
          Already have an account?{' '}
          <a href="/login" className="text-green-400 hover:text-green-300 transition-colors">
            Sign in
          </a>
        </p>
      </div>
    </div>
  )
}