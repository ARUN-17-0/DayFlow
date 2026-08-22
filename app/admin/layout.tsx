'use client'

import { useState } from 'react'
import { AdminSidebar } from '@/components/dayflow/layout/AdminSidebar'
import { Topbar } from '@/components/dayflow/layout/Topbar'
import { MobileDrawer } from '@/components/dayflow/layout/MobileDrawer'
import { LayoutDashboard, Users, Clock, Calendar, IndianRupee, BarChart3, Bell, Settings, Shield } from 'lucide-react'

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

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <div className="min-h-screen bg-cool-grey flex">
      {/* Admin Desktop Sidebar */}
      <AdminSidebar />

      {/* Mobile Drawer */}
      <MobileDrawer
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        navItems={adminNavItems}
      />

      {/* Main Container */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        <Topbar onOpenMobileNav={() => setMobileNavOpen(true)} isAdmin />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  )
}
