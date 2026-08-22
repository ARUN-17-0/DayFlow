'use client'

import { useState, useEffect } from 'react'
import { PageTransition } from '@/components/dayflow/animations/PageTransition'
import { PageHeader } from '@/components/dayflow/PageHeader'
import { StatusChip } from '@/components/dayflow/StatusChip'
import { Calendar, ChevronLeft, ChevronRight, Clock } from 'lucide-react'

export default function AttendancePage() {
  const [view, setView] = useState<'weekly' | 'monthly'>('weekly')
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/attendance?limit=30')
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data) {
          setRecords(res.data.items || [])
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <PageTransition>
      <PageHeader
        title="My Attendance"
        description="View your daily check-in, check-out, and working hours history."
        actions={
          <div className="flex bg-mist-grey p-1 rounded-xl border border-df-border">
            <button
              onClick={() => setView('weekly')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                view === 'weekly' ? 'bg-white text-royal-purple shadow-sm' : 'text-zinc-grey'
              }`}
            >
              Weekly View
            </button>
            <button
              onClick={() => setView('monthly')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                view === 'monthly' ? 'bg-white text-royal-purple shadow-sm' : 'text-zinc-grey'
              }`}
            >
              Monthly View
            </button>
          </div>
        }
      />

      <div className="bg-white rounded-2xl border border-df-border shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-df-border">
          <div className="flex items-center gap-2 text-sm font-bold text-charcoal">
            <Calendar className="w-4 h-4 text-royal-purple" />
            <span>August 2026 History</span>
          </div>
          <div className="flex items-center gap-1">
            <button className="p-1.5 rounded-lg border border-df-border hover:bg-mist-grey text-zinc-grey">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="p-1.5 rounded-lg border border-df-border hover:bg-mist-grey text-zinc-grey">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-mist-grey/60 border-b border-df-border text-zinc-grey uppercase tracking-wider">
                <th className="px-4 py-3 font-semibold">Day / Date</th>
                <th className="px-4 py-3 font-semibold">Check In</th>
                <th className="px-4 py-3 font-semibold">Check Out</th>
                <th className="px-4 py-3 font-semibold">Working Hours</th>
                <th className="px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-df-border/60">
              {records.map((r) => (
                <tr key={r.id} className="hover:bg-cool-grey/60">
                  <td className="px-4 py-3 font-medium text-charcoal">
                    {new Date(r.date).toLocaleDateString('en-IN', {
                      weekday: 'short',
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-4 py-3 text-zinc-grey">
                    {r.checkIn ? new Date(r.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                  </td>
                  <td className="px-4 py-3 text-zinc-grey">
                    {r.checkOut ? new Date(r.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                  </td>
                  <td className="px-4 py-3 font-mono font-medium text-charcoal">
                    {r.workingHours ? `${r.workingHours} hrs` : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <StatusChip status={r.status} size="sm" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PageTransition>
  )
}
