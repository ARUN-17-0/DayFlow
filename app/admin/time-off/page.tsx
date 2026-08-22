'use client'

import { useState, useEffect } from 'react'
import { PageTransition } from '@/components/dayflow/animations/PageTransition'
import { PageHeader } from '@/components/dayflow/PageHeader'
import { StatusChip } from '@/components/dayflow/StatusChip'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, User, Calendar, MessageSquare, AlertCircle, CheckCircle2, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { formatDate, getInitials } from '@/lib/utils'

export default function AdminTimeOffPage() {
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING')
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Modal Review State
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [reviewComment, setReviewComment] = useState('')
  const [reviewing, setReviewing] = useState(false)

  const fetchRequests = async () => {
    try {
      const statusParam = activeTab === 'ALL' ? '' : `status=${activeTab}`
      const res = await fetch(`/api/leave?${statusParam}`)
      const json = await res.json()
      if (json.success) {
        setRequests(json.data.items || [])
      }
    } catch {
      toast.error('Failed to load leave requests')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [activeTab])

  // Direct 1-Click Action from Table Row
  const handleQuickReview = async (id: string, status: 'APPROVED' | 'REJECTED', comment = '') => {
    try {
      const res = await fetch(`/api/leave/${id}/review`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, reviewComment: comment }),
      })

      const json = await res.json()

      if (json.success) {
        toast.success(`Leave request ${status === 'APPROVED' ? 'Approved ✅' : 'Rejected ❌'}!`)
        fetchRequests()
      } else {
        toast.error(json.error || 'Failed to update leave request')
      }
    } catch {
      toast.error('Review action failed')
    }
  }

  const handleModalReview = async (status: 'APPROVED' | 'REJECTED') => {
    if (!selectedRequest) return
    setReviewing(true)
    await handleQuickReview(selectedRequest.id, status, reviewComment)
    setSelectedRequest(null)
    setReviewComment('')
    setReviewing(false)
  }

  return (
    <PageTransition>
      <PageHeader
        title="HR Leave Approvals Management"
        description="Review, approve, or reject employee leave applications."
      />

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-6">
        {[
          { key: 'PENDING', label: 'Pending Approvals' },
          { key: 'ALL', label: 'All Requests' },
          { key: 'APPROVED', label: 'Approved' },
          { key: 'REJECTED', label: 'Rejected' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-5 py-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === tab.key
                ? 'border-purple-600 text-purple-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-4">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
              <th className="px-4 py-3">Employee</th>
              <th className="px-4 py-3">Leave Type</th>
              <th className="px-4 py-3">Dates</th>
              <th className="px-4 py-3">Total Days</th>
              <th className="px-4 py-3">Reason</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-center">HR Quick Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {requests.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-xs text-slate-500 font-medium">
                  No leave requests found in this section.
                </td>
              </tr>
            ) : (
              requests.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/80">
                  <td className="px-4 py-3 font-semibold text-slate-900 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-extrabold flex items-center justify-center text-xs border border-purple-200">
                      {r.user?.profile?.firstName?.[0]}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">{r.user?.profile?.firstName} {r.user?.profile?.lastName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{r.user?.employeeId}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-bold text-purple-900">{r.leaveType}</td>
                  <td className="px-4 py-3 text-slate-600 font-medium">
                    {formatDate(r.startDate)} - {formatDate(r.endDate)}
                  </td>
                  <td className="px-4 py-3 font-mono font-bold text-slate-900">{r.totalDays} Days</td>
                  <td className="px-4 py-3 text-slate-600 max-w-xs truncate">{r.reason}</td>
                  <td className="px-4 py-3">
                    <StatusChip status={r.status} size="sm" />
                  </td>
                  <td className="px-4 py-3 text-center">
                    {r.status === 'PENDING' ? (
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleQuickReview(r.id, 'APPROVED')}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-xl transition-all shadow-sm flex items-center gap-1 text-xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleQuickReview(r.id, 'REJECTED')}
                          className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-3 py-1.5 rounded-xl transition-all shadow-sm flex items-center gap-1 text-xs"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Reject
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setSelectedRequest(r)}
                        className="text-xs font-bold text-purple-700 hover:underline"
                      >
                        View Details
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Leave Approval Modal */}
      <AnimatePresence>
        {selectedRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedRequest(null)}
            />

            <motion.div
              className="relative bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl w-full max-w-lg z-10 space-y-6"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <h3 className="font-bold text-slate-900 text-base">Leave Request Review</h3>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-purple-50 border border-purple-200">
                <div className="w-10 h-10 rounded-full bg-purple-700 text-white font-bold flex items-center justify-center text-sm">
                  {getInitials(selectedRequest.user?.profile?.firstName || 'E', selectedRequest.user?.profile?.lastName || 'P')}
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-sm">
                    {selectedRequest.user?.profile?.firstName} {selectedRequest.user?.profile?.lastName}
                  </div>
                  <div className="text-xs text-slate-500 font-medium">
                    {selectedRequest.user?.profile?.department?.name || 'Engineering'} • {selectedRequest.user?.employeeId}
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Leave Type</span>
                  <span className="font-bold text-slate-900">{selectedRequest.leaveType} Leave</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Duration</span>
                  <span className="font-bold text-slate-900">
                    {formatDate(selectedRequest.startDate)} – {formatDate(selectedRequest.endDate)} ({selectedRequest.totalDays} Days)
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Reason</span>
                  <span className="font-medium text-slate-800 max-w-xs text-right">{selectedRequest.reason}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500 font-medium">Current Status</span>
                  <StatusChip status={selectedRequest.status} size="sm" />
                </div>
              </div>

              {selectedRequest.status === 'PENDING' && (
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Reviewer Comments (Optional)
                  </label>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="e.g. Approved. Have a safe trip!"
                    className="w-full bg-slate-50 text-xs text-slate-900 px-3 py-2 rounded-xl border border-slate-200 h-20 font-medium"
                  />
                </div>
              )}

              {selectedRequest.status === 'PENDING' ? (
                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => handleModalReview('REJECTED')}
                    disabled={reviewing}
                    className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <X className="w-4 h-4" />
                    Reject Request
                  </button>
                  <button
                    onClick={() => handleModalReview('APPROVED')}
                    disabled={reviewing}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <Check className="w-4 h-4" />
                    Approve Request
                  </button>
                </div>
              ) : (
                <div className="text-center text-xs text-slate-500 font-medium pt-2">
                  Reviewed on {formatDate(selectedRequest.updatedAt || new Date())}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </PageTransition>
  )
}
