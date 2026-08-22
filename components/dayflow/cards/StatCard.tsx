'use client'

import { motion } from 'framer-motion'
import { LucideIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react'

type StatCardProps = {
  title: string
  value: string | number
  change?: {
    value: string
    isPositive: boolean
    label?: string
  }
  icon?: LucideIcon
  subtitle?: string
  accentColor?: string
  className?: string
  onClick?: () => void
}

export function StatCard({
  title,
  value,
  change,
  icon: Icon,
  subtitle,
  accentColor = '#6D28D9',
  className = '',
  onClick,
}: StatCardProps) {
  return (
    <motion.div
      className={`bg-white rounded-2xl p-5 border border-df-border shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-default relative overflow-hidden group ${className}`}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
    >
      {/* Top accent bar */}
      <div
        className="absolute top-0 left-0 right-0 h-1 transition-opacity opacity-0 group-hover:opacity-100"
        style={{ backgroundColor: accentColor }}
      />

      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <span className="text-xs font-medium text-zinc-grey uppercase tracking-wider block mb-1">
            {title}
          </span>
          <div className="text-2xl font-bold text-charcoal tracking-tight">
            {value}
          </div>
        </div>

        {Icon && (
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
            style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
          >
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-xs">
        {change && (
          <div
            className={`inline-flex items-center gap-0.5 font-semibold ${
              change.isPositive ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {change.isPositive ? (
              <ArrowUpRight className="w-3.5 h-3.5" />
            ) : (
              <ArrowDownRight className="w-3.5 h-3.5" />
            )}
            <span>{change.value}</span>
            {change.label && (
              <span className="text-zinc-grey font-normal ml-1">
                {change.label}
              </span>
            )}
          </div>
        )}

        {subtitle && !change && (
          <span className="text-zinc-grey">{subtitle}</span>
        )}
      </div>
    </motion.div>
  )
}
