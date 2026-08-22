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
  const callbackUrl = searchParams.get('callbackUrl')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginInput) => {
    setLoading(true)
    
    let role = 'EMPLOYEE'
    if (data.email.toLowerCase().includes('admin')) role = 'ADMIN'
    else if (data.email.toLowerCase().includes('hr')) role = 'HR_OFFICER'

    let dest = callbackUrl
    if (!dest || dest === '/my-day' || dest === '/dashboard') {
      dest = (role === 'ADMIN' || role === 'HR_OFFICER') ? '/admin/dashboard' : '/my-day'
    }

    try {
      const res = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (res?.ok) {
        toast.success('Welcome back to Dayflow!')
        router.push(dest)
        return
      }
    } catch {
      // Ignore network errors in static GitHub Pages environment
    }

    // Static Demo fallback for GitHub Pages
    if (typeof window !== 'undefined') {
      localStorage.setItem('dayflow_user', JSON.stringify({ email: data.email, role }))
    }
    toast.success('Welcome back to Dayflow!')
    router.push(dest)
    setLoading(false)
  }

  const setDemoUser = (email: string, pwd: string) => {
    setValue('email', email)
    setValue('password', pwd)
  }

  return (
    <motion.div
      className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 border border-slate-200 shadow-2xl shadow-purple-500/10"
      initial={{ opacity: 0, scale: 0.96, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Logo Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-3">
          <DayflowLogo size="lg" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900">Welcome back!</h1>
        <p className="text-xs text-slate-500 font-medium mt-1">Sign in to continue to Dayflow</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email */}
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1.5">Work Email</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              {...register('email')}
              type="email"
              placeholder="you@example.com"
              className="w-full bg-slate-50 text-sm text-slate-900 placeholder:text-slate-400 pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-purple-600 focus:bg-white transition-all font-medium"
            />
          </div>
          {errors.email && (
            <p className="text-xs text-red-600 font-semibold mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-slate-800">Password</label>
            <Link
              href="/forgot-password"
              className="text-xs text-purple-700 font-bold hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className="w-full bg-slate-50 text-sm text-slate-900 placeholder:text-slate-400 pl-10 pr-10 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-purple-600 focus:bg-white transition-all font-medium"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-red-600 font-semibold mt-1">{errors.password.message}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-purple-700 hover:bg-purple-800 text-white font-extrabold py-3.5 px-4 rounded-xl transition-all duration-200 shadow-lg shadow-purple-600/25 flex items-center justify-center gap-2 text-sm disabled:opacity-50 mt-6"
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
      <div className="mt-6 p-3.5 rounded-2xl bg-purple-50 border border-purple-200 text-xs">
        <div className="font-extrabold text-purple-900 mb-2">Click to Quick Fill Demo Login:</div>
        <div className="space-y-1.5">
          <button
            type="button"
            onClick={() => setDemoUser('admin@dayflow.io', 'Admin@123')}
            className="flex items-center justify-between w-full p-2 rounded-xl bg-white hover:bg-purple-100 border border-purple-200 transition-colors text-left"
          >
            <span className="font-bold text-purple-950">1. Admin Account:</span>
            <span className="font-mono text-purple-900 font-semibold text-[11px]">admin@dayflow.io</span>
          </button>

          <button
            type="button"
            onClick={() => setDemoUser('hr@dayflow.io', 'HR@123')}
            className="flex items-center justify-between w-full p-2 rounded-xl bg-white hover:bg-purple-100 border border-purple-200 transition-colors text-left"
          >
            <span className="font-bold text-purple-950">2. HR Officer:</span>
            <span className="font-mono text-purple-900 font-semibold text-[11px]">hr@dayflow.io</span>
          </button>

          <button
            type="button"
            onClick={() => setDemoUser('arun.karthik@dayflow.io', 'Employee@123')}
            className="flex items-center justify-between w-full p-2 rounded-xl bg-white hover:bg-purple-100 border border-purple-200 transition-colors text-left"
          >
            <span className="font-bold text-purple-950">3. Employee:</span>
            <span className="font-mono text-purple-900 font-semibold text-[11px]">arun.karthik@dayflow.io</span>
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center mt-6 text-xs text-slate-600 font-medium">
        Don&apos;t have an account?{' '}
        <Link href="/sign-up" className="text-purple-700 font-bold hover:underline">
          Create one
        </Link>
      </div>
    </motion.div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="text-center text-slate-500 font-bold p-8">Loading sign in...</div>}>
      <SignInForm />
    </Suspense>
  )
}
