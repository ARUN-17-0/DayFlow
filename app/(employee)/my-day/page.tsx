'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { PageTransition } from '@/components/dayflow/animations/PageTransition'
import { WorkdayTimeline } from '@/components/dayflow/timeline/WorkdayTimeline'
import { StatCard } from '@/components/dayflow/cards/StatCard'
import {
  Clock,
  Calendar,
  CheckCircle2,
  LogOut,
  Sparkles,
  TrendingUp,
  Loader2,
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

  const hoursWorked = todayRecord?.workingHours || 0
  const hoursProgress = Math.min(100, Math.round((hoursWorked / 8) * 100))

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Welcome Header Banner - Crisp Deep Purple High Contrast Container */}
        <div className="bg-gradient-to-r from-purple-950 via-purple-900 to-indigo-950 rounded-3xl p-6 lg:p-8 text-white shadow-xl border border-purple-800/40 relative overflow-hidden">
          <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute right-32 -top-12 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 bg-purple-900/80 px-3.5 py-1 rounded-full text-xs font-semibold mb-3 border border-purple-700/60 text-purple-200">
                <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                <span>
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight mb-2 text-white">
                {greeting}, {firstName}!
              </h1>
              <p className="text-purple-200 text-xs sm:text-sm max-w-xl leading-relaxed font-medium">
                Here&apos;s your workday at a glance. Stay aligned with your schedule, track your hours, and maintain your flow.
              </p>
            </div>

            {/* Check-In / Check-Out Action Button */}
            <div className="bg-purple-900/60 backdrop-blur-md p-4 rounded-2xl border border-purple-700/60 flex flex-col items-center justify-center min-w-[200px]">
              <div className="text-[11px] text-purple-300 font-bold mb-2 uppercase tracking-wider">
                Workday Status
              </div>

              {!isCheckedIn ? (
                <motion.button
                  onClick={handleCheckIn}
                  disabled={actionLoading}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full bg-white text-purple-950 font-extrabold py-3 px-6 rounded-xl shadow-lg hover:bg-purple-100 transition-all duration-200 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                >
                  {actionLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-purple-950" />
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      Check In Now
                    </>
                  )}
                </motion.button>
              ) : !isCheckedOut ? (
                <div className="space-y-2 w-full">
                  <div className="text-center text-xs font-mono text-white bg-purple-950/80 py-1.5 px-3 rounded-lg border border-purple-700/60 font-bold">
                    In: {formatTime(todayRecord.checkIn)}
                  </div>
                  <motion.button
                    onClick={handleCheckOut}
                    disabled={actionLoading}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-extrabold py-2.5 px-4 rounded-xl shadow-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
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
                  <div className="inline-flex items-center gap-1 bg-green-500/20 text-green-300 text-xs font-bold px-3 py-1 rounded-full border border-green-400/40">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                    Workday Completed
                  </div>
                  <div className="text-xs text-purple-200 font-medium">
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
              <h3 className="font-bold text-slate-900 text-base mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Link
                  href="/time-off"
                  className="group flex flex-col p-4 rounded-xl border border-df-border hover:border-purple-300 bg-slate-50 hover:bg-purple-50/60 transition-all duration-200"
                >
                  <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center mb-2 text-purple-700 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-slate-900 text-xs mb-0.5">Apply Leave</span>
                  <span className="text-[11px] text-slate-500 font-medium">Request time off</span>
                </Link>

                <Link
                  href="/attendance"
                  className="group flex flex-col p-4 rounded-xl border border-df-border hover:border-purple-300 bg-slate-50 hover:bg-purple-50/60 transition-all duration-200"
                >
                  <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center mb-2 text-purple-700 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                    <Clock className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-slate-900 text-xs mb-0.5">View Attendance</span>
                  <span className="text-[11px] text-slate-500 font-medium">Monthly history</span>
                </Link>

                <Link
                  href="/payroll"
                  className="group flex flex-col p-4 rounded-xl border border-df-border hover:border-purple-300 bg-slate-50 hover:bg-purple-50/60 transition-all duration-200"
                >
                  <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center mb-2 text-purple-700 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-slate-900 text-xs mb-0.5">Salary Slips</span>
                  <span className="text-[11px] text-slate-500 font-medium">Download PDF</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Right Col: Progress Arc & Leave Summary */}
          <div className="space-y-6">
            {/* Workday Progress Card */}
            <div className="bg-white rounded-2xl p-6 border border-df-border shadow-sm text-center">
              <h3 className="font-bold text-slate-900 text-base mb-1">Workday Progress</h3>
              <p className="text-xs text-slate-500 font-medium mb-6">Target: 8h 00m</p>

              {/* Progress Ring */}
              <div className="relative w-40 h-40 mx-auto mb-4 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    className="text-slate-200 stroke-current"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="40"
                    className="text-purple-600 stroke-current"
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
                  <span className="text-2xl font-extrabold text-slate-900">{hoursProgress}%</span>
                  <span className="text-[11px] text-slate-500 font-medium">Completed</span>
                </div>
              </div>

              <div className="text-xs text-slate-600 font-medium bg-slate-100 p-2.5 rounded-xl border border-slate-200">
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
                <h3 className="font-bold text-slate-900 text-base">Leave Balances</h3>
                <Link href="/time-off" className="text-xs font-bold text-purple-700 hover:underline">
                  Apply →
                </Link>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-xs font-bold text-slate-900">Paid Leave</span>
                  <span className="text-xs font-bold text-green-700 bg-green-100 px-2.5 py-1 rounded-full border border-green-300">
                    {leaveBalance?.paidLeave ?? 12} days left
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-xs font-bold text-slate-900">Sick Leave</span>
                  <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2.5 py-1 rounded-full border border-blue-300">
                    {leaveBalance?.sickLeave ?? 8} days left
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-xs font-bold text-slate-900">Casual Leave</span>
                  <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full border border-amber-300">
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
