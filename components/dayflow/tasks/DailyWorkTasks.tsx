'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckSquare, Square, FileText, Upload, Image as ImageIcon, Lock, CheckCircle2, Paperclip, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

type TaskItem = {
  id: string
  title: string
  category: string
  isCompleted: boolean
  proofType?: 'text' | 'file'
  proofText?: string
  fileName?: string
  completedAt?: string
}

const INITIAL_TASKS: TaskItem[] = [
  { id: 'task-1', title: 'Complete Core Work Focus Session & Code Review', category: 'Engineering', isCompleted: false },
  { id: 'task-2', title: 'Submit Daily Progress Update & Team Sync Notes', category: 'Operations', isCompleted: false },
  { id: 'task-3', title: 'Upload Deliverable Artifact / Work Documentation', category: 'Documentation', isCompleted: false },
]

export function DailyWorkTasks() {
  const [tasks, setTasks] = useState<TaskItem[]>(INITIAL_TASKS)
  const [activeTask, setActiveTask] = useState<TaskItem | null>(null)
  const [proofType, setProofType] = useState<'text' | 'file'>('text')
  const [proofText, setProofText] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  // Load saved task state from localStorage on mount (immutable persistence)
  useEffect(() => {
    try {
      const todayKey = `dayflow_tasks_${new Date().toISOString().split('T')[0]}`
      const saved = localStorage.getItem(todayKey)
      if (saved) {
        setTasks(JSON.parse(saved))
      }
    } catch {}
  }, [])

  const saveTasks = (updated: TaskItem[]) => {
    setTasks(updated)
    try {
      const todayKey = `dayflow_tasks_${new Date().toISOString().split('T')[0]}`
      localStorage.setItem(todayKey, JSON.stringify(updated))
    } catch {}
  }

  const handleOpenProofModal = (task: TaskItem) => {
    if (task.isCompleted) {
      toast.info('This task is already completed and proof has been permanently recorded.')
      return
    }
    setActiveTask(task)
    setProofText('')
    setSelectedFile(null)
  }

  const handleCompleteTask = () => {
    if (!activeTask) return

    if (proofType === 'text' && !proofText.trim()) {
      toast.error('Please enter text proof or link before marking as complete.')
      return
    }

    if (proofType === 'file' && !selectedFile) {
      toast.error('Please select a photo or document file as proof.')
      return
    }

    const updated = tasks.map((t) => {
      if (t.id === activeTask.id) {
        return {
          ...t,
          isCompleted: true,
          proofType,
          proofText: proofType === 'text' ? proofText : undefined,
          fileName: proofType === 'file' ? selectedFile?.name : undefined,
          completedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      }
      return t
    })

    saveTasks(updated)
    toast.success(`Task completed & proof recorded!`)
    setActiveTask(null)
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <CheckSquare className="w-4.5 h-4.5 text-purple-600" />
            Today&apos;s Work Tasks & Deliverable Proofs
          </h3>
          <p className="text-xs text-slate-500 font-medium">Tick tasks and submit photo/file/text proof of completion</p>
        </div>
        <div className="text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-100">
          {tasks.filter((t) => t.isCompleted).length} / {tasks.length} Completed
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`p-4 rounded-xl border transition-all ${
              task.isCompleted
                ? 'bg-emerald-50/50 border-emerald-200'
                : 'bg-slate-50 border-slate-200 hover:border-purple-300'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={() => handleOpenProofModal(task)}
                  className="mt-0.5 text-slate-400 hover:text-purple-600 transition-colors"
                >
                  {task.isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <Square className="w-5 h-5 text-slate-400 hover:text-purple-600" />
                  )}
                </button>

                <div>
                  <h4 className={`text-xs font-bold ${task.isCompleted ? 'text-slate-700 line-through' : 'text-slate-900'}`}>
                    {task.title}
                  </h4>
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                    {task.category}
                  </span>

                  {/* Proof badge if completed */}
                  {task.isCompleted && (
                    <div className="mt-2 flex items-center gap-2 text-xs font-medium text-emerald-800 bg-white p-2 rounded-lg border border-emerald-200 max-w-md">
                      <Lock className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span className="font-bold">Proof Locked ({task.completedAt}):</span>
                      {task.proofType === 'text' ? (
                        <span className="truncate">{task.proofText}</span>
                      ) : (
                        <span className="truncate flex items-center gap-1 font-mono text-[11px]">
                          <Paperclip className="w-3 h-3 text-emerald-600" />
                          {task.fileName}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {!task.isCompleted && (
                <button
                  onClick={() => handleOpenProofModal(task)}
                  className="text-xs font-bold text-purple-700 bg-purple-100 hover:bg-purple-600 hover:text-white px-3 py-1.5 rounded-lg transition-all shadow-sm"
                >
                  Attach Proof & Tick
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Submit Work Proof Modal */}
      <AnimatePresence>
        {activeTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveTask(null)}
            />

            <motion.div
              className="relative bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl w-full max-w-md z-10 space-y-4"
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  Submit Task Proof
                </h3>
                <button
                  onClick={() => setActiveTask(null)}
                  className="text-xs text-slate-500 hover:text-slate-800"
                >
                  ✕
                </button>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Selected Task
                </span>
                <p className="text-xs font-bold text-slate-900 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  {activeTask.title}
                </p>
              </div>

              {/* Proof Type Tabs */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">Select Proof Format</label>
                <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setProofType('text')}
                    className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                      proofType === 'text' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Text / Link
                  </button>
                  <button
                    type="button"
                    onClick={() => setProofType('file')}
                    className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                      proofType === 'file' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    Photo / File
                  </button>
                </div>
              </div>

              {proofType === 'text' ? (
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Completion Description or PR / Doc Link
                  </label>
                  <textarea
                    value={proofText}
                    onChange={(e) => setProofText(e.target.value)}
                    placeholder="E.g., Completed API routes refactoring and verified test suites..."
                    className="w-full bg-slate-50 text-xs text-slate-900 p-3 rounded-xl border border-slate-200 h-24 focus:outline-none focus:border-purple-600 font-medium"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Upload Photo Screenshot or Document File
                  </label>
                  <input
                    type="file"
                    accept="image/*,.pdf,.doc,.docx"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="w-full text-xs text-slate-700 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200"
                  />
                  {selectedFile && (
                    <p className="text-[11px] text-emerald-700 font-bold mt-2">
                      ✓ Selected: {selectedFile.name}
                    </p>
                  )}
                </div>
              )}

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTask(null)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCompleteTask}
                  className="flex-1 bg-purple-700 hover:bg-purple-800 text-white font-extrabold py-2.5 rounded-xl text-xs shadow-md shadow-purple-600/20"
                >
                  Save & Complete Task
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
