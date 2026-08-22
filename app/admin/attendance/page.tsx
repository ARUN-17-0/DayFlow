'use client'

import { useState, useEffect } from 'react'
import { PageTransition } from '@/components/dayflow/animations/PageTransition'
import { PageHeader } from '@/components/dayflow/PageHeader'
import { StatusChip } from '@/components/dayflow/StatusChip'
import { Search, Filter, Download } from 'lucide-react'
import { toast } from 'sonner'
import { formatDate } from '@/lib/utils'

export default function AdminAttendancePage() {
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/attendance?limit=50')
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
        title="Attendance Management"
        description="Monitor daily check-ins, working hours, and department attendance."
        actions={
          <button
            onClick={() => toast.success('Exporting attendance report to CSV...')}
            className="bg-white border border-df-border text-charcoal text-xs font-semibold px-4 py-2.5 rounded-xl hover:bg-mist-grey flex items-center gap-1.5"
          >
            <Download className="w-4 h-4 text-royal-purple" />
            Export CSV
          </button>
        }
      />

      <div className="bg-white rounded-2xl border border-df-border shadow-sm overflow-hidden p-4 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="relative w-64">
            <Search className="w-4 h-4 text-zinc-grey absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search employee..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-mist-grey/60 text-xs text-charcoal placeholder:text-zinc-grey pl-9 pr-4 py-2 rounded-xl border border-df-border"
            />
          </div>

          <div className="text-xs text-zinc-grey">
            Showing <span className="font-semibold text-charcoal">{records.length}</span> records
          </div>
        </div>

        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-mist-grey/60 border-b border-df-border text-zinc-grey uppercase tracking-wider">
              <th className="px-4 py-3 font-semibold">Employee</th>
              <th className="px-4 py-3 font-semibold">Date</th>
              <th className="px-4 py-3 font-semibold">Check In</th>
              <th className="px-4 py-3 font-semibold">Check Out</th>
              <th className="px-4 py-3 font-semibold">Working Hours</th>
              <th className="px-4 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-df-border/60">
            {records.map((r) => (
              <tr key={r.id} className="hover:bg-cool-grey/60">
                <td className="px-4 py-3 font-semibold text-charcoal flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-lavender text-royal-purple font-bold flex items-center justify-center text-[10px]">
                    {r.user?.profile?.firstName?.[0]}
                  </div>
                  <div>
                    <div>{r.user?.profile?.firstName} {r.user?.profile?.lastName}</div>
                    <div className="text-[10px] text-zinc-grey font-mono">{r.user?.employeeId}</div>
                  </div>
                </td>
                <td className="px-4 py-3 text-zinc-grey">{formatDate(r.date)}</td>
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
    </PageTransition>
  )
}
