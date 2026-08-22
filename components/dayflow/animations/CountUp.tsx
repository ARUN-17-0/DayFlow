'use client'

import { useEffect, useState } from 'react'
import { motion, useSpring, useTransform } from 'framer-motion'
import { formatCurrency } from '@/lib/utils'

type CountUpProps = {
  value: number
  isCurrency?: boolean
  symbol?: string
  duration?: number
  className?: string
}

export function CountUp({
  value,
  isCurrency = false,
  symbol = '₹',
  duration = 1.2,
  className = '',
}: CountUpProps) {
  const [displayVal, setDisplayVal] = useState(0)

  useEffect(() => {
    let startTimestamp: number | null = null
    const startValue = 0
    const endValue = value

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp
      const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1)
      const easeOutProgress = 1 - Math.pow(1 - progress, 3) // cubic ease-out
      const current = Math.floor(startValue + easeOutProgress * (endValue - startValue))

      setDisplayVal(current)

      if (progress < 1) {
        window.requestAnimationFrame(step)
      } else {
        setDisplayVal(endValue)
      }
    }

    window.requestAnimationFrame(step)
  }, [value, duration])

  const formatted = isCurrency
    ? formatCurrency(displayVal, symbol)
    : displayVal.toLocaleString('en-IN')

  return (
    <motion.span
      className={`inline-block font-numeric ${className}`}
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {formatted}
    </motion.span>
  )
}
