'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Clock, CheckCircle2, Coffee, Briefcase, LogOut, Paperclip, Upload, FileText, Check, AlertCircle } from 'lucide-react'
import { formatTime } from '@/lib/utils'
import { toast } from 'sonner'

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

  // Calculate late check-in (after 09:15 AM)
  const checkInDate = checkInTime ? new Date(checkInTime) : null
  const isLate = checkInDate
    ? (checkInDate.getHours() > 9 || (checkInDate.getHours() === 9 && checkInDate.getMinutes() > 15))
    : false

  // Tasks state with completed tick & proof attachment
  const [tasks, setTasks] = useState<{ [key: string]: { completed: boolean; proofText?: string; proofFileName?: string } }>({
    checkin: { completed: isCheckedIn },
    working_morning: { completed: false },
    lunch: { completed: false },
    checkout: { completed: isCheckedOut },
  })

  const [activeProofModal, setActiveProofModal] = useState<string | null>(null)
  const [proofInput, setProofInput] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const toggleTask = (taskId: string) => {
    setTasks((prev) => ({
      ...prev,
      [taskId]: {
        ...prev[taskId],
        completed: !prev[taskId]?.completed,
      },
    }))
    toast.success('Task status updated!')
  }

  const handleSaveProof = (taskId: string) => {
    if (!proofInput && !selectedFile) {
      toast.error('Please enter a note or upload a photo/file as proof')
      return
    }

    setTasks((prev) => ({
      ...prev,
      [taskId]: {
        completed: true,
        proofText: proofInput,
        proofFileName: selectedFile?.name,
      },
    }))

    setActiveProofModal(null)
    setProofInput('')
    setSelectedFile(null)
    toast.success('Workday proof attached & task completed!')
  }

  const events = [
    {
      id: 'checkin',
      time: checkInTime ? formatTime(checkInTime) : '09:00 AM',
      title: 'Workday Check In',
      subtitle: isCheckedIn
        ? isLate
          ? `Checked in late at ${formatTime(checkInTime)} (Expected 09:00 AM)`
          : `Checked in on time at ${formatTime(checkInTime)}`
        : 'Expected check-in (09:00 AM)',
      status: isCheckedIn ? (isLate ? 'late' : 'completed') : 'upcoming',
      icon: CheckCircle2,
    },
    {
      id: 'working_morning',
      time: '10:00 AM - 01:00 PM',
      title: 'Core Work Hours & Standup',
      subtitle: 'Focus session, code reviews & team syncs',
      status: isCheckedIn && !isCheckedOut ? 'active' : isCheckedOut ? 'completed' : 'upcoming',
      icon: Briefcase,
    },
    {
      id: 'lunch',
      time: '01:00 PM - 02:00 PM',
      title: 'Lunch Break',
      subtitle: 'Recharge & rest',
      status: isCheckedOut ? 'completed' : 'upcoming',
      icon: Coffee,
    },
    {
      id: 'checkout',
      time: checkOutTime ? formatTime(checkOutTime) : '06:00 PM',
      title: 'Workday Check Out & Deliverables',
      subtitle: isCheckedOut ? 'Completed workday' : 'Expected check-out (06:00 PM)',
      status: isCheckedOut ? 'completed' : 'upcoming',
      icon: LogOut,
    },
  ]

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-900 text-base">Today&apos;s Workday Flow & Tasks</h3>
          <p className="text-xs text-slate-500 font-medium">Tick tasks and attach proof (notes, photos, files)</p>
        </div>
        <div className="flex items-center gap-1.5 bg-purple-100 text-purple-800 text-xs font-bold px-3 py-1.5 rounded-full border border-purple-200">
          <Clock className="w-3.5 h-3.5 text-purple-700" />
          <span>8 Hours Target</span>
        </div>
      </div>

      <div className="relative pl-6 space-y-6">
        {/* Vertical connecting line */}
        <motion.div
          className="absolute left-2.5 top-3 bottom-3 w-0.5 bg-gradient-to-b from-purple-700 via-purple-300 to-slate-200 rounded-full"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />

        {events.map((event, index) => {
          const IconComponent = event.icon
          const taskData = tasks[event.id]
          const isCompleted = taskData?.completed || event.status === 'completed'
          const isLateCheckIn = event.id === 'checkin' && isCheckedIn && isLate

          return (
            <motion.div
              key={event.id}
              className="relative flex items-start gap-4"
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              {/* Dot / Icon (RED DOT FOR LATE CHECK-IN) */}
              <div
                className={`absolute -left-6 top-1 w-5 h-5 rounded-full flex items-center justify-center border-2 bg-white transition-all ${
                  isLateCheckIn
                    ? 'border-rose-600 text-rose-600 bg-rose-50 ring-4 ring-rose-100'
                    : isCompleted
                    ? 'border-emerald-600 text-emerald-600 bg-emerald-50'
                    : event.status === 'active'
                    ? 'border-purple-600 text-purple-600 bg-purple-50 ring-4 ring-purple-100'
                    : 'border-slate-300 text-slate-400'
                }`}
              >
                {isLateCheckIn ? (
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
                ) : isCompleted ? (
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                ) : event.status === 'active' ? (
                  <motion.span
                    className="w-2 h-2 rounded-full bg-purple-600"
                    animate={{ scale: [1, 1.4, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                ) : null}
              </div>

              {/* Task Details Card */}
              <div className={`flex-1 rounded-2xl p-4 border transition-all ${
                isLateCheckIn
                  ? 'bg-rose-50/50 border-rose-200'
                  : isCompleted
                  ? 'bg-slate-50/90 border-slate-200'
                  : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-3">
                    {/* Checkbox to tick task */}
                    <input
                      type="checkbox"
                      checked={isCompleted}
                      onChange={() => toggleTask(event.id)}
                      className="w-4 h-4 rounded text-purple-600 border-slate-300 focus:ring-purple-500 cursor-pointer"
                    />

                    <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                      <IconComponent className={`w-4 h-4 ${isLateCheckIn ? 'text-rose-600' : 'text-purple-700'}`} />
                      {event.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isLateCheckIn && (
                      <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-md border border-rose-300">
                        <AlertCircle className="w-3 h-3 text-rose-600" />
                        LATE CHECK-IN
                      </span>
                    )}
                    <span className="font-mono text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200">
                      {event.time}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 font-medium pl-7 mb-2">{event.subtitle}</p>

                {/* Proof Section */}
                <div className="pl-7 pt-2 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-2">
                  {taskData?.proofText || taskData?.proofFileName ? (
                    <div className="flex items-center gap-2 text-xs bg-emerald-50 text-emerald-800 p-2 rounded-xl border border-emerald-200">
                      <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <div className="font-medium">
                        {taskData.proofText && <span>Proof Note: {taskData.proofText}</span>}
                        {taskData.proofFileName && (
                          <span className="block text-[11px] font-mono text-emerald-700">
                            📎 File Attached: {taskData.proofFileName}
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setActiveProofModal(event.id)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-xl border border-purple-200 transition-colors"
                    >
                      <Paperclip className="w-3.5 h-3.5" />
                      Attach Workday Proof (Note / Photo / File)
                    </button>
                  )}
                </div>

                {/* Proof Modal Dialog */}
                {activeProofModal === event.id && (
                  <div className="mt-3 p-4 bg-slate-900 text-white rounded-2xl space-y-3">
                    <div className="text-xs font-bold text-slate-200">Add Proof for: {event.title}</div>
                    
                    <div>
                      <label className="block text-[11px] text-slate-300 font-semibold mb-1">Work Note / Link Proof</label>
                      <input
                        type="text"
                        value={proofInput}
                        onChange={(e) => setProofInput(e.target.value)}
                        placeholder="e.g. Completed morning standup & committed PR #104"
                        className="w-full bg-slate-800 text-xs text-white placeholder:text-slate-500 px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-300 font-semibold mb-1">Upload File / Photo Proof</label>
                      <input
                        type="file"
                        accept="image/*,.pdf,.txt"
                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                        className="w-full text-xs text-slate-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-500 cursor-pointer"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        onClick={() => setActiveProofModal(null)}
                        className="text-xs text-slate-400 hover:text-white px-3 py-1.5"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSaveProof(event.id)}
                        className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-4 py-1.5 rounded-xl shadow-md"
                      >
                        Save Proof
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
