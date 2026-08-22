'use client'

import { useState, useRef, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { DayflowLogo } from '@/components/dayflow/logo/DayflowLogo'
import { Mail, ArrowRight, Loader2, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

function VerifyEmailForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''

  const [otp, setOtp] = useState<string[]>(Array(6).fill(''))
  const [loading, setLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(60)
  const [resending, setResending] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (resendCooldown > 0) {
      timer = setInterval(() => setResendCooldown((prev) => prev - 1), 1000)
    }
    return () => clearInterval(timer)
  }, [resendCooldown])

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').trim()
    if (/^\d{6}$/.test(pasted)) {
      const digits = pasted.split('')
      setOtp(digits)
      inputRefs.current[5]?.focus()
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    const code = otp.join('')
    if (code.length < 6) {
      toast.error('Please enter all 6 digits of the code')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          otp: code,
          purpose: 'EMAIL_VERIFICATION',
        }),
      })

      const json = await res.json()

      if (!json.success) {
        toast.error(json.error || 'Verification failed')
        setLoading(false)
        return
      }

      toast.success('Email verified successfully! Please sign in.')
      router.push('/sign-in')
    } catch {
      toast.error('An error occurred during verification')
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (resendCooldown > 0 || resending) return
    setResending(true)

    try {
      const res = await fetch('/api/otp/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, purpose: 'EMAIL_VERIFICATION' }),
      })

      const json = await res.json()

      if (json.success) {
        toast.success('A new code has been sent!')
        setResendCooldown(60)
      } else {
        toast.error(json.error || 'Failed to resend code')
      }
    } catch {
      toast.error('Failed to resend code')
    } finally {
      setResending(false)
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
        <div className="w-12 h-12 rounded-2xl bg-lavender flex items-center justify-center mx-auto mb-3 text-royal-purple">
          <Mail className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-charcoal">Verify your email</h1>
        <p className="text-xs text-zinc-grey mt-1">
          We&apos;ve sent a 6-digit verification code to<br />
          <span className="font-semibold text-charcoal">{email || 'your email'}</span>
        </p>
      </div>

      <form onSubmit={handleVerify} className="space-y-6">
        {/* OTP Input Grid */}
        <div className="flex justify-between gap-2" onPaste={handlePaste}>
          {otp.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => { inputRefs.current[idx] = el }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              className="w-12 h-14 bg-mist-grey/70 text-center text-xl font-bold font-mono text-charcoal rounded-xl border border-df-border focus:outline-none focus:border-royal-purple focus:bg-white focus:ring-2 focus:ring-purple-200 transition-all"
            />
          ))}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || otp.join('').length < 6}
          className="w-full bg-royal-purple text-white font-semibold py-3.5 px-4 rounded-xl hover:bg-deep-violet transition-all duration-200 shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Verifying...
            </>
          ) : (
            <>
              Verify Email
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Resend OTP */}
      <div className="text-center mt-6 text-xs text-zinc-grey">
        Didn&apos;t receive the code?{' '}
        <button
          onClick={handleResend}
          disabled={resendCooldown > 0 || resending}
          className="text-royal-purple font-semibold hover:underline disabled:opacity-50 inline-flex items-center gap-1"
        >
          {resending && <RefreshCw className="w-3 h-3 animate-spin" />}
          {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend Code'}
        </button>
      </div>

      <div className="mt-4 p-3 rounded-xl bg-cool-grey border border-df-border text-[11px] text-zinc-grey text-center">
        💡 <span className="font-semibold">Dev Note:</span> In development mode, check your server console log for the 6-digit OTP.
      </div>
    </motion.div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="text-center text-zinc-grey">Loading...</div>}>
      <VerifyEmailForm />
    </Suspense>
  )
}
