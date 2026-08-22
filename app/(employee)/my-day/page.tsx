'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { PageTransition } from '@/components/dayflow/animations/PageTransition'
import { WorkdayTimeline } from '@/components/dayflow/timeline/WorkdayTimeline'
import { StatCard } from '@/components/dayflow/cards/StatCard'
import { StatusChip } from '@/components/dayflow/StatusChip'
import {
  Clock,
  Calendar,
  CheckCircle2,
  LogOut,
  Sparkles,
  TrendingUp,
  Loader2,
  ArrowRight,
  Coffee,
} from 'lucide-react'
import { formatTime, formatWorkingHours, getGreeting } from '@/lib/utils'
import { toast } from 'sonner'
import Link from 'next/link'

export default function MyDayPage() {
  const { data: session } = useSession()
  const [todayRecord, setTodayRecord] = useState<any>(null)
  const [leaveBalance, setLeaveBalance] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  const userName = session?.user?.name || 'Employee'
  const firstName = userName.split(' ')[0]
  const greeting = getGreeting()

  const fetchTodayData = useCallback(async () => {
    try {
      const [attRes, balRes] = await Promise.all([
        fetch('/api/attendance/today'),
        fetch('/api/leave/balance'),
      ])
      const attJson = await attRes.json()
      const balJson = await balRes.json()

      if (attJson.success) setTodayRecord(attJson.data)
      if (balJson.success) setLeaveBalance(balJson.data)
    } catch {
      toast.error('Failed to load workday status')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTodayData()
  }, [fetchTodayData])

  const handleCheckIn = async () => {
    setActionLoading(true)
    try {
      const res = await fetch('/api/attendance/check-in', { method: 'POST' })
      const json = await res.json()
      if (json.success) {
        toast.success(json.message || 'Checked in successfully!')
        setTodayRecord(json.data)
      } else {
        toast.error(json.error || 'Failed to check in')
      }
    } catch {
      toast.error('Check-in failed')
    } finally {
      setActionLoading(false)
    }
  }

  const handleCheckOut = async () => {
    setActionLoading(true)
    try {
      const res = await fetch('/api/attendance/check-out', { method: 'POST' })
      const json = await res.json()
      if (json.success) {
        toast.success(json.message || 'Checked out successfully!')
        setTodayRecord(json.data)
      } else {
        toast.error(json.error || 'Failed to check out')
      }
    } catch {
      toast.error('Check-out failed')
    } finally {
      setActionLoading(false)
    }
  }

  const isCheckedIn = !!todayRecord?.checkIn
  const isCheckedOut = !!todayRecord?.checkOut
  const status = todayRecord?.status || 'NOT_MARKED'

  // Calculate percentage of 8 hour goal completed
  const hoursWorked = todayRecord?.workingHours || 0
  const hoursProgress = Math.min(100, Math.round((hoursWorked / 8) * 100))

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Welcome Header Banner */}
        <div className="bg-gradient-to-r from-royal-purple via-deep-violet to-soft-violet rounded-3xl p-6 lg:p-8 text-white shadow-xl shadow-purple-500/10 relative overflow-hidden">
          {/* Subtle decorative background circles */}
          <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute right-32 -top-12 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium mb-3 border border-white/15">
                <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                <span>
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold tracking-tight mb-2">
                {greeting}, {firstName}!
              </h1>
              <p className="text-purple-100 text-sm max-w-xl leading-relaxed">
                Here&apos;s your workday at a glance. Stay aligned with your schedule, track your hours, and maintain your flow.
              </p>
            </div>

            {/* Check-In / Check-Out Action Button */}
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 flex flex-col items-center justify-center min-w-[200px]">
              <div className="text-xs text-purple-200 font-medium mb-2 uppercase tracking-wider">
                Workday Status
              </div>

              {!isCheckedIn ? (
                <motion.button
                  onClick={handleCheckIn}
                  disabled={actionLoading}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full bg-white text-royal-purple font-bold py-3 px-6 rounded-xl shadow-lg hover:bg-lavender transition-all duration-200 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                >
                  {actionLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      Check In Now
                    </>
                  )}
                </motion.button>
              ) : !isCheckedOut ? (
                <div className="space-y-2 w-full">
                  <div className="text-center text-xs font-mono text-white/90 bg-white/10 py-1 px-3 rounded-lg border border-white/10">
                    In: {formatTime(todayRecord.checkIn)}
                  </div>
                  <motion.button
                    onClick={handleCheckOut}
                    disabled={actionLoading}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 px-4 rounded-xl shadow-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                  >
                    {actionLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <LogOut className="w-4 h-4" />
                        Check Out
                      </>
                    )}
                  </motion.button>
                </div>
              ) : (
                <div className="text-center space-y-1">
                  <div className="inline-flex items-center gap-1 bg-green-500/20 text-green-300 text-xs font-semibold px-2.5 py-1 rounded-full border border-green-400/30">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Workday Completed
                  </div>
                  <div className="text-xs text-purple-200">
                    {formatWorkingHours(hoursWorked)} recorded
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Workday Status"
            value={status === 'NOT_MARKED' ? 'Not Checked In' : status}
            subtitle={isCheckedIn ? `In: ${formatTime(todayRecord.checkIn)}` : 'Expected 09:00 AM'}
            accentColor="#22C55E"
          />

          <StatCard
            title="Hours Worked Today"
            value={hoursWorked ? formatWorkingHours(hoursWorked) : '0h 00m'}
            subtitle={`${hoursProgress}% of 8h goal`}
            accentColor="#6D28D9"
          />

          <StatCard
            title="Paid Leave Available"
            value={leaveBalance ? `${leaveBalance.paidLeave} Days` : '12 Days'}
            subtitle="Remaining in 2025"
            accentColor="#3B82F6"
          />

          <StatCard
            title="Sick Leave Balance"
            value={leaveBalance ? `${leaveBalance.sickLeave} Days` : '8 Days'}
            subtitle="Remaining in 2025"
            accentColor="#F59E0B"
          />
        </div>

        {/* Main Content Grid: Timeline + Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Signature Workday Timeline */}
          <div className="lg:col-span-2 space-y-6">
            <WorkdayTimeline
              checkInTime={todayRecord?.checkIn}
              checkOutTime={todayRecord?.checkOut}
              status={status}
            />

            {/* Quick Actions Card */}
            <div className="bg-white rounded-2xl p-6 border border-df-border shadow-sm">
              <h3 className="font-semibold text-charcoal text-base mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Link
                  href="/time-off"
                  className="group flex flex-col p-4 rounded-xl border border-df-border hover:border-royal-purple/30 bg-cool-grey/50 hover:bg-lavender/40 transition-all duration-200"
                >
                  <div className="w-8 h-8 rounded-lg bg-lavender flex items-center justify-center mb-2 text-royal-purple group-hover:bg-royal-purple group-hover:text-white transition-colors">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <span className="font-semibold text-charcoal text-xs mb-0.5">Apply Leave</span>
                  <span className="text-[11px] text-zinc-grey">Request time off</span>
                </Link>

                <Link
                  href="/attendance"
                  className="group flex flex-col p-4 rounded-xl border border-df-border hover:border-royal-purple/30 bg-cool-grey/50 hover:bg-lavender/40 transition-all duration-200"
                >
                  <div className="w-8 h-8 rounded-lg bg-lavender flex items-center justify-center mb-2 text-royal-purple group-hover:bg-royal-purple group-hover:text-white transition-colors">
                    <Clock className="w-4 h-4" />
                  </div>
                  <span className="font-semibold text-charcoal text-xs mb-0.5">View Attendance</span>
                  <span className="text-[11px] text-zinc-grey">Monthly history</span>
                </Link>

                <Link
                  href="/payroll"
                  className="group flex flex-col p-4 rounded-xl border border-df-border hover:border-royal-purple/30 bg-cool-grey/50 hover:bg-lavender/40 transition-all duration-200"
                >
                  <div className="w-8 h-8 rounded-lg bg-lavender flex items-center justify-center mb-2 text-royal-purple group-hover:bg-royal-purple group-hover:text-white transition-colors">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <span className="font-semibold text-charcoal text-xs mb-0.5">Salary Slips</span>
                  <span className="text-[11px] text-zinc-grey">Download PDF</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Right Col: Progress Arc & Leave Summary */}
          <div className="space-y-6">
            {/* Workday Progress Card */}
            <div className="bg-white rounded-2xl p-6 border border-df-border shadow-sm text-center">
              <h3 className="font-semibold text-charcoal text-base mb-1">Workday Progress</h3>
              <p className="text-xs text-zinc-grey mb-6">Target: 8h 00m</p>

              {/* Progress Ring */}
              <div className="relative w-40 h-40 mx-auto mb-4 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    className="text-df-border stroke-current"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="40"
                    className="text-royal-purple stroke-current"
                    strokeWidth="8"
                    strokeDasharray={251.2}
                    strokeDashoffset={251.2 - (251.2 * hoursProgress) / 100}
                    strokeLinecap="round"
                    fill="transparent"
                    initial={{ strokeDashoffset: 251.2 }}
                    animate={{ strokeDashoffset: 251.2 - (251.2 * hoursProgress) / 100 }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-charcoal">{hoursProgress}%</span>
                  <span className="text-[11px] text-zinc-grey">Completed</span>
                </div>
              </div>

              <div className="text-xs text-zinc-grey bg-mist-grey p-2.5 rounded-xl">
                {isCheckedOut
                  ? 'Great job! You completed today\'s target hours.'
                  : isCheckedIn
                  ? 'Currently working. Don\'t forget to take a break!'
                  : 'Check in to start tracking your workday progress.'}
              </div>
            </div>

            {/* Leave Balances Card */}
            <div className="bg-white rounded-2xl p-6 border border-df-border shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-charcoal text-base">Leave Balances</h3>
                <Link href="/time-off" className="text-xs font-semibold text-royal-purple hover:underline">
                  Apply →
                </Link>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-cool-grey/60">
                  <span className="text-xs font-medium text-charcoal">Paid Leave</span>
                  <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                    {leaveBalance?.paidLeave ?? 12} days left
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-cool-grey/60">
                  <span className="text-xs font-medium text-charcoal">Sick Leave</span>
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                    {leaveBalance?.sickLeave ?? 8} days left
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-cool-grey/60">
                  <span className="text-xs font-medium text-charcoal">Casual Leave</span>
                  <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    {leaveBalance?.casualLeave ?? 6} days left
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
