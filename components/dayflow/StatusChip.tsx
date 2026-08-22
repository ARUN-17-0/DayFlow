'use client'

import { motion } from 'framer-motion'

type StatusChipProps = {
  status: string
  size?: 'sm' | 'md' | 'lg'
  showDot?: boolean
}

type StatusConfig = {
  label: string
  color: string
  bg: string
  dotColor: string
  pulse?: boolean
}

const statusMap: Record<string, StatusConfig> = {
  PRESENT: { label: 'Present', color: '#15803D', bg: '#DCFCE7', dotColor: '#22C55E', pulse: true },
  ABSENT: { label: 'Absent', color: '#B91C1C', bg: '#FEE2E2', dotColor: '#EF4444' },
  HALF_DAY: { label: 'Half Day', color: '#6B21A8', bg: '#F3E8FF', dotColor: '#A855F7' },
  ON_LEAVE: { label: 'On Leave', color: '#1D4ED8', bg: '#DBEAFE', dotColor: '#3B82F6' },
  WEEKEND: { label: 'Weekend', color: '#52525B', bg: '#F4F4F5', dotColor: '#A1A1AA' },
  HOLIDAY: { label: 'Holiday', color: '#B45309', bg: '#FEF3C7', dotColor: '#F59E0B' },
  NOT_MARKED: { label: 'Not Marked', color: '#71717A', bg: '#F4F4F5', dotColor: '#A1A1AA' },
  PENDING: { label: 'Pending', color: '#B45309', bg: '#FEF3C7', dotColor: '#F59E0B', pulse: true },
  APPROVED: { label: 'Approved', color: '#15803D', bg: '#DCFCE7', dotColor: '#22C55E' },
  REJECTED: { label: 'Rejected', color: '#B91C1C', bg: '#FEE2E2', dotColor: '#EF4444' },
  CANCELLED: { label: 'Cancelled', color: '#52525B', bg: '#F4F4F5', dotColor: '#A1A1AA' },
  ACTIVE: { label: 'Active', color: '#15803D', bg: '#DCFCE7', dotColor: '#22C55E', pulse: true },
  INACTIVE: { label: 'Inactive', color: '#52525B', bg: '#F4F4F5', dotColor: '#A1A1AA' },
  PAID: { label: 'Paid', color: '#15803D', bg: '#DCFCE7', dotColor: '#22C55E' },
  PROCESSED: { label: 'Processed', color: '#B45309', bg: '#FEF3C7', dotColor: '#F59E0B' },
  DRAFT: { label: 'Draft', color: '#52525B', bg: '#F4F4F5', dotColor: '#A1A1AA' },
}

export function StatusChip({ status, size = 'md', showDot = true }: StatusChipProps) {
  const config = statusMap[status.toUpperCase()] || {
    label: status,
    color: '#3F3F46',
    bg: '#F4F4F5',
    dotColor: '#71717A',
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs font-medium px-2.5 py-1 gap-1.5',
    lg: 'text-sm font-medium px-3 py-1.5 gap-2',
  }

  return (
    <span
      className={`inline-flex items-center rounded-full transition-colors ${sizeClasses[size]}`}
      style={{ backgroundColor: config.bg, color: config.color }}
    >
      {showDot && (
        <span className="relative flex h-2 w-2 items-center justify-center">
          {config.pulse && (
            <motion.span
              className="absolute inline-flex h-full w-full rounded-full opacity-75"
              style={{ backgroundColor: config.dotColor }}
              animate={{ scale: [1, 1.8, 1], opacity: [0.75, 0, 0.75] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}
          <span
            className="relative inline-flex h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: config.dotColor }}
          />
        </span>
      )}
      {config.label}
    </span>
  )
}
