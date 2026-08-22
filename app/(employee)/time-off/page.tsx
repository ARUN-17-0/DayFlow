'use client'

import { useState, useEffect } from 'react'
import { PageTransition } from '@/components/dayflow/animations/PageTransition'
import { PageHeader } from '@/components/dayflow/PageHeader'
import { StatusChip } from '@/components/dayflow/StatusChip'
import { Calendar, Plus, Clock, CheckCircle2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { formatDate } from '@/lib/utils'

export default function TimeOffPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'requests' | 'apply'>('overview')
  const [requests, setRequests] = useState<any[]>([])
  const [balance, setBalance] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Form state
  const [leaveType, setLeaveType] = useState('PAID')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchData = async () => {
    try {
      const [reqRes, balRes] = await Promise.all([
        fetch('/api/leave'),
        fetch('/api/leave/balance'),
      ])
      const reqJson = await reqRes.json()
      const balJson = await balRes.json()

      if (reqJson.success) setRequests(reqJson.data.items || [])
      if (balJson.success) setBalance(balJson.data)
    } catch {
      toast.error('Failed to load leave data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!startDate || !endDate || !reason) {
      toast.error('Please fill in all required fields')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/leave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leaveType,
          startDate,
          endDate,
          reason,
        }),
      })

      const json = await res.json()
      if (json.success) {
        toast.success('Leave application submitted!')
        setReason('')
        setStartDate('')
        setEndDate('')
        setActiveTab('requests')
        fetchData()
      } else {
        toast.error(json.error || 'Failed to submit leave request')
      }
    } catch {
      toast.error('Application failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <PageTransition>
      <PageHeader
        title="Time Off & Leaves"
        description="Apply for leave, view balance, and track status."
        actions={
          <button
            onClick={() => setActiveTab('apply')}
            className="bg-royal-purple text-white text-xs font-semibold px-4 py-2.5 rounded-xl hover:bg-deep-violet flex items-center gap-1.5 shadow-md shadow-purple-500/20"
          >
            <Plus className="w-4 h-4" />
            Apply Leave
          </button>
        }
      />

      {/* Tabs */}
      <div className="flex border-b border-df-border mb-6">
        {[
          { key: 'overview', label: 'Overview' },
          { key: 'requests', label: 'My Requests' },
          { key: 'apply', label: 'Apply Leave' },
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

      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-df-border shadow-sm">
              <div className="text-xs font-medium text-zinc-grey uppercase tracking-wider mb-1">
                Paid Leave
              </div>
              <div className="text-3xl font-bold text-green-600 mb-1">
                {balance?.paidLeave ?? 12}
              </div>
              <div className="text-xs text-zinc-grey">Days remaining</div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-df-border shadow-sm">
              <div className="text-xs font-medium text-zinc-grey uppercase tracking-wider mb-1">
                Sick Leave
              </div>
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {balance?.sickLeave ?? 8}
              </div>
              <div className="text-xs text-zinc-grey">Days remaining</div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-df-border shadow-sm">
              <div className="text-xs font-medium text-zinc-grey uppercase tracking-wider mb-1">
                Casual Leave
              </div>
              <div className="text-3xl font-bold text-amber-600 mb-1">
                {balance?.casualLeave ?? 6}
              </div>
              <div className="text-xs text-zinc-grey">Days remaining</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-df-border shadow-sm">
            <h3 className="font-semibold text-charcoal text-base mb-4">Recent Requests</h3>
            <div className="space-y-3">
              {requests.slice(0, 5).map((r) => (
                <div key={r.id} className="flex items-center justify-between p-3.5 rounded-xl bg-cool-grey/60 border border-df-border/60">
                  <div>
                    <div className="font-semibold text-charcoal text-xs">{r.leaveType} Leave</div>
                    <div className="text-xs text-zinc-grey">
                      {formatDate(r.startDate)} - {formatDate(r.endDate)} ({r.totalDays} days)
                    </div>
                  </div>
                  <StatusChip status={r.status} size="sm" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'requests' && (
        <div className="bg-white rounded-2xl border border-df-border shadow-sm overflow-hidden p-4">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-mist-grey/60 border-b border-df-border text-zinc-grey uppercase tracking-wider">
                <th className="px-4 py-3 font-semibold">Type</th>
                <th className="px-4 py-3 font-semibold">Start Date</th>
                <th className="px-4 py-3 font-semibold">End Date</th>
                <th className="px-4 py-3 font-semibold">Days</th>
                <th className="px-4 py-3 font-semibold">Reason</th>
                <th className="px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-df-border/60">
              {requests.map((r) => (
                <tr key={r.id} className="hover:bg-cool-grey/60">
                  <td className="px-4 py-3 font-semibold text-charcoal">{r.leaveType}</td>
                  <td className="px-4 py-3 text-zinc-grey">{formatDate(r.startDate)}</td>
                  <td className="px-4 py-3 text-zinc-grey">{formatDate(r.endDate)}</td>
                  <td className="px-4 py-3 font-mono font-medium">{r.totalDays}</td>
                  <td className="px-4 py-3 text-zinc-grey max-w-xs truncate">{r.reason}</td>
                  <td className="px-4 py-3">
                    <StatusChip status={r.status} size="sm" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'apply' && (
        <form onSubmit={handleApplyLeave} className="bg-white rounded-2xl p-6 border border-df-border shadow-sm max-w-xl space-y-4">
          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">Leave Type</label>
            <select
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value)}
              className="w-full bg-mist-grey/60 text-xs px-3 py-2.5 rounded-xl border border-df-border"
            >
              <option value="PAID">Paid Leave</option>
              <option value="SICK">Sick Leave</option>
              <option value="CASUAL">Casual Leave</option>
              <option value="UNPAID">Unpaid Leave</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Start Date</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-mist-grey/60 text-xs px-3 py-2.5 rounded-xl border border-df-border"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">End Date</label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-mist-grey/60 text-xs px-3 py-2.5 rounded-xl border border-df-border"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">Reason / Remarks</label>
            <textarea
              required
              minLength={10}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Provide a clear reason for your leave request (at least 10 characters)..."
              className="w-full bg-mist-grey/60 text-xs px-3 py-2.5 rounded-xl border border-df-border h-24"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-royal-purple text-white text-xs font-semibold py-3 rounded-xl hover:bg-deep-violet transition-colors"
          >
            {submitting ? 'Submitting Application...' : 'Submit Leave Application'}
          </button>
        </form>
      )}
    </PageTransition>
  )
}
