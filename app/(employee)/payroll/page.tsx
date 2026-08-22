'use client'

import { useState, useEffect } from 'react'
import { PageTransition } from '@/components/dayflow/animations/PageTransition'
import { PageHeader } from '@/components/dayflow/PageHeader'
import { CountUp } from '@/components/dayflow/animations/CountUp'
import { StatusChip } from '@/components/dayflow/StatusChip'
import { IndianRupee, Download, FileText, Calendar } from 'lucide-react'
import { toast } from 'sonner'
import { getMonthName } from '@/lib/utils'

export default function PayrollPage() {
  const [payrolls, setPayrolls] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/payroll')
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data) {
          setPayrolls(res.data.items || [])
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleDownloadSlip = (payrollId: string, month: number, year: number) => {
    toast.success(`Downloading salary slip for ${getMonthName(month)} ${year}...`)
    // Hits slip API endpoint
    window.open(`/api/payroll/${payrollId}/slip`, '_blank')
  }

  return (
    <PageTransition>
      <PageHeader
        title="My Salary & Payroll"
        description="View your salary breakdown and download monthly salary slips."
      />

      {/* Salary Overview Card */}
      <div className="bg-white rounded-2xl p-6 border border-df-border shadow-sm mb-6 max-w-xl">
        <h3 className="font-semibold text-charcoal text-base mb-4">Monthly Salary Structure</h3>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between py-1.5 text-zinc-grey border-b border-df-border/60">
            <span>Basic Salary</span>
            <span className="font-mono font-semibold text-charcoal">₹50,000</span>
          </div>
          <div className="flex justify-between py-1.5 text-zinc-grey border-b border-df-border/60">
            <span>HRA</span>
            <span className="font-mono font-semibold text-charcoal">₹20,000</span>
          </div>
          <div className="flex justify-between py-1.5 text-zinc-grey border-b border-df-border/60">
            <span>Allowances</span>
            <span className="font-mono font-semibold text-charcoal">₹8,000</span>
          </div>
          <div className="flex justify-between py-1.5 text-red-600 border-b border-df-border/60">
            <span>Deductions (PF + Taxes)</span>
            <span className="font-mono font-semibold">-₹8,000</span>
          </div>
          <div className="flex justify-between py-3 bg-lavender px-4 rounded-xl text-royal-purple font-bold text-base mt-2">
            <span>Net Monthly Salary</span>
            <CountUp value={70000} isCurrency />
          </div>
        </div>
      </div>

      {/* Salary Slips Table */}
      <div className="bg-white rounded-2xl border border-df-border shadow-sm overflow-hidden p-4">
        <h3 className="font-semibold text-charcoal text-base mb-4 px-2">Salary Slips History</h3>
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-mist-grey/60 border-b border-df-border text-zinc-grey uppercase tracking-wider">
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
                <td className="px-4 py-3 font-semibold text-charcoal flex items-center gap-2">
                  <FileText className="w-4 h-4 text-royal-purple" />
                  {getMonthName(p.month)} {p.year}
                </td>
                <td className="px-4 py-3 font-mono text-zinc-grey">₹{p.grossSalary?.toLocaleString('en-IN')}</td>
                <td className="px-4 py-3 font-mono font-bold text-royal-purple">₹{p.netSalary?.toLocaleString('en-IN')}</td>
                <td className="px-4 py-3">
                  <StatusChip status={p.status} size="sm" />
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleDownloadSlip(p.id, p.month, p.year)}
                    className="inline-flex items-center gap-1 bg-lavender text-royal-purple font-semibold px-3 py-1.5 rounded-lg hover:bg-royal-purple hover:text-white transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download Slip
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
