'use client'

import { motion } from 'framer-motion'
import { LucideIcon, Inbox } from 'lucide-react'
import { ReactNode } from 'react'

type EmptyStateProps = {
  title?: string
  description?: string
  icon?: LucideIcon
  action?: ReactNode
  className?: string
}

export function EmptyState({
  title = 'No data available',
  description = 'There are no records to display at the moment.',
  icon: Icon = Inbox,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-df-border bg-white ${className}`}
    >
      <motion.div
        className="w-14 h-14 rounded-2xl bg-lavender flex items-center justify-center mb-4 text-royal-purple"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Icon className="w-7 h-7" />
      </motion.div>

      <h3 className="font-semibold text-charcoal text-base mb-1">{title}</h3>
      <p className="text-sm text-zinc-grey max-w-sm mb-6 leading-relaxed">
        {description}
      </p>

      {action && <div>{action}</div>}
    </div>
  )
}
