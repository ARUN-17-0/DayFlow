'use client'

import { useState } from 'react'
import { PageTransition } from '@/components/dayflow/animations/PageTransition'
import { PageHeader } from '@/components/dayflow/PageHeader'
import { Lock, Bell, Shield } from 'lucide-react'
import { toast } from 'sonner'

export default function EmployeeSettingsPage() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setLoading(true)
    setTimeout(() => {
      toast.success('Password updated successfully!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setLoading(false)
    }, 800)
  }

  return (
    <PageTransition>
      <PageHeader title="Account Settings" description="Manage your password and security settings." />

      <div className="bg-white rounded-2xl p-6 border border-df-border shadow-sm max-w-xl space-y-4">
        <h3 className="font-semibold text-charcoal text-base flex items-center gap-2">
          <Lock className="w-4 h-4 text-royal-purple" />
          Change Password
        </h3>

        <form onSubmit={handleChangePassword} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">Current Password</label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full bg-mist-grey/60 text-xs px-3 py-2.5 rounded-xl border border-df-border"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">New Password</label>
            <input
              type="password"
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-mist-grey/60 text-xs px-3 py-2.5 rounded-xl border border-df-border"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">Confirm New Password</label>
            <input
              type="password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-mist-grey/60 text-xs px-3 py-2.5 rounded-xl border border-df-border"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-royal-purple text-white text-xs font-semibold px-5 py-2.5 rounded-xl hover:bg-deep-violet"
          >
            {loading ? 'Updating Password...' : 'Update Password'}
          </button>
        </form>
      </div>
    </PageTransition>
  )
}
