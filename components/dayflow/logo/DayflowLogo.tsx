'use client'

import { motion } from 'framer-motion'

type Props = {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'full' | 'mark'
  animated?: boolean
  className?: string
}

export function DayflowLogo({ size = 'md', variant = 'full', animated = true, className = '' }: Props) {
  const sizeMap = {
    sm: { icon: 24, text: 'text-lg' },
    md: { icon: 32, text: 'text-xl' },
    lg: { icon: 44, text: 'text-2xl' },
  }
  const s = sizeMap[size]

  const Mark = () => (
    <motion.svg
      width={s.icon}
      height={s.icon}
      viewBox="0 0 32 32"
      fill="none"
      initial={animated ? { opacity: 0, scale: 0.8 } : {}}
      animate={animated ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <defs>
        <linearGradient id="df-logo-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#6D28D9" />
        </linearGradient>
      </defs>
      <motion.path
        d="M6 4 h10 a12 12 0 0 1 0 24 H6 Z"
        fill="url(#df-logo-grad)"
        initial={animated ? { pathLength: 0 } : {}}
        animate={animated ? { pathLength: 1 } : {}}
        transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }}
      />
      <motion.path
        d="M10 10 h6 a6 6 0 0 1 0 12 h-6 Z"
        fill="white"
        opacity={0.25}
        initial={animated ? { opacity: 0 } : {}}
        animate={animated ? { opacity: 0.25 } : {}}
        transition={{ delay: 0.5 }}
      />
    </motion.svg>
  )

  if (variant === 'mark') return <Mark />

  return (
    <motion.div
      className={`flex items-center gap-2.5 select-none ${className}`}
      initial={animated ? { opacity: 0, x: -10 } : {}}
      animate={animated ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <Mark />
      <span className={`font-bold tracking-tight text-charcoal ${s.text}`}>
        Dayflow
      </span>
    </motion.div>
  )
}
