'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  Users,
  Clock,
  CalendarCheck,
  IndianRupee,
  BarChart3,
  Bell,
  Settings,
  ShieldAlert,
  LogOut,
  UserCheck,
} from 'lucide-react'
import { DayflowLogo } from '../logo/DayflowLogo'
import { signOut, useSession } from 'next-auth/react'
import { getInitials } from '@/lib/utils'

const adminNavItems = [
  { href: '/admin/dashboard', label: 'Admin Dashboard', icon: LayoutDashboard },
  { href: '/admin/employees', label: 'Employee Directory', icon: Users },
  { href: '/admin/attendance', label: 'Attendance Monitor', icon: Clock },
  { href: '/admin/time-off', label: 'Leave Approvals', icon: CalendarCheck },
  { href: '/admin/payroll', label: 'Payroll & Slips', icon: IndianRupee },
  { href: '/admin/reports', label: 'Reports & Analytics', icon: BarChart3 },
  { href: '/admin/notifications', label: 'Notifications', icon: Bell },
  { href: '/admin/settings', label: 'Company Settings', icon: Settings },
  { href: '/admin/audit-log', label: 'Audit Log', icon: ShieldAlert },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  const userName = session?.user?.name || 'Administrator'
  const userRole = (session?.user as any)?.role || 'ADMIN'
  const employeeId = (session?.user as any)?.employeeId || ''
  const initials = getInitials(userName.split(' ')[0] || 'A', userName.split(' ')[1] || 'D')

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 h-screen flex flex-col justify-between p-4 fixed left-0 top-0 bottom-0 z-30 select-none hidden lg:flex border-r border-slate-800 shadow-xl">
      <div>
        {/* Brand header */}
        <div className="px-3 py-4 mb-2">
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <DayflowLogo size="md" />
          </Link>
          <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-purple-900/60 text-purple-200 border border-purple-700/50">
            <UserCheck className="w-3 h-3 text-purple-300" />
            <span>{userRole === 'HR_OFFICER' ? 'HR Console' : 'Admin Console'}</span>
          </div>
        </div>

        {/* Return to Personal View Link */}
        <div className="mb-4 mx-1 p-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs">
          <Link
            href="/my-day"
            className="inline-block w-full text-center bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium py-1 px-2 rounded-lg transition-colors text-[11px]"
          >
            ← Personal My Day View
          </Link>
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
                className={`relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'text-white font-semibold bg-purple-700 shadow-md shadow-purple-900/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* User profile bottom bar */}
      <div className="pt-3 border-t border-slate-800 space-y-2.5">
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="w-8 h-8 rounded-full bg-purple-700 text-white font-bold flex items-center justify-center text-xs flex-shrink-0 shadow-sm">
            {initials}
          </div>
          <div className="overflow-hidden flex-1">
            <div className="text-xs font-semibold text-slate-200 truncate">{userName}</div>
            <div className="text-[10px] font-mono text-purple-300 truncate">{employeeId} • {userRole}</div>
          </div>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: '/sign-in' })}
          className="flex items-center gap-2 w-full px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-red-400 hover:bg-slate-800/60 rounded-xl transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  )
}
