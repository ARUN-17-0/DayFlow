'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Bell, Menu, User, Settings, LogOut, Check } from 'lucide-react'
import { getInitials, getGreeting, formatTimeAgo } from '@/lib/utils'

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

  const userName = session?.user?.name || 'User'
  const userEmail = session?.user?.email || ''
  const employeeId = (session?.user as any)?.employeeId || ''
  const initials = getInitials(userName.split(' ')[0] || 'U', userName.split(' ')[1] || 'S')
  const greeting = getGreeting()

  useEffect(() => {
    // Fetch notifications summary
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
    <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-df-border px-4 lg:px-8 py-3 flex items-center justify-between gap-4">
      {/* Mobile hamburger + Greeting */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileNav}
          className="lg:hidden p-2 rounded-xl text-zinc-grey hover:text-charcoal hover:bg-mist-grey transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="text-xs text-zinc-grey font-medium hidden sm:block">
            {greeting}, <span className="font-semibold text-charcoal">{userName.split(' ')[0]}</span> 👋
          </div>
          <div className="text-xs font-mono text-zinc-grey sm:hidden">{employeeId}</div>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3">
        {/* Search bar */}
        <div className="relative hidden md:block w-64">
          <Search className="w-4 h-4 text-zinc-grey absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search anything... (Cmd+K)"
            className="w-full bg-mist-grey/70 text-xs text-charcoal placeholder:text-zinc-grey pl-9 pr-4 py-2 rounded-xl border border-df-border/60 focus:outline-none focus:border-royal-purple focus:bg-white transition-all"
          />
        </div>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications)
              setShowProfileMenu(false)
            }}
            className="relative p-2 rounded-xl text-zinc-grey hover:text-charcoal hover:bg-mist-grey transition-colors"
          >
            <motion.div
              animate={unreadCount > 0 ? { rotate: [0, -10, 10, -10, 0] } : {}}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 4 }}
            >
              <Bell className="w-5 h-5" />
            </motion.div>

            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-royal-purple rounded-full ring-2 ring-white animate-pulse" />
            )}
          </button>

          {/* Notifications dropdown */}
          <AnimatePresence>
            {showNotifications && (
              <motion.div
                className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl border border-df-border shadow-xl p-4 z-50"
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
              >
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-df-border">
                  <span className="font-semibold text-charcoal text-sm">Notifications</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-royal-purple font-medium hover:underline flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="text-center py-6 text-xs text-zinc-grey">
                      No recent notifications
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-2.5 rounded-xl text-xs transition-colors ${
                          n.isRead ? 'bg-cool-grey/50' : 'bg-lavender/50 font-medium'
                        }`}
                      >
                        <div className="font-semibold text-charcoal">{n.title}</div>
                        <div className="text-zinc-grey mt-0.5 line-clamp-2">{n.message}</div>
                        <div className="text-[10px] text-zinc-grey mt-1">{formatTimeAgo(n.createdAt)}</div>
                      </div>
                    ))
                  )}
                </div>

                <div className="mt-3 pt-2 border-t border-df-border text-center">
                  <Link
                    href={isAdmin ? '/admin/notifications' : '/notifications'}
                    className="text-xs text-royal-purple font-semibold hover:underline"
                    onClick={() => setShowNotifications(false)}
                  >
                    View all notifications
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
            className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-purple-200 transition-all"
          >
            <div className="w-9 h-9 rounded-full bg-royal-purple text-white font-bold flex items-center justify-center text-xs shadow-sm">
              {initials}
            </div>
          </button>

          {/* Profile Dropdown Menu */}
          <AnimatePresence>
            {showProfileMenu && (
              <motion.div
                className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-df-border shadow-xl p-2 z-50"
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
              >
                <div className="p-3 border-b border-df-border mb-1">
                  <div className="font-semibold text-charcoal text-sm truncate">{userName}</div>
                  <div className="text-xs text-zinc-grey truncate">{userEmail}</div>
                  <div className="text-[10px] font-mono bg-lavender text-royal-purple px-1.5 py-0.5 rounded inline-block mt-1">
                    {employeeId}
                  </div>
                </div>

                <Link
                  href={isAdmin ? '/admin/dashboard' : '/profile'}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-charcoal hover:bg-mist-grey rounded-xl transition-colors"
                  onClick={() => setShowProfileMenu(false)}
                >
                  <User className="w-4 h-4 text-zinc-grey" />
                  <span>My Profile</span>
                </Link>

                <Link
                  href={isAdmin ? '/admin/settings' : '/settings'}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-charcoal hover:bg-mist-grey rounded-xl transition-colors"
                  onClick={() => setShowProfileMenu(false)}
                >
                  <Settings className="w-4 h-4 text-zinc-grey" />
                  <span>Settings</span>
                </Link>

                <div className="border-t border-df-border my-1" />

                <button
                  onClick={() => signOut({ callbackUrl: '/sign-in' })}
                  className="flex items-center gap-2 w-full px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                >
                  <LogOut className="w-4 h-4 text-red-600" />
                  <span>Log out</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}
