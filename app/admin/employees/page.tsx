'use client'

import { useState, useEffect } from 'react'
import { PageTransition } from '@/components/dayflow/animations/PageTransition'
import { PageHeader } from '@/components/dayflow/PageHeader'
import { EmployeeCard } from '@/components/dayflow/cards/EmployeeCard'
import { StatusChip } from '@/components/dayflow/StatusChip'
import { Search, Plus, UserPlus, Grid, List } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

export default function EmployeesListPage() {
  const [employees, setEmployees] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [view, setView] = useState<'grid' | 'table'>('grid')

  const fetchEmployees = async () => {
    try {
      const url = search
        ? `/api/employees?search=${encodeURIComponent(search)}`
        : '/api/employees'
      const res = await fetch(url)
      const json = await res.json()
      if (json.success) {
        setEmployees(json.data.items || [])
      }
    } catch {
      toast.error('Failed to load employees')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEmployees()
  }, [search])

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
                className={`p-1.5 rounded-lg transition-colors ${
                  view === 'grid' ? 'bg-white text-royal-purple shadow-sm' : 'text-zinc-grey'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setView('table')}
                className={`p-1.5 rounded-lg transition-colors ${
                  view === 'table' ? 'bg-white text-royal-purple shadow-sm' : 'text-zinc-grey'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

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
          {employees.map((emp) => (
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
                <th className="px-4 py-3 font-semibold">Role</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-df-border/60">
              {employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-cool-grey/60">
                  <td className="px-4 py-3 font-mono font-bold text-royal-purple">{emp.employeeId}</td>
                  <td className="px-4 py-3 font-medium text-charcoal">
                    {emp.profile?.firstName} {emp.profile?.lastName}
                  </td>
                  <td className="px-4 py-3 text-zinc-grey">{emp.email}</td>
                  <td className="px-4 py-3 text-zinc-grey">{emp.profile?.department?.name || 'General'}</td>
                  <td className="px-4 py-3 text-xs font-semibold">{emp.role}</td>
                  <td className="px-4 py-3">
                    <StatusChip status={emp.profile?.status || 'ACTIVE'} size="sm" />
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/employees/${emp.id}`}
                      className="text-xs font-semibold text-royal-purple hover:underline"
                    >
                      Edit Profile
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
