'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const router = useRouter()

  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword
  const passStrength = password.length === 0 ? 0 : password.length < 4 ? 1 : password.length < 8 ? 2 : 3

  async function reset() {
    if (password !== confirmPassword) { setError('Passwords do not match'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.updateUser({ password })
    if (error) { setError(error.message); setLoading(false) }
    else setDone(true)
    setLoading(false)
  }

  if (done) return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="w-full max-w-sm text-center">
        <div className="w-16 h-16 bg-green-500/20 border border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
          ✓
        </div>
        <h1 className="text-2xl font-black mb-2">Password updated</h1>
        <p className="text-white/50 text-sm mb-6">Your password has been reset successfully.</p>
        <a href="/login" className="block w-full bg-green-500 hover:bg-green-400 text-black font-bold py-4 rounded-xl text-center transition-colors">
          Sign in now
        </a>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <a href="/" className="flex items-center gap-2 justify-center mb-8 hover:opacity-70 transition-opacity">
          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
            <div className="w-3 h-3 bg-black rounded-full animate-pulse" />
          </div>
          <span className="font-bold text-lg">LiveStack</span>
        </a>

        <h1 className="text-2xl font-black mb-2 text-center">Reset password</h1>
        <p className="text-white/40 text-sm text-center mb-8">Enter your new password below</p>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-white/30 uppercase tracking-wider block mb-2">New password</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Min 6 characters"
                className="w-full bg-white/5 border border-white/10 text-white placeholder-white/20 rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:border-white/30"
              />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white text-xs">
                {showPass ? 'hide' : 'show'}
              </button>
            </div>
            {password.length > 0 && (
              <div className="flex gap-1 mt-2">
                {[1,2,3].map(i => (
                  <div key={i} className={`flex-1 h-1 rounded-full transition-all ${
                    passStrength >= i
                      ? i === 1 ? 'bg-red-500' : i === 2 ? 'bg-amber-500' : 'bg-green-500'
                      : 'bg-white/10'
                  }`} />
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="text-xs text-white/30 uppercase tracking-wider block mb-2">Confirm new password</label>
            <input
              type="password"
              value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              className={`w-full bg-white/5 border text-white placeholder-white/20 rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors ${
                passwordsMismatch ? 'border-red-500/40' :
                passwordsMatch ? 'border-green-500/40' :
                'border-white/10'
              }`}
            />
            {passwordsMismatch && <p className="text-red-400 text-xs mt-1">Passwords do not match</p>}
            {passwordsMatch && <p className="text-green-400 text-xs mt-1">✓ Passwords match</p>}
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <button
            onClick={reset}
            disabled={loading || !password || !confirmPassword || passwordsMismatch}
            className="w-full bg-green-500 hover:bg-green-400 disabled:opacity-30 text-black font-bold py-4 rounded-xl transition-colors"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                Updating...
              </span>
            ) : 'Reset password'}
          </button>
        </div>
      </div>
    </div>
  )
}