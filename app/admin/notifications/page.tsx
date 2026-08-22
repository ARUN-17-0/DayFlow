'use client'

import { useState, useEffect } from 'react'
import { PageTransition } from '@/components/dayflow/animations/PageTransition'
import { PageHeader } from '@/components/dayflow/PageHeader'
import { Bell, Check } from 'lucide-react'
import { formatTimeAgo } from '@/lib/utils'
import { toast } from 'sonner'

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([])

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
        {notifications.map((n) => (
          <div key={n.id} className="p-4 flex items-start gap-4 hover:bg-cool-grey/40 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-lavender flex items-center justify-center text-royal-purple flex-shrink-0">
              <Bell className="w-4.5 h-4.5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-charcoal text-xs">{n.title}</h4>
                <span className="text-[10px] text-zinc-grey">{formatTimeAgo(n.createdAt)}</span>
              </div>
              <p className="text-xs text-zinc-grey mt-0.5">{n.message}</p>
            </div>
          </div>
        ))}
      </div>
    </PageTransition>
  )
}
