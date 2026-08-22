'use client'

import { motion } from 'framer-motion'
import { Clock, CheckCircle2, Coffee, Briefcase, LogOut, AlertCircle } from 'lucide-react'
import { formatTime } from '@/lib/utils'

type TimelineEvent = {
  id: string
  time: string
  title: string
  subtitle?: string
  status: 'completed' | 'active' | 'upcoming' | 'late'
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

  // Determine if check in was late (after 09:15 AM)
  let isLate = false
  if (checkInTime) {
    const d = new Date(checkInTime)
    const hours = d.getHours()
    const minutes = d.getMinutes()
    if (hours > 9 || (hours === 9 && minutes > 15)) {
      isLate = true
    }
  }

  const events: TimelineEvent[] = [
    {
      id: 'checkin',
      time: checkInTime ? formatTime(checkInTime) : '09:00 AM',
      title: 'Workday Check In',
      subtitle: isCheckedIn
        ? isLate
          ? 'Late Check-In (Arrived after 09:15 AM)'
          : 'Checked in on time'
        : 'Expected 09:00 AM',
      status: isCheckedIn ? (isLate ? 'late' : 'completed') : 'upcoming',
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
      subtitle: isCheckedOut ? 'Completed workday' : 'Expected 06:00 PM',
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
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-bold text-slate-900 text-base">Today&apos;s Workday Flow</h3>
          <p className="text-xs text-slate-500 font-medium">Real-time status & arrival tracking</p>
        </div>
        <div className="flex items-center gap-1.5 bg-purple-50 text-purple-700 text-xs font-bold px-3 py-1.5 rounded-full border border-purple-100">
          <Clock className="w-3.5 h-3.5" />
          <span>8 Hours Target</span>
        </div>
      </div>

      <div className="relative pl-6 space-y-6">
        {/* Vertical connecting line */}
        <motion.div
          className="absolute left-2.5 top-3 bottom-3 w-0.5 bg-gradient-to-b from-purple-600 via-indigo-400 to-slate-200 rounded-full"
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
                  event.status === 'late'
                    ? 'border-red-500 text-red-600 bg-red-50 ring-4 ring-red-100'
                    : event.status === 'completed'
                    ? 'border-emerald-500 text-emerald-600 bg-emerald-50'
                    : event.status === 'active'
                    ? 'border-purple-600 text-purple-600 bg-purple-50 ring-4 ring-purple-100'
                    : 'border-slate-300 text-slate-400'
                }`}
              >
                {event.status === 'active' && (
                  <motion.span
                    className="w-2 h-2 rounded-full bg-purple-600"
                    animate={{ scale: [1, 1.4, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}
                {event.status === 'completed' && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                )}
                {event.status === 'late' && (
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                )}
              </div>

              {/* Event details */}
              <div className={`flex-1 rounded-xl p-3.5 border transition-colors ${
                event.status === 'late'
                  ? 'bg-red-50/50 border-red-200'
                  : 'bg-slate-50 border-slate-200/80 hover:bg-slate-100/60'
              }`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <IconComponent className={`w-4 h-4 ${event.status === 'late' ? 'text-red-500' : 'text-purple-600'}`} />
                    {event.title}
                  </span>
                  <span className={`font-mono text-xs font-semibold px-2 py-0.5 rounded border ${
                    event.status === 'late'
                      ? 'bg-red-100 text-red-700 border-red-300'
                      : 'bg-white text-slate-700 border-slate-200'
                  }`}>
                    {event.time}
                  </span>
                </div>
                {event.subtitle && (
                  <p className={`text-xs font-medium ${event.status === 'late' ? 'text-red-600 font-semibold flex items-center gap-1' : 'text-slate-500'}`}>
                    {event.status === 'late' && <AlertCircle className="w-3.5 h-3.5 text-red-500" />}
                    {event.subtitle}
                  </p>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
