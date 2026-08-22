'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell,
  X,
  Check,
  Clock,
  ShieldCheck,
  CalendarCheck,
  CalendarX,
  DollarSign,
  UserCircle,
  AlertCircle,
  Info,
} from 'lucide-react'
import { formatTimeAgo } from '@/lib/utils'

type Notification = {
  id: string
  title: string
  message: string
  type?: string
  isRead: boolean
  createdAt: string
}

type Props = {
  notification: Notification | null
  onClose: () => void
  onMarkRead?: (id: string) => void
}

function getIcon(type?: string) {
  switch (type) {
    case 'LEAVE_APPROVED':     return <CalendarCheck className="w-5 h-5 text-emerald-600" />
    case 'LEAVE_REJECTED':     return <CalendarX className="w-5 h-5 text-rose-500" />
    case 'LEAVE_SUBMITTED':    return <CalendarCheck className="w-5 h-5 text-blue-500" />
    case 'SALARY_GENERATED':   return <DollarSign className="w-5 h-5 text-amber-500" />
    case 'ATTENDANCE_MARKED':  return <Check className="w-5 h-5 text-emerald-500" />
    case 'PROFILE_UPDATED':    return <UserCircle className="w-5 h-5 text-purple-600" />
    case 'EMAIL_VERIFIED':     return <ShieldCheck className="w-5 h-5 text-purple-600" />
    case 'SECURITY_EVENT':     return <AlertCircle className="w-5 h-5 text-rose-500" />
    default:                   return <Info className="w-5 h-5 text-slate-500" />
  }
}

function getAccentColor(type?: string) {
  switch (type) {
    case 'LEAVE_APPROVED':    return 'bg-emerald-50 border-emerald-200'
    case 'LEAVE_REJECTED':    return 'bg-rose-50 border-rose-200'
    case 'LEAVE_SUBMITTED':   return 'bg-blue-50 border-blue-200'
    case 'SALARY_GENERATED':  return 'bg-amber-50 border-amber-200'
    case 'SECURITY_EVENT':    return 'bg-rose-50 border-rose-200'
    default:                  return 'bg-purple-50 border-purple-200'
  }
}

export function NotificationDetailModal({ notification, onClose, onMarkRead }: Props) {
  useEffect(() => {
    if (!notification) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [notification, onClose])

  const handleMarkRead = async () => {
    if (!notification || notification.isRead) return
    try {
      await fetch(`/api/notifications/${notification.id}/read`, { method: 'PUT' })
      onMarkRead?.(notification.id)
    } catch {}
  }

  return (
    <AnimatePresence>
      {notification && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
          />

          <motion.div
            className="fixed top-4 right-4 z-50 w-[420px] max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
            initial={{ opacity: 0, x: 48, scale: 0.97 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 48, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3.5 bg-slate-50 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-700">
                <Bell className="w-4 h-4 text-purple-600" />
                <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Notification</span>
              </div>
              <div className="flex items-center gap-2">
                {!notification.isRead && (
                  <button
                    onClick={handleMarkRead}
                    className="text-[11px] font-semibold text-purple-700 hover:text-purple-900 hover:bg-purple-50 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Mark read
                  </button>
                )}
                <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className={`flex items-start gap-4 px-5 pt-5 pb-4 border-b border-slate-100 ${getAccentColor(notification.type)}`}>
              <div className="w-10 h-10 rounded-xl bg-white/70 border border-white shadow-sm flex items-center justify-center flex-shrink-0">
                {getIcon(notification.type)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-800 text-sm leading-snug">{notification.title}</h3>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span className="text-[11px] text-slate-400 font-medium">{formatTimeAgo(notification.createdAt)}</span>
                  {!notification.isRead && (
                    <span className="ml-1 text-[10px] bg-purple-100 text-purple-700 font-bold px-1.5 py-0.5 rounded-full">NEW</span>
                  )}
                </div>
              </div>
            </div>

            <div className="px-5 py-5 flex-1">
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{notification.message}</p>
            </div>

            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-end">
              <button
                onClick={onClose}
                className="text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-200 px-4 py-2 rounded-xl hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
