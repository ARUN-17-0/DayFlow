'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Sun,
  LayoutDashboard,
  User,
  Clock,
  Calendar,
  IndianRupee,
  FileText,
  Bell,
  Settings,
  LogOut,
} from 'lucide-react'
import { DayflowLogo } from '../logo/DayflowLogo'
import { signOut, useSession } from 'next-auth/react'
import { getInitials } from '@/lib/utils'

const navItems = [
  { href: '/my-day', label: 'My Day', icon: Sun },
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/profile', label: 'My Profile', icon: User },
  { href: '/attendance', label: 'Attendance', icon: Clock },
  { href: '/time-off', label: 'Time Off', icon: Calendar },
  { href: '/payroll', label: 'My Salary', icon: IndianRupee },
  { href: '/documents', label: 'Documents', icon: FileText },
  { href: '/notifications', label: 'Notifications', icon: Bell },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  const userName = session?.user?.name || 'Employee'
  const userEmail = session?.user?.email || ''
  const employeeId = (session?.user as any)?.employeeId || ''
  const initials = getInitials(userName.split(' ')[0] || 'E', userName.split(' ')[1] || 'P')

  return (
    <aside className="w-64 bg-charcoal text-white h-screen flex flex-col justify-between p-4 fixed left-0 top-0 bottom-0 z-30 select-none hidden lg:flex border-r border-zinc-800">
      <div>
        {/* Brand header */}
        <div className="px-3 py-4 mb-6">
          <Link href="/my-day" className="flex items-center gap-2">
            <DayflowLogo size="md" />
          </Link>
        </div>

        {/* Navigation list */}
        <nav className="space-y-1 relative">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/my-day' && pathname.startsWith(item.href))
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive ? 'text-white' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
                }`}
              >
                {/* Active indicator pill morph */}
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active-pill"
                    className="absolute inset-0 bg-royal-purple rounded-xl -z-10"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-zinc-400'}`} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* User profile bottom bar */}
      <div className="pt-4 border-t border-zinc-800 space-y-3">
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="w-9 h-9 rounded-full bg-royal-purple text-white font-bold flex items-center justify-center text-xs flex-shrink-0">
            {initials}
          </div>
          <div className="overflow-hidden flex-1">
            <div className="text-xs font-semibold text-white truncate">{userName}</div>
            <div className="text-[11px] font-mono text-zinc-400 truncate">{employeeId}</div>
          </div>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: '/sign-in' })}
          className="flex items-center gap-2.5 w-full px-3 py-2 text-xs font-medium text-zinc-400 hover:text-red-400 hover:bg-zinc-800/60 rounded-xl transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  )
}
