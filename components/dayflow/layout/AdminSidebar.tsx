'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  Users,
  Clock,
  Calendar,
  IndianRupee,
  BarChart3,
  Bell,
  Settings,
  Shield,
  LogOut,
} from 'lucide-react'
import { DayflowLogo } from '../logo/DayflowLogo'
import { signOut, useSession } from 'next-auth/react'
import { getInitials } from '@/lib/utils'

const adminNavItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/employees', label: 'Employees', icon: Users },
  { href: '/admin/attendance', label: 'Attendance', icon: Clock },
  { href: '/admin/time-off', label: 'Time Off', icon: Calendar },
  { href: '/admin/payroll', label: 'Payroll', icon: IndianRupee },
  { href: '/admin/reports', label: 'Reports', icon: BarChart3 },
  { href: '/admin/notifications', label: 'Notifications', icon: Bell },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
  { href: '/admin/audit-log', label: 'Audit Log', icon: Shield },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  const userName = session?.user?.name || 'Admin User'
  const role = (session?.user as any)?.role || 'ADMIN'
  const initials = getInitials(userName.split(' ')[0] || 'A', userName.split(' ')[1] || 'D')

  return (
    <aside className="w-64 bg-charcoal text-white h-screen flex flex-col justify-between p-4 fixed left-0 top-0 bottom-0 z-30 select-none hidden lg:flex border-r border-zinc-800">
      <div>
        {/* Brand header + Admin Badge */}
        <div className="px-3 py-4 mb-4 flex items-center justify-between">
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <DayflowLogo size="md" />
          </Link>
          <span className="text-[10px] font-bold uppercase tracking-wider bg-royal-purple text-white px-2 py-0.5 rounded-full border border-purple-400/30">
            {role === 'HR_OFFICER' ? 'HR Portal' : 'Admin'}
          </span>
        </div>

        {/* Navigation list */}
        <nav className="space-y-1 relative">
          {adminNavItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin/dashboard' && pathname.startsWith(item.href))
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
                    layoutId="admin-sidebar-active-pill"
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
          <div className="w-9 h-9 rounded-full bg-soft-violet text-white font-bold flex items-center justify-center text-xs flex-shrink-0">
            {initials}
          </div>
          <div className="overflow-hidden flex-1">
            <div className="text-xs font-semibold text-white truncate">{userName}</div>
            <div className="text-[11px] font-medium text-purple-300 truncate">{role}</div>
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
