'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/dayflow/layout/Sidebar'
import { Topbar } from '@/components/dayflow/layout/Topbar'
import { MobileDrawer } from '@/components/dayflow/layout/MobileDrawer'
import { Sun, LayoutDashboard, User, Clock, Calendar, IndianRupee, FileText, Bell, Settings } from 'lucide-react'

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

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <div className="min-h-screen bg-cool-grey flex">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Drawer */}
      <MobileDrawer
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        navItems={navItems}
      />

      {/* Main Container */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        <Topbar onOpenMobileNav={() => setMobileNavOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  )
}
