'use client'

import { useState, useEffect } from 'react'
import { PageTransition } from '@/components/dayflow/animations/PageTransition'
import { PageHeader } from '@/components/dayflow/PageHeader'
import { StatCard } from '@/components/dayflow/cards/StatCard'
import { StatusChip } from '@/components/dayflow/StatusChip'
import { Users, Clock, Calendar, AlertCircle, ArrowRight } from 'lucide-react'
import Link from 'next/link'

import { DEMO_LEAVE_REQUESTS } from '@/lib/demoData'

export default function AdminDashboardPage() {
  const [stats] = useState({
    totalEmployees: 8,
    presentToday: 7,
    onLeave: 1,
    pendingRequests: 2,
  })
  const [pendingLeaves, setPendingLeaves] = useState<any[]>(DEMO_LEAVE_REQUESTS)

  useEffect(() => {
    fetch('/api/leave?status=PENDING&limit=5')
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data?.items?.length > 0) {
          setPendingLeaves(res.data.items)
        }
      })
      .catch(() => {})
  }, [])

  return (
    <PageTransition>
      <PageHeader
        title="HR & Admin Dashboard"
        description="Overview of organization workforce, attendance, and pending requests."
      />

      <div className="space-y-6">
        {/* Top 4 Stat Cards (Matching wireframe screen 09) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Employees"
            value={stats.totalEmployees}
            change={{ value: '+12', isPositive: true, label: 'from last month' }}
            icon={Users}
            accentColor="#6D28D9"
          />
          <StatCard
            title="Present Today"
            value={stats.presentToday}
            change={{ value: '+8', isPositive: true, label: 'from yesterday' }}
            icon={Clock}
            accentColor="#22C55E"
          />
          <StatCard
            title="On Leave"
            value={stats.onLeave}
            change={{ value: '+3', isPositive: false, label: 'from yesterday' }}
            icon={Calendar}
            accentColor="#3B82F6"
          />
          <StatCard
            title="Pending Requests"
            value={stats.pendingRequests}
            change={{ value: '+3', isPositive: false, label: 'from yesterday' }}
            icon={AlertCircle}
            accentColor="#F59E0B"
          />
        </div>

        {/* Dashboard Main Grid: Attendance Overview + Pending Leaves */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Attendance Overview Chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-df-border shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-semibold text-charcoal text-base">Attendance Overview (This Week)</h3>
                <p className="text-xs text-zinc-grey">Daily present count trend</p>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-200">
                Avg 92.5% Attendance
              </div>
            </div>

            {/* Visual Attendance Bar Chart Mock */}
            <div className="h-64 flex items-end justify-between gap-4 pt-8 pb-2 px-4 bg-cool-grey/50 rounded-xl border border-df-border/60">
              {[
                { day: 'Mon', count: 220, pct: '88%' },
                { day: 'Tue', count: 235, pct: '94%' },
                { day: 'Wed', count: 242, pct: '97%' },
                { day: 'Thu', count: 228, pct: '91%' },
                { day: 'Fri', count: 217, pct: '87%' },
                { day: 'Sat', count: 45, pct: '18%' },
                { day: 'Sun', count: 0, pct: '0%' },
              ].map((item) => (
                <div key={item.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <span className="text-[10px] font-mono font-bold text-royal-purple">{item.count}</span>
                  <div
                    className="w-full max-w-[36px] bg-gradient-to-t from-royal-purple to-soft-violet rounded-t-lg transition-all hover:opacity-90"
                    style={{ height: item.pct }}
                  />
                  <span className="text-xs font-semibold text-zinc-grey">{item.day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Col: Pending Leave Requests (Matching wireframe screen 09) */}
          <div className="bg-white rounded-2xl p-6 border border-df-border shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-charcoal text-base">Pending Leave Requests</h3>
                <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  {pendingLeaves.length} pending
                </span>
              </div>

              <div className="space-y-3">
                {pendingLeaves.length === 0 ? (
                  <div className="text-center py-8 text-xs text-zinc-grey">No pending requests</div>
                ) : (
                  pendingLeaves.map((req) => (
                    <div
                      key={req.id}
                      className="p-3.5 rounded-xl bg-cool-grey/60 border border-df-border/60 flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="font-semibold text-charcoal text-xs">
                          {req.user?.profile?.firstName} {req.user?.profile?.lastName}
                        </div>
                        <div className="text-[11px] text-zinc-grey">
                          {req.leaveType} • {req.totalDays} day(s)
                        </div>
                      </div>

                      <Link
                        href="/admin/time-off"
                        className="bg-royal-purple text-white text-[11px] font-semibold px-3 py-1.5 rounded-lg hover:bg-deep-violet transition-colors"
                      >
                        Review
                      </Link>
                    </div>
                  ))
                )}
              </div>
            </div>

            <Link
              href="/admin/time-off"
              className="inline-flex items-center justify-center gap-1 text-xs font-semibold text-royal-purple hover:underline mt-6"
            >
              View all requests <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
