'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema, RegisterInput } from '@/lib/validations'
import { DayflowLogo } from '@/components/dayflow/logo/DayflowLogo'
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function SignUpPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterInput) => {
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const json = await res.json()

      if (!json.success) {
        toast.error(json.error || 'Registration failed')
        setLoading(false)
        return
      }

      toast.success('Account created! Please verify your email.')
      router.push(`/verify-email?email=${encodeURIComponent(data.email)}`)
    } catch {
      toast.error('An error occurred during sign up')
      setLoading(false)
    }
  }

  return (
    <motion.div
      className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 border border-df-border shadow-2xl shadow-purple-500/5"
      initial={{ opacity: 0, scale: 0.96, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="text-center mb-6">
        <div className="flex justify-center mb-3">
          <DayflowLogo size="lg" />
        </div>
        <h1 className="text-2xl font-bold text-charcoal">Create your account</h1>
        <p className="text-xs text-zinc-grey mt-1">Let&apos;s get you started with Dayflow</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
        {/* Employee ID */}
        <div>
          <label className="block text-xs font-semibold text-charcoal mb-1">Employee ID</label>
          <div className="relative">
            <User className="w-4 h-4 text-zinc-grey absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              {...register('employeeId')}
              type="text"
              placeholder="EMP009"
              className="w-full bg-mist-grey/60 text-sm text-charcoal placeholder:text-zinc-grey pl-10 pr-4 py-2.5 rounded-xl border border-df-border focus:outline-none focus:border-royal-purple focus:bg-white transition-all uppercase"
            />
          </div>
          {errors.employeeId && (
            <p className="text-xs text-red-500 mt-1">{errors.employeeId.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-semibold text-charcoal mb-1">Work Email</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-zinc-grey absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              {...register('email')}
              type="email"
              placeholder="you@example.com"
              className="w-full bg-mist-grey/60 text-sm text-charcoal placeholder:text-zinc-grey pl-10 pr-4 py-2.5 rounded-xl border border-df-border focus:outline-none focus:border-royal-purple focus:bg-white transition-all"
            />
          </div>
          {errors.email && (
            <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-semibold text-charcoal mb-1">Password</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-zinc-grey absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
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
          {errors.password && (
            <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-xs font-semibold text-charcoal mb-1">Confirm Password</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-zinc-grey absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              {...register('confirmPassword')}
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className="w-full bg-mist-grey/60 text-sm text-charcoal placeholder:text-zinc-grey pl-10 pr-4 py-2.5 rounded-xl border border-df-border focus:outline-none focus:border-royal-purple focus:bg-white transition-all"
            />
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-red-500 mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-royal-purple text-white font-semibold py-3 px-4 rounded-xl hover:bg-deep-violet transition-all duration-200 shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 text-sm disabled:opacity-50 mt-4"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Creating Account...
            </>
          ) : (
            <>
              Create Account
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="text-center mt-6 text-xs text-zinc-grey">
        Already have an account?{' '}
        <Link href="/sign-in" className="text-royal-purple font-semibold hover:underline">
          Sign in
        </Link>
      </div>
    </motion.div>
  )
}
