'use client'

import { useState } from 'react'
import { PageTransition } from '@/components/dayflow/animations/PageTransition'
import { PageHeader } from '@/components/dayflow/PageHeader'
import { BarChart3, Download, Calendar, Users, TrendingUp } from 'lucide-react'
import { toast } from 'sonner'

export default function AdminReportsPage() {
  const [activeTab, setActiveTab] = useState<'attendance' | 'leave' | 'payroll'>('attendance')

  const handleExport = (type: string) => {
    toast.success(`Exporting ${type} report to CSV...`)
  }

  return (
    <PageTransition>
      <PageHeader
        title="Reports & Analytics"
        description="Comprehensive reports on attendance, leave trends, and organization payroll."
        actions={
          <button
            onClick={() => handleExport(activeTab)}
            className="bg-royal-purple text-white text-xs font-semibold px-4 py-2.5 rounded-xl hover:bg-deep-violet flex items-center gap-1.5 shadow-md shadow-purple-500/20"
          >
            <Download className="w-4 h-4" />
            Export Report
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

      {activeTab === 'attendance' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-df-border shadow-sm">
            <h3 className="font-semibold text-charcoal text-base mb-4">Monthly Attendance Rate by Department</h3>
            <div className="space-y-3">
              {[
                { dept: 'Engineering', rate: 94 },
                { dept: 'Human Resources', rate: 98 },
                { dept: 'Finance', rate: 91 },
                { dept: 'Marketing', rate: 89 },
                { dept: 'Operations', rate: 96 },
              ].map((d) => (
                <div key={d.dept} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-charcoal">
                    <span>{d.dept}</span>
                    <span className="font-mono text-royal-purple">{d.rate}%</span>
                  </div>
                  <div className="h-2.5 w-full bg-mist-grey rounded-full overflow-hidden">
                    <div
                      className="h-full bg-royal-purple rounded-full transition-all duration-500"
                      style={{ width: `${d.rate}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'leave' && (
        <div className="bg-white rounded-2xl p-6 border border-df-border shadow-sm">
          <h3 className="font-semibold text-charcoal text-base mb-4">Leave Distribution by Type</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-green-50 border border-green-200">
              <div className="text-xs font-semibold text-green-700">Paid Leave Taken</div>
              <div className="text-2xl font-bold text-green-800 mt-1">142 Days</div>
            </div>
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
              <div className="text-xs font-semibold text-blue-700">Sick Leave Taken</div>
              <div className="text-2xl font-bold text-blue-800 mt-1">68 Days</div>
            </div>
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
              <div className="text-xs font-semibold text-amber-700">Casual Leave Taken</div>
              <div className="text-2xl font-bold text-amber-800 mt-1">45 Days</div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'payroll' && (
        <div className="bg-white rounded-2xl p-6 border border-df-border shadow-sm">
          <h3 className="font-semibold text-charcoal text-base mb-4">Annual Payroll Growth Trend</h3>
          <div className="h-48 flex items-end justify-between gap-4 pt-6 bg-cool-grey/50 p-4 rounded-xl border border-df-border/60">
            {[
              { month: 'Jan', val: 75 },
              { month: 'Feb', val: 78 },
              { month: 'Mar', val: 80 },
              { month: 'Apr', val: 82 },
              { month: 'May', val: 85 },
              { month: 'Jun', val: 90 },
              { month: 'Jul', val: 95 },
              { month: 'Aug', val: 100 },
            ].map((m) => (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                <div
                  className="w-full max-w-[28px] bg-royal-purple rounded-t-md"
                  style={{ height: `${m.val}%` }}
                />
                <span className="text-[11px] font-semibold text-zinc-grey">{m.month}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </PageTransition>
  )
}
