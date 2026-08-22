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
  ShieldCheck,
  Briefcase,
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
  const userRole = (session?.user as any)?.role || 'EMPLOYEE'
  const employeeId = (session?.user as any)?.employeeId || ''
  const initials = getInitials(userName.split(' ')[0] || 'E', userName.split(' ')[1] || 'P')

  const isManagement = ['ADMIN', 'HR_OFFICER'].includes(userRole)

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 h-screen flex flex-col justify-between p-4 fixed left-0 top-0 bottom-0 z-30 select-none hidden lg:flex border-r border-slate-800 shadow-xl">
      <div>
        {/* Brand header */}
        <div className="px-3 py-4 mb-2">
          <Link href="/my-day" className="flex items-center gap-2">
            <DayflowLogo size="md" />
          </Link>
          <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
            <Briefcase className="w-3 h-3 text-purple-400" />
            <span>{userRole === 'HR_OFFICER' ? 'HR Officer Portal' : userRole === 'ADMIN' ? 'Admin Portal' : 'Employee Portal'}</span>
          </div>
        </div>

        {/* HR / Admin Switcher Notice */}
        {isManagement && (
          <div className="mb-4 mx-1 p-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-xs">
            <div className="flex items-center justify-between text-slate-300 font-medium mb-1">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                {userRole === 'HR_OFFICER' ? 'HR Access' : 'Admin Access'}
              </span>
            </div>
            <Link
              href="/admin/dashboard"
              className="inline-block w-full text-center bg-purple-700 hover:bg-purple-600 text-white font-medium py-1.5 px-2 rounded-lg transition-colors text-[11px] mt-1 shadow-sm"
            >
              Open Management Console →
            </Link>
          </div>
        )}

        {/* Navigation list */}
        <nav className="space-y-1 relative">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/my-day' && pathname.startsWith(item.href))
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
            <div className="text-[10px] font-mono text-slate-400 truncate">{employeeId} • {userRole}</div>
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
