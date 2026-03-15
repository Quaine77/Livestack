'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [farm, setFarm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [focused, setFocused] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const passStrength = password.length === 0 ? 0 : password.length < 4 ? 1 : password.length < 8 ? 2 : 3
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword

  async function signup() {
    if (password !== confirmPassword) { setError('Passwords do not match'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name, farm_name: farm },
        emailRedirectTo: `${window.location.origin}/login?verified=true`,
      }
    })
    if (error) { setError(error.message); setLoading(false) }
    else setDone(true)
    setLoading(false)
  }

  if (done) return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm text-center">
        <div className="flex justify-center gap-4 mb-6 text-5xl">
          <span style={{ animation: 'bounce 0.6s ease infinite alternate' }}>🐄</span>
          <span style={{ animation: 'bounce 0.6s ease 0.2s infinite alternate' }}>🐐</span>
          <span style={{ animation: 'bounce 0.6s ease 0.4s infinite alternate' }}>🐑</span>
        </div>
        <style>{`@keyframes bounce { from{transform:translateY(0)} to{transform:translateY(-12px)} }`}</style>
        <h1 className="text-2xl font-black mb-2">Check your email</h1>
        <p className="text-white/50 text-sm mb-2">We sent a confirmation link to</p>
        <p className="text-green-400 font-mono text-sm mb-6">{email}</p>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-4 text-left space-y-3">
          <div className="text-xs font-medium text-white/30 uppercase tracking-wider">Next steps</div>
          {[
            ['1', 'Open your email inbox'],
            ['2', 'Click the confirmation link from LiveStack'],
            ['3', 'You\'ll be redirected to login'],
            ['4', 'Sign in and start tracking your herd'],
          ].map(([num, step]) => (
            <div key={num} className="flex items-center gap-3 text-sm">
              <div className="w-6 h-6 bg-green-500/20 border border-green-500/30 rounded-full flex items-center justify-center text-green-400 text-xs font-bold flex-shrink-0">
                {num}
              </div>
              <span className="text-white/60">{step}</span>
            </div>
          ))}
        </div>
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-xs text-amber-400 mb-6">
          ⚠ Check your spam folder if you don't see it within 2 minutes
        </div>
        <a href="/login" className="block w-full bg-green-500 hover:bg-green-400 text-black font-bold py-4 rounded-xl text-center transition-colors">
          Go to login
        </a>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6">
      <style>{`
        @keyframes peek { from{transform:translateY(100%)} to{transform:translateY(30%)} }
        @keyframes peekFull { from{transform:translateY(100%)} to{transform:translateY(0%)} }
        @keyframes wobble { 0%,100%{transform:rotate(-5deg)} 50%{transform:rotate(5deg)} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-4px)} 75%{transform:translateX(4px)} }
      `}</style>

      <div className="w-full max-w-sm">

        {/* Logo */}
        <a href="/" className="flex items-center gap-2 justify-center mb-6 hover:opacity-70 transition-opacity">
          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
            <div className="w-3 h-3 bg-black rounded-full animate-pulse" />
          </div>
          <span className="font-bold text-lg">LiveStack</span>
        </a>

        {/* Animal theatre */}
        <div className="relative h-24 mb-2 overflow-hidden rounded-2xl bg-white/5 border border-white/10">
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-white/5 border-t border-white/10 flex items-center px-4 gap-1">
            {Array.from({length: 20}).map((_, i) => (
              <div key={i} className="w-2 h-6 bg-white/10 rounded-sm flex-shrink-0" />
            ))}
          </div>

          {/* Cow — name/farm */}
          <div className="absolute left-6 bottom-0" style={{
            animation: focused === 'name' || focused === 'farm' ? 'peekFull 0.4s ease forwards' : 'peek 0.4s ease forwards',
            transform: 'translateY(100%)'
          }}>
            <div className="text-4xl" style={{
              animation: focused === 'name' || focused === 'farm' ? 'wobble 0.8s ease infinite' : 'none'
            }}>🐄</div>
          </div>

          {/* Goat — email */}
          <div className="absolute left-1/2 -translate-x-1/2 bottom-0" style={{
            animation: focused === 'email' ? 'peekFull 0.4s ease forwards' : 'peek 0.4s ease forwards',
            transform: 'translateY(100%)'
          }}>
            <div className="text-4xl" style={{
              animation: focused === 'email' ? 'float 1s ease infinite' : 'none'
            }}>🐐</div>
          </div>

          {/* Sheep — password/confirm */}
          <div className="absolute right-6 bottom-0" style={{
            animation: focused === 'password' || focused === 'confirm' ? 'peekFull 0.4s ease forwards' : 'peek 0.4s ease forwards',
            transform: 'translateY(100%)'
          }}>
            <div style={{ fontSize: '2.25rem' }}>
              {focused === 'confirm' && passwordsMismatch ? '😟' :
               focused === 'confirm' && passwordsMatch ? '😊' :
               passStrength >= 2 ? '🙈' : '🐑'}
            </div>
          </div>

          {/* Status message */}
          {(focused === 'password' || focused === 'confirm') && password.length > 0 && (
            <div className={`absolute top-2 left-1/2 -translate-x-1/2 text-xs px-3 py-1 rounded-full font-medium whitespace-nowrap ${
              focused === 'confirm' && passwordsMismatch ? 'bg-red-500/20 text-red-400' :
              focused === 'confirm' && passwordsMatch   ? 'bg-green-500/20 text-green-400' :
              passStrength === 1 ? 'bg-red-500/20 text-red-400' :
              passStrength === 2 ? 'bg-amber-500/20 text-amber-400' :
                                   'bg-green-500/20 text-green-400'
            }`}>
              {focused === 'confirm' && passwordsMismatch ? '😟 Passwords don\'t match!' :
               focused === 'confirm' && passwordsMatch   ? '✓ Passwords match!' :
               passStrength === 1 ? '🐑 That password is weak...' :
               passStrength === 2 ? '🙈 Getting stronger!' :
                                    '✓ Strong password!'}
            </div>
          )}

          {!focused && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-white/20 text-xs">The herd is watching...</p>
            </div>
          )}
        </div>

        <h1 className="text-2xl font-black mb-1 text-center mt-4">Join the herd</h1>
        <p className="text-white/40 text-sm text-center mb-6">Register your farm on LiveStack</p>

        <div className="space-y-3">

          <div>
            <label className="text-xs text-white/30 uppercase tracking-wider block mb-2">Your name</label>
            <input
              type="text" value={name} onChange={e => setName(e.target.value)}
              onFocus={() => setFocused('name')} onBlur={() => setFocused('')}
              placeholder="Full name"
              className="w-full bg-white/5 border border-white/10 text-white placeholder-white/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500/50 transition-colors"
            />
          </div>

          <div>
            <label className="text-xs text-white/30 uppercase tracking-wider block mb-2">Farm name</label>
            <input
              type="text" value={farm} onChange={e => setFarm(e.target.value)}
              onFocus={() => setFocused('farm')} onBlur={() => setFocused('')}
              placeholder="e.g. Greenview Farm"
              className="w-full bg-white/5 border border-white/10 text-white placeholder-white/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500/50 transition-colors"
            />
          </div>

          <div>
            <label className="text-xs text-white/30 uppercase tracking-wider block mb-2">Email</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              onFocus={() => setFocused('email')} onBlur={() => setFocused('')}
              placeholder="you@example.com"
              className="w-full bg-white/5 border border-white/10 text-white placeholder-white/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500/50 transition-colors"
            />
          </div>

          <div>
            <label className="text-xs text-white/30 uppercase tracking-wider block mb-2">Password</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={password} onChange={e => setPassword(e.target.value)}
                onFocus={() => setFocused('password')} onBlur={() => setFocused('')}
                placeholder="Min 6 characters"
                className="w-full bg-white/5 border border-white/10 text-white placeholder-white/20 rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:border-green-500/50 transition-colors"
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
            <label className="text-xs text-white/30 uppercase tracking-wider block mb-2">Confirm password</label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                onFocus={() => setFocused('confirm')} onBlur={() => setFocused('')}
                placeholder="Re-enter your password"
                className={`w-full bg-white/5 border text-white placeholder-white/20 rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none transition-colors ${
                  passwordsMismatch ? 'border-red-500/40 focus:border-red-500/60' :
                  passwordsMatch    ? 'border-green-500/40 focus:border-green-500/60' :
                                      'border-white/10 focus:border-green-500/50'
                }`}
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white text-xs">
                {showConfirm ? 'hide' : 'show'}
              </button>
            </div>
            {passwordsMismatch && <p className="text-red-400 text-xs mt-1">Passwords do not match</p>}
            {passwordsMatch    && <p className="text-green-400 text-xs mt-1">✓ Passwords match</p>}
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-sm text-red-400"
              style={{ animation: 'shake 0.3s ease' }}>
              {error}
            </div>
          )}

          <button
            onClick={signup}
            disabled={loading || !email || !password || !confirmPassword || !name || passwordsMismatch}
            className="w-full bg-green-500 hover:bg-green-400 disabled:opacity-30 text-black font-bold py-4 rounded-xl transition-colors"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                Joining the herd...
              </span>
            ) : 'Create account'}
          </button>
        </div>

        <p className="text-center text-white/30 text-sm mt-6">
          Already have an account?{' '}
          <a href="/login" className="text-green-400 hover:text-green-300 transition-colors">Sign in</a>
        </p>
      </div>
    </div>
  )
}