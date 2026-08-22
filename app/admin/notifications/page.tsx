'use client'

import { useState, useEffect } from 'react'
import { PageTransition } from '@/components/dayflow/animations/PageTransition'
import { PageHeader } from '@/components/dayflow/PageHeader'
import { NotificationDetailModal } from '@/components/dayflow/NotificationDetailModal'
import {
  Check, CalendarCheck, CalendarX, DollarSign,
  UserCircle, ShieldCheck, AlertCircle, Info,
} from 'lucide-react'
import { formatTimeAgo } from '@/lib/utils'

function getIcon(type?: string) {
  switch (type) {
    case 'LEAVE_APPROVED':    return <CalendarCheck className="w-4 h-4 text-emerald-600" />
    case 'LEAVE_REJECTED':    return <CalendarX className="w-4 h-4 text-rose-500" />
    case 'LEAVE_SUBMITTED':   return <CalendarCheck className="w-4 h-4 text-blue-500" />
    case 'SALARY_GENERATED':  return <DollarSign className="w-4 h-4 text-amber-500" />
    case 'ATTENDANCE_MARKED': return <Check className="w-4 h-4 text-emerald-500" />
    case 'PROFILE_UPDATED':   return <UserCircle className="w-4 h-4 text-purple-600" />
    case 'EMAIL_VERIFIED':    return <ShieldCheck className="w-4 h-4 text-purple-600" />
    case 'SECURITY_EVENT':    return <AlertCircle className="w-4 h-4 text-rose-500" />
    default:                  return <Info className="w-4 h-4 text-slate-500" />
  }
}

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [selected, setSelected] = useState<any | null>(null)

  useEffect(() => {
    fetch('/api/notifications?limit=50')
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setNotifications(res.data.items || [])
      })
      .catch(() => {})
  }, [])

  return (
    <PageTransition>
      <PageHeader title="Admin Notifications" description="System alerts, leave requests, and audit events." />

      <div className="bg-white rounded-2xl border border-df-border shadow-sm divide-y divide-df-border/60">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-xs text-zinc-grey">No notifications found</div>
        ) : (
          notifications.map((n) => (
            <button
              key={n.id}
              onClick={() => setSelected(n)}
              className={`w-full text-left p-4 flex items-start gap-4 hover:bg-cool-grey/40 transition-colors group ${
                n.isRead ? 'bg-white' : 'bg-lavender/30'
              }`}
            >
              <div className="w-9 h-9 rounded-xl bg-lavender flex items-center justify-center text-royal-purple flex-shrink-0 group-hover:bg-purple-100 transition-colors">
                {getIcon(n.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-charcoal text-xs group-hover:text-royal-purple transition-colors">
                    {n.title}
                    {!n.isRead && (
                      <span className="ml-2 text-[9px] bg-purple-100 text-purple-700 font-bold px-1.5 py-0.5 rounded-full">NEW</span>
                    )}
                  </h4>
                  <span className="text-[10px] text-zinc-grey ml-2 shrink-0">{formatTimeAgo(n.createdAt)}</span>
                </div>
                <p className="text-xs text-zinc-grey mt-0.5 line-clamp-2">{n.message}</p>
                <p className="text-[11px] text-purple-600 font-medium mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  Click to view full message →
                </p>
              </div>
            </button>
          ))
        )}
      </div>

      {/* Outlook-style full detail modal */}
      <NotificationDetailModal
        notification={selected}
        onClose={() => setSelected(null)}
        onMarkRead={(id) => {
          setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
          )
          setSelected((prev: any) =>
            prev?.id === id ? { ...prev, isRead: true } : prev
          )
        }}
      />
    </PageTransition>
  )
}
