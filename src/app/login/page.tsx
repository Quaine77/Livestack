'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function login() {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      window.location.href = '/dashboard'
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <a href="/" className="flex items-center gap-2 justify-center mb-8 hover:opacity-70 transition-opacity">
          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
            <div className="w-3 h-3 bg-black rounded-full animate-pulse" />
          </div>
          <span className="font-bold text-lg">LiveStack</span>
        </a>

        <h1 className="text-2xl font-black mb-2 text-center">Welcome back</h1>
        <p className="text-white/40 text-sm text-center mb-8">Sign in to your farmer account</p>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-white/30 uppercase tracking-wider block mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && login()}
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
              onKeyDown={e => e.key === 'Enter' && login()}
              placeholder="••••••••"
              className="w-full bg-white/5 border border-white/10 text-white placeholder-white/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/30"
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <button
            onClick={login}
            disabled={loading || !email || !password}
            className="w-full bg-green-500 hover:bg-green-400 disabled:opacity-30 text-black font-bold py-4 rounded-xl transition-colors"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                Signing in...
              </span>
            ) : 'Sign in'}
          </button>
        </div>

        <p className="text-center text-white/30 text-sm mt-6">
          No account?{' '}
          <a href="/signup" className="text-green-400 hover:text-green-300 transition-colors">
            Create one
          </a>
        </p>
      </div>
    </div>
  )
}