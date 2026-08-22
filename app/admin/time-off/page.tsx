'use client'

import { useState, useEffect } from 'react'
import { PageTransition } from '@/components/dayflow/animations/PageTransition'
import { PageHeader } from '@/components/dayflow/PageHeader'
import { StatusChip } from '@/components/dayflow/StatusChip'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, User, Calendar, MessageSquare, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { formatDate, getInitials } from '@/lib/utils'

export default function AdminTimeOffPage() {
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING')
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Review Modal State (Screen 11 in wireframe)
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

  const handleReviewAction = async (status: 'APPROVED' | 'REJECTED') => {
    if (!selectedRequest) return
    setReviewing(true)

    try {
      const res = await fetch(`/api/leave/${selectedRequest.id}/review`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          reviewComment,
        }),
      })

      const json = await res.json()

      if (json.success) {
        toast.success(`Leave request ${status.toLowerCase()}!`)
        setSelectedRequest(null)
        setReviewComment('')
        fetchRequests()
      } else {
        toast.error(json.error || 'Failed to update leave request')
      }
    } catch {
      toast.error('Review failed')
    } finally {
      setReviewing(false)
    }
  }

  return (
    <PageTransition>
      <PageHeader
        title="Leave Requests & Approvals"
        description="Review, approve, or reject employee leave applications."
      />

      {/* Tabs (Matching wireframe screen 10) */}
      <div className="flex border-b border-df-border mb-6">
        {[
          { key: 'PENDING', label: 'Pending Approvals' },
          { key: 'ALL', label: 'All Requests' },
          { key: 'APPROVED', label: 'Approved' },
          { key: 'REJECTED', label: 'Rejected' },
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

      {/* Table (Matching wireframe screen 10) */}
      <div className="bg-white rounded-2xl border border-df-border shadow-sm overflow-hidden p-4">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-mist-grey/60 border-b border-df-border text-zinc-grey uppercase tracking-wider">
              <th className="px-4 py-3 font-semibold">Employee</th>
              <th className="px-4 py-3 font-semibold">Leave Type</th>
              <th className="px-4 py-3 font-semibold">Dates</th>
              <th className="px-4 py-3 font-semibold">Days</th>
              <th className="px-4 py-3 font-semibold">Reason</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-df-border/60">
            {requests.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-xs text-zinc-grey">
                  No leave requests found in this view.
                </td>
              </tr>
            ) : (
              requests.map((r) => (
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
                  <td className="px-4 py-3 font-medium text-charcoal">{r.leaveType}</td>
                  <td className="px-4 py-3 text-zinc-grey">
                    {formatDate(r.startDate)} - {formatDate(r.endDate)}
                  </td>
                  <td className="px-4 py-3 font-mono font-medium">{r.totalDays}</td>
                  <td className="px-4 py-3 text-zinc-grey max-w-xs truncate">{r.reason}</td>
                  <td className="px-4 py-3">
                    <StatusChip status={r.status} size="sm" />
                  </td>
                  <td className="px-4 py-3">
                    {r.status === 'PENDING' ? (
                      <button
                        onClick={() => setSelectedRequest(r)}
                        className="bg-royal-purple text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-deep-violet transition-colors"
                      >
                        Review
                      </button>
                    ) : (
                      <button
                        onClick={() => setSelectedRequest(r)}
                        className="text-xs font-semibold text-royal-purple hover:underline"
                      >
                        Details
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Leave Approval Modal (Screen 11 in wireframe) */}
      <AnimatePresence>
        {selectedRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedRequest(null)}
            />

            <motion.div
              className="relative bg-white rounded-3xl p-6 border border-df-border shadow-2xl w-full max-w-lg z-10 space-y-6"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 border-b border-df-border">
                <h3 className="font-bold text-charcoal text-lg">Leave Request Details</h3>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="p-1 rounded-lg text-zinc-grey hover:text-charcoal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Employee Summary Card */}
              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-lavender/50 border border-purple-200">
                <div className="w-10 h-10 rounded-full bg-royal-purple text-white font-bold flex items-center justify-center text-sm">
                  {getInitials(selectedRequest.user?.profile?.firstName || 'E', selectedRequest.user?.profile?.lastName || 'P')}
                </div>
                <div>
                  <div className="font-bold text-charcoal text-sm">
                    {selectedRequest.user?.profile?.firstName} {selectedRequest.user?.profile?.lastName}
                  </div>
                  <div className="text-xs text-zinc-grey">
                    {selectedRequest.user?.profile?.department?.name || 'Engineering'} • {selectedRequest.user?.employeeId}
                  </div>
                </div>
              </div>

              {/* Details List */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-df-border">
                  <span className="text-zinc-grey">Leave Type</span>
                  <span className="font-bold text-charcoal">{selectedRequest.leaveType} Leave</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-df-border">
                  <span className="text-zinc-grey">Duration</span>
                  <span className="font-semibold text-charcoal">
                    {formatDate(selectedRequest.startDate)} – {formatDate(selectedRequest.endDate)} ({selectedRequest.totalDays} Days)
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-df-border">
                  <span className="text-zinc-grey">Reason</span>
                  <span className="font-medium text-charcoal max-w-xs text-right">{selectedRequest.reason}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-zinc-grey">Current Status</span>
                  <StatusChip status={selectedRequest.status} size="sm" />
                </div>
              </div>

              {/* Comments Input (for approval/rejection) */}
              {selectedRequest.status === 'PENDING' && (
                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1">
                    Reviewer Comments (Optional)
                  </label>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Looks good. Take care!"
                    className="w-full bg-mist-grey/60 text-xs px-3 py-2 rounded-xl border border-df-border h-20"
                  />
                </div>
              )}

              {/* Actions Footer */}
              {selectedRequest.status === 'PENDING' ? (
                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => handleReviewAction('REJECTED')}
                    disabled={reviewing}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <X className="w-4 h-4" />
                    Reject Request
                  </button>
                  <button
                    onClick={() => handleReviewAction('APPROVED')}
                    disabled={reviewing}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-green-500/20"
                  >
                    <Check className="w-4 h-4" />
                    Approve Request
                  </button>
                </div>
              ) : (
                <div className="text-center text-xs text-zinc-grey pt-2">
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
