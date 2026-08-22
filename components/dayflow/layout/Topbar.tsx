'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Bell, Menu, User, Settings, LogOut, Check, ShieldCheck } from 'lucide-react'
import { getInitials, getGreeting, formatTimeAgo } from '@/lib/utils'
import { NotificationDetailModal } from '@/components/dayflow/NotificationDetailModal'

type TopbarProps = {
  onOpenMobileNav?: () => void
  isAdmin?: boolean
}

export function Topbar({ onOpenMobileNav, isAdmin = false }: TopbarProps) {
  const { data: session } = useSession()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [selectedNotification, setSelectedNotification] = useState<any | null>(null)

  const userName = session?.user?.name || 'User'
  const userEmail = session?.user?.email || ''
  const userRole = (session?.user as any)?.role || 'EMPLOYEE'
  const employeeId = (session?.user as any)?.employeeId || ''
  const initials = getInitials(userName.split(' ')[0] || 'U', userName.split(' ')[1] || 'S')
  const greeting = getGreeting()

  useEffect(() => {
    fetch('/api/notifications?limit=5')
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data) {
          setNotifications(res.data.items || [])
          setUnreadCount(res.data.unreadCount || 0)
        }
      })
      .catch(() => {})
  }, [])

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications/read-all', { method: 'PUT' })
      setUnreadCount(0)
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
    } catch {}
  }

  return (
    <>
    <header className="sticky top-0 z-20 bg-slate-100/90 backdrop-blur-md border-b border-slate-200 px-4 lg:px-8 py-3 flex items-center justify-between gap-4">
      {/* Mobile hamburger + Greeting */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileNav}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="text-xs font-medium text-slate-600 hidden sm:block">
            {greeting}, <span className="font-semibold text-slate-800">{userName.split(' ')[0]}</span> 👋
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-wider bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full border border-purple-200/60">
            {userRole}
          </span>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3">
        {/* Search bar */}
        <div className="relative hidden md:block w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search anything... (Cmd+K)"
            className="w-full bg-white text-xs text-slate-800 placeholder:text-slate-400 pl-9 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-purple-600 transition-all font-medium"
          />
        </div>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications)
              setShowProfileMenu(false)
            }}
            className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-purple-600 rounded-full ring-2 ring-white animate-pulse" />
            )}
          </button>

          {/* Notifications dropdown */}
          <AnimatePresence>
            {showNotifications && (
              <motion.div
                className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl border border-slate-200 shadow-xl p-4 z-50"
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
              >
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                  <span className="font-bold text-slate-800 text-sm">Notifications</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-purple-700 font-semibold hover:underline flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="text-center py-6 text-xs text-slate-400 font-medium">
                      No recent notifications
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <button
                        key={n.id}
                        onClick={() => {
                          setSelectedNotification(n)
                          setShowNotifications(false)
                        }}
                        className={`w-full text-left p-3 rounded-xl text-xs transition-colors cursor-pointer hover:scale-[1.01] hover:shadow-sm ${
                          n.isRead ? 'bg-slate-50 border border-slate-100 hover:bg-slate-100' : 'bg-purple-50/60 border border-purple-100 font-medium hover:bg-purple-100/60'
                        }`}
                      >
                        <div className="font-semibold text-slate-800">{n.title}</div>
                        <div className="text-slate-500 mt-0.5 line-clamp-2">{n.message}</div>
                        <div className="text-[10px] text-slate-400 mt-1 font-mono">{formatTimeAgo(n.createdAt)}</div>
                      </button>
                    ))
                  )}
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 text-center">
                  <Link
                    href={isAdmin ? '/admin/notifications' : '/notifications'}
                    className="text-xs text-purple-700 font-semibold hover:underline"
                    onClick={() => setShowNotifications(false)}
                  >
                    View all notifications →
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Avatar Menu */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu)
              setShowNotifications(false)
            }}
            className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-purple-300 transition-all"
          >
            <div className="w-8.5 h-8.5 rounded-full bg-purple-700 text-white font-bold flex items-center justify-center text-xs shadow-sm">
              {initials}
            </div>
          </button>

          {/* Profile Dropdown Menu */}
          <AnimatePresence>
            {showProfileMenu && (
              <motion.div
                className="absolute right-0 mt-2 w-60 bg-white rounded-2xl border border-slate-200 shadow-xl p-2 z-50"
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
              >
                <div className="p-3 border-b border-slate-100 mb-1">
                  <div className="font-bold text-slate-800 text-sm truncate">{userName}</div>
                  <div className="text-xs text-slate-500 truncate">{userEmail}</div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] font-mono bg-purple-50 text-purple-700 font-semibold px-2 py-0.5 rounded border border-purple-100">
                      {employeeId}
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                      {userRole}
                    </span>
                  </div>
                </div>

                <Link
                  href={isAdmin ? '/admin/dashboard' : '/profile'}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
                  onClick={() => setShowProfileMenu(false)}
                >
                  <User className="w-4 h-4 text-slate-400" />
                  <span>My Profile</span>
                </Link>

                {['ADMIN', 'HR_OFFICER'].includes(userRole) && (
                  <Link
                    href="/admin/dashboard"
                    className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-purple-700 hover:bg-purple-50 rounded-xl transition-colors"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    <ShieldCheck className="w-4 h-4 text-purple-600" />
                    <span>Management Console</span>
                  </Link>
                )}

                <Link
                  href={isAdmin ? '/admin/settings' : '/settings'}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
                  onClick={() => setShowProfileMenu(false)}
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  <span>Settings</span>
                </Link>

                <div className="border-t border-slate-100 my-1" />

                <button
                  onClick={() => signOut({ callbackUrl: '/sign-in' })}
                  className="flex items-center gap-2 w-full px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                >
                  <LogOut className="w-4 h-4 text-rose-600" />
                  <span>Log out</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>

    {/* Outlook-style full notification detail modal */}
    <NotificationDetailModal
      notification={selectedNotification}
      onClose={() => setSelectedNotification(null)}
      onMarkRead={(id) => {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        )
        setUnreadCount((c) => Math.max(0, c - 1))
        setSelectedNotification((prev: any) =>
          prev?.id === id ? { ...prev, isRead: true } : prev
        )
      }}
    />
  </>
  )
}
