'use client'

import { useState, useEffect } from 'react'
import { PageTransition } from '@/components/dayflow/animations/PageTransition'
import { PageHeader } from '@/components/dayflow/PageHeader'
import { EmployeeCard } from '@/components/dayflow/cards/EmployeeCard'
import { StatusChip } from '@/components/dayflow/StatusChip'
import { Search, UserPlus, Grid, List, Download, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

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

export default function EmployeesListPage() {
  const [employees, setEmployees] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [view, setView] = useState<'grid' | 'table'>('grid')
  const [exporting, setExporting] = useState(false)

  const fetchEmployees = async () => {
    try {
      const url = search
        ? `/api/employees?search=${encodeURIComponent(search)}&limit=100`
        : '/api/employees?limit=100'
      const res = await fetch(url)
      const json = await res.json()
      if (json.success) setEmployees(json.data.items || [])
    } catch {
      toast.error('Failed to load employees')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setLoading(true)
    const t = setTimeout(fetchEmployees, search ? 300 : 0) // debounce search
    return () => clearTimeout(t)
  }, [search])

  const handleExport = async () => {
    setExporting(true)
    try {
      const res = await fetch('/api/employees?limit=500')
      const json = await res.json()
      const all = json.data?.items || []
      const rows = [
        ['Employee ID', 'First Name', 'Last Name', 'Email', 'Role', 'Department', 'Designation', 'Employment Type', 'Status', 'Joining Date'],
        ...all.map((e: any) => [
          e.employeeId,
          e.profile?.firstName || '',
          e.profile?.lastName || '',
          e.email,
          e.role,
          e.profile?.department?.name || '',
          e.profile?.designation?.name || '',
          e.profile?.employmentType || '',
          e.profile?.status || '',
          e.profile?.joiningDate ? new Date(e.profile.joiningDate).toLocaleDateString() : '',
        ]),
      ]
      downloadCSV(`employees-${new Date().toISOString().slice(0, 10)}.csv`, rows)
      toast.success(`Exported ${all.length} employee records`)
    } catch {
      toast.error('Export failed')
    } finally {
      setExporting(false)
    }
  }

  return (
    <PageTransition>
      <PageHeader
        title="Employee Directory"
        description="Manage all organizational accounts, roles, and profiles."
        actions={
          <div className="flex items-center gap-3">
            <div className="flex bg-mist-grey p-1 rounded-xl border border-df-border">
              <button
                onClick={() => setView('grid')}
                className={`p-1.5 rounded-lg transition-colors ${view === 'grid' ? 'bg-white text-royal-purple shadow-sm' : 'text-zinc-grey'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setView('table')}
                className={`p-1.5 rounded-lg transition-colors ${view === 'table' ? 'bg-white text-royal-purple shadow-sm' : 'text-zinc-grey'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={handleExport}
              disabled={exporting}
              className="bg-white border border-df-border text-charcoal text-xs font-semibold px-3 py-2.5 rounded-xl hover:bg-mist-grey flex items-center gap-1.5 disabled:opacity-60"
            >
              {exporting ? <Loader2 className="w-4 h-4 animate-spin text-royal-purple" /> : <Download className="w-4 h-4 text-royal-purple" />}
              Export
            </button>

            <Link
              href="/admin/employees/add"
              className="bg-royal-purple text-white text-xs font-semibold px-4 py-2.5 rounded-xl hover:bg-deep-violet flex items-center gap-1.5 shadow-md shadow-purple-500/20"
            >
              <UserPlus className="w-4 h-4" />
              Add Employee
            </Link>
          </div>
        }
      />

      {/* Search & Filters */}
      <div className="bg-white rounded-2xl p-4 border border-df-border shadow-sm mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-zinc-grey absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or employee ID..."
            className="w-full bg-mist-grey/60 text-xs text-charcoal placeholder:text-zinc-grey pl-9 pr-4 py-2 rounded-xl border border-df-border focus:outline-none focus:border-royal-purple focus:bg-white"
          />
        </div>
        <div className="text-xs text-zinc-grey">
          Total Employees: <span className="font-semibold text-charcoal">{employees.length}</span>
        </div>
      </div>

      {/* Content Rendering */}
      {view === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-5 border border-df-border shadow-sm animate-pulse">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-mist-grey" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-32 bg-mist-grey rounded" />
                      <div className="h-2.5 w-20 bg-mist-grey rounded" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-2.5 w-full bg-mist-grey rounded" />
                    <div className="h-2.5 w-3/4 bg-mist-grey rounded" />
                  </div>
                </div>
              ))
            : employees.map((emp) => (
                <EmployeeCard key={emp.id} employee={emp} adminView />
              ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-df-border shadow-sm overflow-hidden p-4">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-mist-grey/60 border-b border-df-border text-zinc-grey uppercase tracking-wider">
                <th className="px-4 py-3 font-semibold">Employee ID</th>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Department</th>
                <th className="px-4 py-3 font-semibold">Designation</th>
                <th className="px-4 py-3 font-semibold">Role</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-df-border/60">
              {loading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-4 py-3"><div className="h-3 w-16 bg-mist-grey rounded" /></td>
                      <td className="px-4 py-3"><div className="h-3 w-28 bg-mist-grey rounded" /></td>
                      <td className="px-4 py-3"><div className="h-3 w-32 bg-mist-grey rounded" /></td>
                      <td className="px-4 py-3"><div className="h-3 w-20 bg-mist-grey rounded" /></td>
                      <td className="px-4 py-3"><div className="h-3 w-24 bg-mist-grey rounded" /></td>
                      <td className="px-4 py-3"><div className="h-3 w-16 bg-mist-grey rounded" /></td>
                      <td className="px-4 py-3"><div className="h-5 w-14 bg-mist-grey rounded-full" /></td>
                      <td className="px-4 py-3"><div className="h-3 w-16 bg-mist-grey rounded" /></td>
                    </tr>
                  ))
                : employees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-cool-grey/60">
                      <td className="px-4 py-3 font-mono font-bold text-royal-purple">{emp.employeeId}</td>
                      <td className="px-4 py-3 font-medium text-charcoal">
                        {emp.profile?.firstName} {emp.profile?.lastName}
                      </td>
                      <td className="px-4 py-3 text-zinc-grey">{emp.email}</td>
                      <td className="px-4 py-3 text-zinc-grey">{emp.profile?.department?.name || '—'}</td>
                      <td className="px-4 py-3 text-zinc-grey">{emp.profile?.designation?.title || '—'}</td>
                      <td className="px-4 py-3 text-xs font-semibold">{emp.role}</td>
                      <td className="px-4 py-3">
                        <StatusChip status={emp.profile?.status || 'ACTIVE'} size="sm" />
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/employees/${emp.id}`}
                          className="text-xs font-semibold text-royal-purple hover:underline"
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      )}
    </PageTransition>
  )
}
