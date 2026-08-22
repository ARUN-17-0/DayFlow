'use client'

import { useState, useEffect } from 'react'
import { PageTransition } from '@/components/dayflow/animations/PageTransition'
import { PageHeader } from '@/components/dayflow/PageHeader'
import { StatusChip } from '@/components/dayflow/StatusChip'
import { Search, Download, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { formatDate } from '@/lib/utils'

function downloadCSV(filename: string, rows: string[][]) {
  const csv = rows.map((r) => r.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export default function AdminAttendancePage() {
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    setLoading(true)
    fetch('/api/attendance?limit=100')
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data) setRecords(res.data.items || [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = search
    ? records.filter((r) => {
        const name = `${r.user?.profile?.firstName || ''} ${r.user?.profile?.lastName || ''}`.toLowerCase()
        return name.includes(search.toLowerCase()) || (r.user?.employeeId || '').toLowerCase().includes(search.toLowerCase())
      })
    : records

  const handleExport = async () => {
    setExporting(true)
    try {
      const rows = [
        ['Employee ID', 'Name', 'Department', 'Date', 'Check In', 'Check Out', 'Working Hours', 'Status'],
        ...filtered.map((r) => [
          r.user?.employeeId || '',
          `${r.user?.profile?.firstName || ''} ${r.user?.profile?.lastName || ''}`.trim(),
          r.user?.profile?.department?.name || '',
          r.date ? new Date(r.date).toLocaleDateString() : '',
          r.checkIn ? new Date(r.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
          r.checkOut ? new Date(r.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
          r.workingHours ? `${r.workingHours} hrs` : '',
          r.status || '',
        ]),
      ]
      downloadCSV(`attendance-${new Date().toISOString().slice(0, 10)}.csv`, rows)
      toast.success(`Exported ${filtered.length} attendance records`)
    } catch {
      toast.error('Export failed')
    } finally {
      setExporting(false)
    }
  }

  return (
    <PageTransition>
      <PageHeader
        title="Attendance Management"
        description="Monitor daily check-ins, working hours, and department attendance."
        actions={
          <button
            onClick={handleExport}
            disabled={exporting || loading}
            className="bg-white border border-df-border text-charcoal text-xs font-semibold px-4 py-2.5 rounded-xl hover:bg-mist-grey flex items-center gap-1.5 disabled:opacity-60"
          >
            {exporting ? <Loader2 className="w-4 h-4 animate-spin text-royal-purple" /> : <Download className="w-4 h-4 text-royal-purple" />}
            {exporting ? 'Exporting...' : 'Export CSV'}
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
            Showing <span className="font-semibold text-charcoal">{filtered.length}</span> records
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
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-4 py-3"><div className="flex items-center gap-2"><div className="w-7 h-7 rounded-full bg-mist-grey" /><div className="h-3 w-28 bg-mist-grey rounded" /></div></td>
                  <td className="px-4 py-3"><div className="h-3 w-20 bg-mist-grey rounded" /></td>
                  <td className="px-4 py-3"><div className="h-3 w-16 bg-mist-grey rounded" /></td>
                  <td className="px-4 py-3"><div className="h-3 w-16 bg-mist-grey rounded" /></td>
                  <td className="px-4 py-3"><div className="h-3 w-12 bg-mist-grey rounded" /></td>
                  <td className="px-4 py-3"><div className="h-5 w-16 bg-mist-grey rounded-full" /></td>
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-zinc-grey">No records found</td></tr>
            ) : (
              filtered.map((r) => (
                <tr key={r.id} className="hover:bg-cool-grey/60">
                  <td className="px-4 py-3 font-semibold text-charcoal">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-lavender text-royal-purple font-bold flex items-center justify-center text-[10px]">
                        {r.user?.profile?.firstName?.[0]}
                      </div>
                      <div>
                        <div>{r.user?.profile?.firstName} {r.user?.profile?.lastName}</div>
                        <div className="text-[10px] text-zinc-grey font-mono">{r.user?.employeeId}</div>
                      </div>
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
              ))
            )}
          </tbody>
        </table>
      </div>
    </PageTransition>
  )
}
