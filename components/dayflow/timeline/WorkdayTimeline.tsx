'use client'

import { motion } from 'framer-motion'
import { Clock, CheckCircle2, Coffee, Briefcase, LogOut } from 'lucide-react'
import { formatTime } from '@/lib/utils'

type TimelineEvent = {
  id: string
  time: string
  title: string
  subtitle?: string
  status: 'completed' | 'active' | 'upcoming'
  icon: 'checkin' | 'working' | 'lunch' | 'checkout'
}

type WorkdayTimelineProps = {
  checkInTime?: Date | string | null
  checkOutTime?: Date | string | null
  status?: string
}

export function WorkdayTimeline({
  checkInTime,
  checkOutTime,
  status = 'NOT_MARKED',
}: WorkdayTimelineProps) {
  const isCheckedIn = !!checkInTime
  const isCheckedOut = !!checkOutTime

  const events: TimelineEvent[] = [
    {
      id: 'checkin',
      time: checkInTime ? formatTime(checkInTime) : '09:00 AM',
      title: 'Workday Check In',
      subtitle: isCheckedIn ? 'Checked in on time' : 'Expected check-in',
      status: isCheckedIn ? 'completed' : 'upcoming',
      icon: 'checkin',
    },
    {
      id: 'working_morning',
      time: '10:00 AM - 01:00 PM',
      title: 'Core Work Hours',
      subtitle: 'Focus session & team syncs',
      status: isCheckedIn && !isCheckedOut ? 'active' : isCheckedOut ? 'completed' : 'upcoming',
      icon: 'working',
    },
    {
      id: 'lunch',
      time: '01:00 PM - 02:00 PM',
      title: 'Lunch Break',
      subtitle: 'Recharge & rest',
      status: isCheckedOut ? 'completed' : 'upcoming',
      icon: 'lunch',
    },
    {
      id: 'checkout',
      time: checkOutTime ? formatTime(checkOutTime) : '06:00 PM',
      title: 'Workday Check Out',
      subtitle: isCheckedOut ? 'Completed workday' : 'Expected check-out',
      status: isCheckedOut ? 'completed' : 'upcoming',
      icon: 'checkout',
    },
  ]

  const getIcon = (type: TimelineEvent['icon']) => {
    switch (type) {
      case 'checkin':
        return CheckCircle2
      case 'working':
        return Briefcase
      case 'lunch':
        return Coffee
      case 'checkout':
        return LogOut
    }
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-df-border shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-semibold text-charcoal text-base">Today&apos;s Workday Flow</h3>
          <p className="text-xs text-zinc-grey">Real-time status tracking</p>
        </div>
        <div className="flex items-center gap-1.5 bg-lavender text-royal-purple text-xs font-semibold px-3 py-1.5 rounded-full">
          <Clock className="w-3.5 h-3.5" />
          <span>8 Hours Target</span>
        </div>
      </div>

      <div className="relative pl-6 space-y-6">
        {/* Animated vertical connecting line */}
        <motion.div
          className="absolute left-2.5 top-3 bottom-3 w-0.5 bg-gradient-to-b from-royal-purple via-soft-violet to-df-border rounded-full"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />

        {events.map((event, index) => {
          const IconComponent = getIcon(event.icon)
          return (
            <motion.div
              key={event.id}
              className="relative flex items-start gap-4"
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              {/* Dot / Icon */}
              <div
                className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center border-2 bg-white transition-all ${
                  event.status === 'completed'
                    ? 'border-green-500 text-green-600 bg-green-50'
                    : event.status === 'active'
                    ? 'border-royal-purple text-royal-purple bg-purple-50 ring-4 ring-purple-100'
                    : 'border-df-border text-zinc-grey'
                }`}
              >
                {event.status === 'active' && (
                  <motion.span
                    className="w-2 h-2 rounded-full bg-royal-purple"
                    animate={{ scale: [1, 1.4, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}
                {event.status === 'completed' && (
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                )}
              </div>

              {/* Event details */}
              <div className="flex-1 bg-cool-grey/60 rounded-xl p-3.5 border border-df-border/50 hover:bg-cool-grey transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-charcoal text-sm flex items-center gap-1.5">
                    <IconComponent className="w-4 h-4 text-royal-purple" />
                    {event.title}
                  </span>
                  <span className="font-mono text-xs font-medium text-zinc-grey bg-white px-2 py-0.5 rounded border border-df-border/60">
                    {event.time}
                  </span>
                </div>
                {event.subtitle && (
                  <p className="text-xs text-zinc-grey">{event.subtitle}</p>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
