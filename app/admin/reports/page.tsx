'use client'

import { useState, useEffect } from 'react'
import { PageTransition } from '@/components/dayflow/animations/PageTransition'
import { PageHeader } from '@/components/dayflow/PageHeader'
import { BarChart3, Download, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

// ─── CSV Helper ──────────────────────────────────────────────────────────────
function downloadCSV(filename: string, rows: string[][]) {
  const csv = rows.map((r) => r.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export default function AdminReportsPage() {
  const [activeTab, setActiveTab] = useState<'attendance' | 'leave' | 'payroll'>('attendance')
  const [exporting, setExporting] = useState(false)

  // Live data state
  const [attendanceData, setAttendanceData] = useState<any>(null)
  const [leaveData, setLeaveData] = useState<any>(null)
  const [payrollData, setPayrollData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      fetch('/api/reports/attendance').then((r) => r.json()),
      fetch('/api/reports/leave').then((r) => r.json()),
      fetch('/api/reports/payroll').then((r) => r.json()),
    ])
      .then(([att, lv, pay]) => {
        if (att.success) setAttendanceData(att.data)
        if (lv.success) setLeaveData(lv.data)
        if (pay.success) setPayrollData(pay.data)
      })
      .catch(() => toast.error('Failed to load report data'))
      .finally(() => setLoading(false))
  }, [])

  const handleExport = async () => {
    setExporting(true)
    try {
      if (activeTab === 'attendance') {
        const res = await fetch('/api/attendance?limit=200')
        const json = await res.json()
        const records = json.data?.items || []
        const rows = [
          ['Employee ID', 'Name', 'Date', 'Check In', 'Check Out', 'Working Hours', 'Status'],
          ...records.map((r: any) => [
            r.user?.employeeId || '',
            `${r.user?.profile?.firstName || ''} ${r.user?.profile?.lastName || ''}`.trim(),
            r.date ? new Date(r.date).toLocaleDateString() : '',
            r.checkIn ? new Date(r.checkIn).toLocaleTimeString() : '',
            r.checkOut ? new Date(r.checkOut).toLocaleTimeString() : '',
            r.workingHours ? `${r.workingHours} hrs` : '',
            r.status || '',
          ]),
        ]
        downloadCSV(`attendance-report-${new Date().toISOString().slice(0, 10)}.csv`, rows)
        toast.success(`Exported ${records.length} attendance records`)
      }

      if (activeTab === 'leave') {
        const res = await fetch('/api/leave?limit=200')
        const json = await res.json()
        const records = json.data?.items || []
        const rows = [
          ['Employee ID', 'Name', 'Leave Type', 'Start Date', 'End Date', 'Total Days', 'Status', 'Reason'],
          ...records.map((r: any) => [
            r.user?.employeeId || '',
            `${r.user?.profile?.firstName || ''} ${r.user?.profile?.lastName || ''}`.trim(),
            r.leaveType || '',
            r.startDate ? new Date(r.startDate).toLocaleDateString() : '',
            r.endDate ? new Date(r.endDate).toLocaleDateString() : '',
            r.totalDays || '',
            r.status || '',
            r.reason || '',
          ]),
        ]
        downloadCSV(`leave-report-${new Date().toISOString().slice(0, 10)}.csv`, rows)
        toast.success(`Exported ${records.length} leave records`)
      }

      if (activeTab === 'payroll') {
        const res = await fetch('/api/payroll?limit=200')
        const json = await res.json()
        const records = json.data?.items || []
        const rows = [
          ['Employee ID', 'Name', 'Department', 'Month', 'Year', 'Basic Salary', 'HRA', 'Allowances', 'PF', 'Deductions', 'Gross Salary', 'Net Salary', 'Status'],
          ...records.map((r: any) => [
            r.user?.employeeId || '',
            `${r.user?.profile?.firstName || ''} ${r.user?.profile?.lastName || ''}`.trim(),
            r.user?.profile?.department?.name || '',
            r.month || '',
            r.year || '',
            r.basicSalary || 0,
            r.hra || 0,
            r.allowances || 0,
            r.pf || 0,
            r.deductions || 0,
            r.grossSalary || 0,
            r.netSalary || 0,
            r.status || '',
          ]),
        ]
        downloadCSV(`payroll-report-${new Date().toISOString().slice(0, 10)}.csv`, rows)
        toast.success(`Exported ${records.length} payroll records`)
      }
    } catch {
      toast.error('Export failed. Please try again.')
    } finally {
      setExporting(false)
    }
  }

  return (
    <PageTransition>
      <PageHeader
        title="Reports & Analytics"
        description="Comprehensive reports on attendance, leave trends, and organization payroll."
        actions={
          <button
            onClick={handleExport}
            disabled={exporting || loading}
            className="bg-royal-purple text-white text-xs font-semibold px-4 py-2.5 rounded-xl hover:bg-deep-violet flex items-center gap-1.5 shadow-md shadow-purple-500/20 disabled:opacity-60"
          >
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {exporting ? 'Exporting...' : 'Export CSV'}
          </button>
        }
      />

      {/* Tabs */}
      <div className="flex border-b border-df-border mb-6">
        {[
          { key: 'attendance', label: 'Attendance Report' },
          { key: 'leave', label: 'Leave Analytics' },
          { key: 'payroll', label: 'Payroll Expenditure' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-5 py-3 text-xs font-semibold border-b-2 transition-all ${
              activeTab === tab.key
                ? 'border-royal-purple text-royal-purple'
                : 'border-transparent text-zinc-grey hover:text-charcoal'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl p-12 border border-df-border shadow-sm flex items-center justify-center gap-3 text-zinc-grey text-xs">
          <Loader2 className="w-5 h-5 animate-spin text-royal-purple" />
          Loading report data...
        </div>
      ) : (
        <>
          {/* ── Attendance ── */}
          {activeTab === 'attendance' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Total Records', value: attendanceData?.totalRecords ?? 0, color: 'text-charcoal' },
                  { label: 'Present', value: attendanceData?.present ?? 0, color: 'text-emerald-600' },
                  { label: 'Absent', value: attendanceData?.absent ?? 0, color: 'text-rose-500' },
                  { label: 'On Leave', value: attendanceData?.onLeave ?? 0, color: 'text-blue-500' },
                ].map((s) => (
                  <div key={s.label} className="bg-white rounded-2xl p-5 border border-df-border shadow-sm">
                    <div className="text-[11px] font-semibold text-zinc-grey uppercase tracking-wider mb-1">{s.label}</div>
                    <div className={`text-2xl font-extrabold ${s.color}`}>{s.value}</div>
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-2xl p-6 border border-df-border shadow-sm">
                <h3 className="font-semibold text-charcoal text-sm mb-4">Attendance Status Breakdown</h3>
                {Object.entries(attendanceData?.summary || {}).map(([status, count]: any) => {
                  const pct = attendanceData?.totalRecords > 0 ? Math.round((count / attendanceData.totalRecords) * 100) : 0
                  return (
                    <div key={status} className="space-y-1 mb-3">
                      <div className="flex justify-between text-xs font-semibold text-charcoal">
                        <span>{status.replace('_', ' ')}</span>
                        <span className="font-mono text-royal-purple">{count} ({pct}%)</span>
                      </div>
                      <div className="h-2.5 w-full bg-mist-grey rounded-full overflow-hidden">
                        <div className="h-full bg-royal-purple rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ── Leave ── */}
          {activeTab === 'leave' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Approved', value: leaveData?.approved ?? 0, color: 'bg-emerald-50 border-emerald-200 text-emerald-800' },
                  { label: 'Pending', value: leaveData?.pending ?? 0, color: 'bg-amber-50 border-amber-200 text-amber-800' },
                  { label: 'Rejected', value: leaveData?.rejected ?? 0, color: 'bg-rose-50 border-rose-200 text-rose-800' },
                ].map((s) => (
                  <div key={s.label} className={`p-5 rounded-2xl border ${s.color}`}>
                    <div className="text-xs font-semibold mb-1">{s.label} Requests</div>
                    <div className="text-2xl font-extrabold">{s.value}</div>
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-2xl p-6 border border-df-border shadow-sm">
                <h3 className="font-semibold text-charcoal text-sm mb-4">Leave by Type</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Object.entries(leaveData?.typeSummary || {}).map(([type, count]: any) => (
                    <div key={type} className="p-4 bg-lavender/40 rounded-xl border border-purple-100">
                      <div className="text-[11px] font-semibold text-zinc-grey">{type} Leave</div>
                      <div className="text-xl font-extrabold text-royal-purple mt-1">{count}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Payroll ── */}
          {activeTab === 'payroll' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: 'Total Payout', value: `₹${(payrollData?.totalPayout || 0).toLocaleString('en-IN')}`, color: 'text-royal-purple' },
                  { label: 'Avg. Salary', value: `₹${Math.round(payrollData?.averageSalary || 0).toLocaleString('en-IN')}`, color: 'text-emerald-600' },
                  { label: 'Records', value: payrollData?.recordCount ?? 0, color: 'text-charcoal' },
                ].map((s) => (
                  <div key={s.label} className="bg-white rounded-2xl p-5 border border-df-border shadow-sm">
                    <div className="text-[11px] font-semibold text-zinc-grey uppercase tracking-wider mb-1">{s.label}</div>
                    <div className={`text-2xl font-extrabold ${s.color}`}>{s.value}</div>
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-2xl p-6 border border-df-border shadow-sm">
                <h3 className="font-semibold text-charcoal text-sm mb-4">Department Payroll Breakdown</h3>
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-mist-grey/60 border-b border-df-border text-zinc-grey uppercase tracking-wider">
                      <th className="px-4 py-3 font-semibold">Department</th>
                      <th className="px-4 py-3 font-semibold">Employees</th>
                      <th className="px-4 py-3 font-semibold">Total Payout</th>
                      <th className="px-4 py-3 font-semibold">Avg. Salary</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-df-border/60">
                    {(payrollData?.departmentBreakdown || []).map((d: any) => (
                      <tr key={d.name} className="hover:bg-cool-grey/60">
                        <td className="px-4 py-3 font-semibold text-charcoal">{d.name}</td>
                        <td className="px-4 py-3 font-mono">{d.count}</td>
                        <td className="px-4 py-3 font-mono font-bold text-royal-purple">₹{d.total.toLocaleString('en-IN')}</td>
                        <td className="px-4 py-3 font-mono text-zinc-grey">₹{d.count > 0 ? Math.round(d.total / d.count).toLocaleString('en-IN') : 0}</td>
                      </tr>
                    ))}
                    {(payrollData?.departmentBreakdown || []).length === 0 && (
                      <tr><td colSpan={4} className="px-4 py-8 text-center text-zinc-grey">No payroll data yet</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </PageTransition>
  )
}
