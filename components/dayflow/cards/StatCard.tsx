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
      className={`bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 cursor-default relative overflow-hidden group ${className}`}
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
          <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
            {title}
          </span>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {value}
          </div>
        </div>

        {Icon && (
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors shadow-sm"
            style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
          >
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-xs">
        {change && (
          <div
            className={`inline-flex items-center gap-0.5 font-bold ${
              change.isPositive ? 'text-green-700' : 'text-red-700'
            }`}
          >
            {change.isPositive ? (
              <ArrowUpRight className="w-3.5 h-3.5" />
            ) : (
              <ArrowDownRight className="w-3.5 h-3.5" />
            )}
            <span>{change.value}</span>
            {change.label && (
              <span className="text-slate-600 font-medium ml-1">
                {change.label}
              </span>
            )}
          </div>
        )}

        {subtitle && !change && (
          <span className="text-slate-600 font-medium">{subtitle}</span>
        )}
      </div>
    </motion.div>
  )
}
