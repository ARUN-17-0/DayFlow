'use client'

import { useState, useEffect } from 'react'
import { PageTransition } from '@/components/dayflow/animations/PageTransition'
import { PageHeader } from '@/components/dayflow/PageHeader'
import { StatCard } from '@/components/dayflow/cards/StatCard'
import { StatusChip } from '@/components/dayflow/StatusChip'
import { Clock, Calendar, IndianRupee, FileText, CheckCircle2, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function EmployeeDashboardPage() {
  const [stats, setStats] = useState<any>(null)
  const [recentAttendance, setRecentAttendance] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/attendance?limit=5')
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data) {
          setRecentAttendance(res.data.items || [])
        }
      })
      .catch(() => {})
  }, [])

  return (
    <PageTransition>
      <PageHeader
        title="Employee Dashboard"
        description="Overview of your attendance, leaves, and activity."
      />

      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Present Days (This Month)"
            value="18 Days"
            subtitle="Target: 22 Working Days"
            icon={CheckCircle2}
            accentColor="#22C55E"
          />
          <StatCard
            title="Total Working Hours"
            value="142.5 hrs"
            subtitle="Avg 7.9 hrs/day"
            icon={Clock}
            accentColor="#6D28D9"
          />
          <StatCard
            title="Leave Balance"
            value="26 Days"
            subtitle="Paid + Sick + Casual"
            icon={Calendar}
            accentColor="#3B82F6"
          />
          <StatCard
            title="Latest Net Salary"
            value="₹63,000"
            subtitle="Paid for July 2025"
            icon={IndianRupee}
            accentColor="#F59E0B"
          />
        </div>

        {/* Attendance Recent Activity Table */}
        <div className="bg-white rounded-2xl p-6 border border-df-border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-charcoal text-base">Recent Attendance Activity</h3>
              <p className="text-xs text-zinc-grey">Your latest check-ins and check-outs</p>
            </div>
            <Link href="/attendance" className="text-xs font-semibold text-royal-purple hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-mist-grey/60 border-b border-df-border text-zinc-grey uppercase tracking-wider">
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Check In</th>
                  <th className="px-4 py-3 font-semibold">Check Out</th>
                  <th className="px-4 py-3 font-semibold">Working Hours</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-df-border/60">
                {recentAttendance.map((row) => (
                  <tr key={row.id} className="hover:bg-cool-grey/60">
                    <td className="px-4 py-3 font-medium text-charcoal">
                      {new Date(row.date).toLocaleDateString('en-IN', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-3 text-zinc-grey">
                      {row.checkIn ? new Date(row.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                    </td>
                    <td className="px-4 py-3 text-zinc-grey">
                      {row.checkOut ? new Date(row.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                    </td>
                    <td className="px-4 py-3 font-mono font-medium text-charcoal">
                      {row.workingHours ? `${row.workingHours}h` : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <StatusChip status={row.status} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
