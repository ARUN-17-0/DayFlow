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
  accentColor = '#7C3AED',
  className = '',
  onClick,
}: StatCardProps) {
  return (
    <motion.div
      className={`bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 cursor-default relative overflow-hidden group ${className}`}
      whileHover={{ y: -2 }}
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
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
            {title}
          </span>
          <div className="text-2xl font-bold text-slate-800 tracking-tight">
            {value}
          </div>
        </div>

        {Icon && (
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
            style={{ backgroundColor: `${accentColor}12`, color: accentColor }}
          >
            <Icon className="w-4.5 h-4.5" />
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-xs">
        {change && (
          <div
            className={`inline-flex items-center gap-0.5 font-semibold ${
              change.isPositive ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {change.isPositive ? (
              <ArrowUpRight className="w-3.5 h-3.5" />
            ) : (
              <ArrowDownRight className="w-3.5 h-3.5" />
            )}
            <span>{change.value}</span>
            {change.label && (
              <span className="text-slate-400 font-normal ml-1">
                {change.label}
              </span>
            )}
          </div>
        )}

        {subtitle && !change && (
          <span className="text-slate-500">{subtitle}</span>
        )}
      </div>
    </motion.div>
  )
}
