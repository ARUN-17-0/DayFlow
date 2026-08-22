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
    <aside className="w-64 bg-slate-900 text-white h-screen flex flex-col justify-between p-4 fixed left-0 top-0 bottom-0 z-30 select-none hidden lg:flex border-r border-slate-800 shadow-2xl">
      <div>
        {/* Brand header */}
        <div className="px-3 py-4 mb-3">
          <Link href="/my-day" className="flex items-center gap-2">
            <DayflowLogo size="md" />
          </Link>
          {/* Role Pill */}
          <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-950 text-purple-300 border border-purple-800/60">
            <Briefcase className="w-3 h-3 text-purple-400" />
            <span>{userRole === 'HR_OFFICER' ? 'HR Officer Portal' : userRole === 'ADMIN' ? 'Admin Portal' : 'Employee Portal'}</span>
          </div>
        </div>

        {/* HR / Admin Switcher Notice */}
        {isManagement && (
          <div className="mb-4 mx-1 p-2.5 rounded-xl bg-purple-950/80 border border-purple-700/60 text-xs">
            <div className="flex items-center justify-between text-purple-200 font-semibold mb-1">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                {userRole === 'HR_OFFICER' ? 'HR Access' : 'Admin Access'}
              </span>
            </div>
            <Link
              href="/admin/dashboard"
              className="inline-block w-full text-center bg-purple-600 hover:bg-purple-500 text-white font-bold py-1.5 px-2 rounded-lg transition-colors text-[11px] mt-1 shadow-sm"
            >
              Open HR Management Console →
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
                className={`relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'text-white font-bold bg-purple-600 shadow-md shadow-purple-600/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
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
            <div className="text-[11px] font-mono text-purple-300 truncate">{employeeId} • {userRole}</div>
          </div>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: '/sign-in' })}
          className="flex items-center gap-2.5 w-full px-3 py-2 text-xs font-semibold text-slate-400 hover:text-red-400 hover:bg-slate-800/80 rounded-xl transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  )
}
