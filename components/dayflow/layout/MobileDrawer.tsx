'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { X, LogOut } from 'lucide-react'
import { DayflowLogo } from '../logo/DayflowLogo'
import { signOut, useSession } from 'next-auth/react'

type MobileDrawerProps = {
  isOpen: boolean
  onClose: () => void
  navItems: Array<{ href: string; label: string; icon: any }>
}

export function MobileDrawer({ isOpen, onClose, navItems }: MobileDrawerProps) {
  const pathname = usePathname()
  const { data: session } = useSession()

  const userName = session?.user?.name || 'User'
  const userEmail = session?.user?.email || ''

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Drawer content */}
          <motion.div
            className="fixed top-0 bottom-0 left-0 w-72 bg-charcoal text-white p-5 flex flex-col justify-between z-10 shadow-2xl"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <div>
              {/* Header */}
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-800">
                <DayflowLogo size="md" />
                <button
                  onClick={onClose}
                  className="p-1 rounded-lg text-zinc-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation list */}
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.href || (item.href !== '/my-day' && pathname.startsWith(item.href))
                  const Icon = item.icon

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-royal-purple text-white'
                          : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                      }`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  )
                })}
              </nav>
            </div>

            {/* Bottom section */}
            <div className="pt-4 border-t border-zinc-800 space-y-3">
              <div className="px-2">
                <div className="text-xs font-semibold text-white truncate">{userName}</div>
                <div className="text-[11px] text-zinc-400 truncate">{userEmail}</div>
              </div>

              <button
                onClick={() => signOut({ callbackUrl: '/sign-in' })}
                className="flex items-center gap-2.5 w-full px-3 py-2 text-xs font-medium text-red-400 hover:bg-zinc-800 rounded-xl transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Log out</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
