'use client'

import { useState, useEffect } from 'react'
import { PageTransition } from '@/components/dayflow/animations/PageTransition'
import { PageHeader } from '@/components/dayflow/PageHeader'
import { StatCard } from '@/components/dayflow/cards/StatCard'
import { StatusChip } from '@/components/dayflow/StatusChip'
import { IndianRupee, Download, Play, Users, FileText } from 'lucide-react'
import { toast } from 'sonner'
import { getMonthName } from '@/lib/utils'

export default function AdminPayrollPage() {
  const [payrolls, setPayrolls] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  const fetchPayroll = async () => {
    try {
      const res = await fetch('/api/payroll')
      const json = await res.json()
      if (json.success) {
        setPayrolls(json.data.items || [])
      }
    } catch {
      toast.error('Failed to load payroll data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPayroll()
  }, [])

  const handleGeneratePayroll = async () => {
    setGenerating(true)
    try {
      // Fetch employee IDs
      const empRes = await fetch('/api/employees')
      const empJson = await empRes.json()
      const userIds = (empJson.data?.items || []).map((e: any) => e.id)

      if (userIds.length === 0) {
        toast.error('No employees found to generate payroll for')
        setGenerating(false)
        return
      }

      const res = await fetch('/api/payroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userIds,
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear(),
        }),
      })

      const json = await res.json()

      if (json.success) {
        toast.success(`Successfully generated monthly payroll for ${json.data.generatedCount} employees!`)
        fetchPayroll()
      } else {
        toast.error(json.error || 'Payroll generation failed')
      }
    } catch {
      toast.error('Failed to generate payroll')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <PageTransition>
      <PageHeader
        title="Payroll Management"
        description="Process monthly salaries, generate salary slips, and review expenditure."
        actions={
          <button
            onClick={handleGeneratePayroll}
            disabled={generating}
            className="bg-royal-purple text-white text-xs font-semibold px-4 py-2.5 rounded-xl hover:bg-deep-violet flex items-center gap-1.5 shadow-md shadow-purple-500/20"
          >
            <Play className="w-4 h-4" />
            {generating ? 'Processing Payroll...' : 'Run Monthly Payroll'}
          </button>
        }
      />

      {/* Summary Cards (Matching wireframe screen 12) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Payroll (This Month)"
          value="₹28,45,000"
          subtitle="240 Employees Processed"
          icon={IndianRupee}
          accentColor="#6D28D9"
        />
        <StatCard
          title="Average Salary"
          value="₹52,340"
          subtitle="Per employee"
          icon={Users}
          accentColor="#22C55E"
        />
        <StatCard
          title="Employees Paid"
          value="240"
          subtitle="100% payout rate"
          icon={FileText}
          accentColor="#3B82F6"
        />
        <StatCard
          title="Pending Adjustments"
          value="8"
          subtitle="Overtime & deductions"
          icon={IndianRupee}
          accentColor="#F59E0B"
        />
      </div>

      {/* Department Payroll Overview Table (Matching wireframe screen 12) */}
      <div className="bg-white rounded-2xl p-6 border border-df-border shadow-sm mb-6">
        <h3 className="font-semibold text-charcoal text-base mb-4">Department Payroll Summary</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-mist-grey/60 border-b border-df-border text-zinc-grey uppercase tracking-wider">
                <th className="px-4 py-3 font-semibold">Department</th>
                <th className="px-4 py-3 font-semibold">Employees</th>
                <th className="px-4 py-3 font-semibold">Total Payroll</th>
                <th className="px-4 py-3 font-semibold">Average Salary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-df-border/60">
              {[
                { name: 'Engineering', count: 120, total: '₹14,40,000', avg: '₹48,000' },
                { name: 'Human Resources', count: 15, total: '₹5,25,000', avg: '₹53,000' },
                { name: 'Finance', count: 18, total: '₹4,10,000', avg: '₹45,166' },
                { name: 'Marketing', count: 22, total: '₹2,80,000', avg: '₹38,182' },
                { name: 'Support', count: 65, total: '₹5,90,000', avg: '₹31,077' },
              ].map((d) => (
                <tr key={d.name} className="hover:bg-cool-grey/60">
                  <td className="px-4 py-3 font-semibold text-charcoal">{d.name}</td>
                  <td className="px-4 py-3 font-mono font-medium">{d.count}</td>
                  <td className="px-4 py-3 font-mono font-bold text-royal-purple">{d.total}</td>
                  <td className="px-4 py-3 font-mono text-zinc-grey">{d.avg}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generated Salary Slips Table */}
      <div className="bg-white rounded-2xl border border-df-border shadow-sm p-4">
        <h3 className="font-semibold text-charcoal text-base mb-4 px-2">Generated Salary Slips</h3>
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-mist-grey/60 border-b border-df-border text-zinc-grey uppercase tracking-wider">
              <th className="px-4 py-3 font-semibold">Employee</th>
              <th className="px-4 py-3 font-semibold">Month / Year</th>
              <th className="px-4 py-3 font-semibold">Gross Salary</th>
              <th className="px-4 py-3 font-semibold">Net Salary</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-df-border/60">
            {payrolls.map((p) => (
              <tr key={p.id} className="hover:bg-cool-grey/60">
                <td className="px-4 py-3 font-semibold text-charcoal">
                  {p.user?.profile?.firstName} {p.user?.profile?.lastName}
                </td>
                <td className="px-4 py-3 text-zinc-grey">{getMonthName(p.month)} {p.year}</td>
                <td className="px-4 py-3 font-mono text-zinc-grey">₹{p.grossSalary?.toLocaleString('en-IN')}</td>
                <td className="px-4 py-3 font-mono font-bold text-royal-purple">₹{p.netSalary?.toLocaleString('en-IN')}</td>
                <td className="px-4 py-3">
                  <StatusChip status={p.status} size="sm" />
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => window.open(`/api/payroll/${p.id}/slip`, '_blank')}
                    className="inline-flex items-center gap-1 bg-lavender text-royal-purple font-semibold px-3 py-1.5 rounded-lg hover:bg-royal-purple hover:text-white transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageTransition>
  )
}
