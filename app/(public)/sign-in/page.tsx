'use client'

import { useState, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, LoginInput } from '@/lib/validations'
import { DayflowLogo } from '@/components/dayflow/logo/DayflowLogo'
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

function SignInForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/my-day'
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginInput) => {
    setLoading(true)
    try {
      const res = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (res?.error) {
        toast.error(res.error || 'Invalid email or password')
        setLoading(false)
        return
      }

      toast.success('Welcome back to Dayflow!')
      router.push(callbackUrl)
      router.refresh()
    } catch {
      toast.error('An error occurred during sign in')
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
      {/* Logo Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-3">
          <DayflowLogo size="lg" />
        </div>
        <h1 className="text-2xl font-bold text-charcoal">Welcome back!</h1>
        <p className="text-xs text-zinc-grey mt-1">Sign in to continue to Dayflow</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email */}
        <div>
          <label className="block text-xs font-semibold text-charcoal mb-1.5">Work Email</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-zinc-grey absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              {...register('email')}
              type="email"
              placeholder="you@example.com"
              className="w-full bg-mist-grey/60 text-sm text-charcoal placeholder:text-zinc-grey pl-10 pr-4 py-3 rounded-xl border border-df-border focus:outline-none focus:border-royal-purple focus:bg-white transition-all"
            />
          </div>
          {errors.email && (
            <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-charcoal">Password</label>
            <Link
              href="/forgot-password"
              className="text-xs text-royal-purple font-medium hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-zinc-grey absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className="w-full bg-mist-grey/60 text-sm text-charcoal placeholder:text-zinc-grey pl-10 pr-10 py-3 rounded-xl border border-df-border focus:outline-none focus:border-royal-purple focus:bg-white transition-all"
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

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-royal-purple text-white font-semibold py-3.5 px-4 rounded-xl hover:bg-deep-violet transition-all duration-200 shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 text-sm disabled:opacity-50 mt-6"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Signing in...
            </>
          ) : (
            <>
              Sign In
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Demo Credentials Box */}
      <div className="mt-6 p-3 rounded-xl bg-lavender/60 border border-purple-200 text-xs text-zinc-grey">
        <div className="font-semibold text-royal-purple mb-1">Quick Demo Logins:</div>
        <div className="flex justify-between items-center py-0.5">
          <span>Admin:</span>
          <span className="font-mono text-charcoal">admin@dayflow.io / Admin@123</span>
        </div>
        <div className="flex justify-between items-center py-0.5">
          <span>Employee:</span>
          <span className="font-mono text-charcoal">arun.karthik@dayflow.io / Employee@123</span>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center mt-6 text-xs text-zinc-grey">
        Don&apos;t have an account?{' '}
        <Link href="/sign-up" className="text-royal-purple font-semibold hover:underline">
          Create one
        </Link>
      </div>
    </motion.div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="text-center text-zinc-grey">Loading sign in...</div>}>
      <SignInForm />
    </Suspense>
  )
}
