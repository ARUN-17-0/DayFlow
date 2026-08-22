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
    <aside className="w-64 bg-slate-950 text-white h-screen flex flex-col justify-between p-4 fixed left-0 top-0 bottom-0 z-30 select-none hidden lg:flex border-r border-slate-800 shadow-2xl">
      <div>
        {/* Brand header */}
        <div className="px-3 py-4 mb-3">
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <DayflowLogo size="md" />
          </Link>
          <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-600 text-white shadow-md shadow-purple-600/30">
            <UserCheck className="w-3 h-3 text-white" />
            <span>{userRole === 'HR_OFFICER' ? 'HR Management Console' : 'Admin Control Panel'}</span>
          </div>
        </div>

        {/* Return to Personal My Day Link */}
        <div className="mb-4 mx-1 p-2 rounded-xl bg-slate-900 border border-slate-800 text-xs">
          <Link
            href="/my-day"
            className="inline-block w-full text-center bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold py-1.5 px-2 rounded-lg transition-colors text-[11px]"
          >
            ← Switch to My Personal View
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
                className={`relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'text-white font-bold bg-purple-600 shadow-md shadow-purple-600/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900'
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
      <div className="pt-4 border-t border-slate-800 space-y-3">
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="w-9 h-9 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center text-xs flex-shrink-0 shadow-md">
            {initials}
          </div>
          <div className="overflow-hidden flex-1">
            <div className="text-xs font-bold text-white truncate">{userName}</div>
            <div className="text-[11px] font-mono text-purple-400 truncate">{employeeId} • {userRole}</div>
          </div>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: '/sign-in' })}
          className="flex items-center gap-2.5 w-full px-3 py-2 text-xs font-semibold text-slate-400 hover:text-red-400 hover:bg-slate-900 rounded-xl transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  )
}
