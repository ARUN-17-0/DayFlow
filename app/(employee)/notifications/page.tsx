'use client'

import { useState, useEffect } from 'react'
import { PageTransition } from '@/components/dayflow/animations/PageTransition'
import { PageHeader } from '@/components/dayflow/PageHeader'
import { Bell, Check } from 'lucide-react'
import { formatTimeAgo } from '@/lib/utils'
import { toast } from 'sonner'

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications?limit=50')
      const json = await res.json()
      if (json.success) setNotifications(json.data.items || [])
    } catch {
      toast.error('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  const markAllRead = async () => {
    try {
      await fetch('/api/notifications/read-all', { method: 'PUT' })
      toast.success('All notifications marked as read')
      fetchNotifications()
    } catch {}
  }

  return (
    <PageTransition>
      <PageHeader
        title="Notifications"
        description="Stay updated with your attendance, leaves, and salary events."
        actions={
          <button
            onClick={markAllRead}
            className="bg-white border border-df-border text-charcoal text-xs font-semibold px-4 py-2.5 rounded-xl hover:bg-mist-grey flex items-center gap-1.5"
          >
            <Check className="w-4 h-4 text-royal-purple" />
            Mark All as Read
          </button>
        }
      />

      <div className="bg-white rounded-2xl border border-df-border shadow-sm divide-y divide-df-border/60">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-xs text-zinc-grey">No notifications found</div>
        ) : (
          notifications.map((n) => (
            <div key={n.id} className={`p-4 flex items-start gap-4 ${n.isRead ? 'bg-white' : 'bg-lavender/30'}`}>
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
          ))
        )}
      </div>
    </PageTransition>
  )
}
