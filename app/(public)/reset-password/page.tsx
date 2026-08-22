'use client'

import { useState, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { DayflowLogo } from '@/components/dayflow/logo/DayflowLogo'
import { Lock, Eye, EyeOff, ArrowRight, Loader2, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const emailParam = searchParams.get('email') || ''

  const [email, setEmail] = useState(emailParam)
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''))
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return
    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)
    if (value && index < 5) inputRefs.current[index + 1]?.focus()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const code = otp.join('')

    if (code.length < 6) {
      toast.error('Please enter the 6-digit reset code')
      return
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          otp: code,
          password,
          confirmPassword,
        }),
      })

      const json = await res.json()

      if (!json.success) {
        toast.error(json.error || 'Failed to reset password')
        setLoading(false)
        return
      }

      toast.success('Password reset successfully! Please sign in with your new password.')
      router.push('/sign-in')
    } catch {
      toast.error('An error occurred during password reset')
      setLoading(false)
    }
  }

  return (
    <motion.div
      className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 border border-df-border shadow-2xl shadow-purple-500/5"
      initial={{ opacity: 0, scale: 0.96, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="text-center mb-6">
        <div className="flex justify-center mb-3">
          <DayflowLogo size="lg" />
        </div>
        <h1 className="text-2xl font-bold text-charcoal">Set new password</h1>
        <p className="text-xs text-zinc-grey mt-1">
          Enter the 6-digit code sent to your email and your new password.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div>
          <label className="block text-xs font-semibold text-charcoal mb-1">Work Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full bg-mist-grey/60 text-sm text-charcoal placeholder:text-zinc-grey px-4 py-2.5 rounded-xl border border-df-border focus:outline-none focus:border-royal-purple focus:bg-white transition-all"
          />
        </div>

        {/* OTP Grid */}
        <div>
          <label className="block text-xs font-semibold text-charcoal mb-1.5">6-Digit Reset Code</label>
          <div className="flex justify-between gap-1.5">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => { inputRefs.current[idx] = el }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(idx, e.target.value)}
                className="w-11 h-12 bg-mist-grey/70 text-center text-lg font-bold font-mono text-charcoal rounded-xl border border-df-border focus:outline-none focus:border-royal-purple focus:bg-white transition-all"
              />
            ))}
          </div>
        </div>

        {/* New Password */}
        <div>
          <label className="block text-xs font-semibold text-charcoal mb-1">New Password</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-zinc-grey absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-mist-grey/60 text-sm text-charcoal placeholder:text-zinc-grey pl-10 pr-10 py-2.5 rounded-xl border border-df-border focus:outline-none focus:border-royal-purple focus:bg-white transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-grey hover:text-charcoal"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-xs font-semibold text-charcoal mb-1">Confirm New Password</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-zinc-grey absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-mist-grey/60 text-sm text-charcoal placeholder:text-zinc-grey pl-10 pr-4 py-2.5 rounded-xl border border-df-border focus:outline-none focus:border-royal-purple focus:bg-white transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || otp.join('').length < 6 || !password}
          className="w-full bg-royal-purple text-white font-semibold py-3.5 px-4 rounded-xl hover:bg-deep-violet transition-all duration-200 shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 text-sm disabled:opacity-50 mt-4"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Resetting Password...
            </>
          ) : (
            <>
              Reset Password
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="text-center mt-6">
        <Link
          href="/sign-in"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-grey hover:text-charcoal transition-colors font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to sign in
        </Link>
      </div>
    </motion.div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="text-center text-zinc-grey">Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  )
}
