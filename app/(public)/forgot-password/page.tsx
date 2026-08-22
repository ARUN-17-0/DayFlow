'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { DayflowLogo } from '@/components/dayflow/logo/DayflowLogo'
import { Mail, ArrowRight, Loader2, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setLoading(true)
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const json = await res.json()

      if (json.success) {
        setSubmitted(true)
        toast.success('Password reset instructions sent!')
      } else {
        toast.error(json.error || 'Failed to process request')
      }
    } catch {
      toast.error('An error occurred. Please try again.')
    } finally {
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
        <h1 className="text-2xl font-bold text-charcoal">Forgot password?</h1>
        <p className="text-xs text-zinc-grey mt-1">
          Enter your work email address and we&apos;ll send you a 6-digit code to reset your password.
        </p>
      </div>

      {!submitted ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">Work Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-grey absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-mist-grey/60 text-sm text-charcoal placeholder:text-zinc-grey pl-10 pr-4 py-3 rounded-xl border border-df-border focus:outline-none focus:border-royal-purple focus:bg-white transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !email}
            className="w-full bg-royal-purple text-white font-semibold py-3.5 px-4 rounded-xl hover:bg-deep-violet transition-all duration-200 shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 text-sm disabled:opacity-50 mt-4"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Sending Code...
              </>
            ) : (
              <>
                Send Reset Code
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      ) : (
        <div className="text-center space-y-4">
          <div className="p-4 rounded-2xl bg-lavender border border-purple-200 text-xs text-charcoal leading-relaxed">
            If an account exists for <span className="font-semibold">{email}</span>, a 6-digit reset code has been sent.
          </div>

          <Link
            href={`/reset-password?email=${encodeURIComponent(email)}`}
            className="w-full bg-royal-purple text-white font-semibold py-3.5 px-4 rounded-xl hover:bg-deep-violet transition-all inline-flex items-center justify-center gap-2 text-sm"
          >
            Enter Reset Code
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

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
