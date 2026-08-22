'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { PageTransition } from '@/components/dayflow/animations/PageTransition'
import { PageHeader } from '@/components/dayflow/PageHeader'
import { CountUp } from '@/components/dayflow/animations/CountUp'
import { User, Mail, Phone, Calendar, MapPin, Building, Shield, Upload, Check } from 'lucide-react'
import { toast } from 'sonner'
import { getInitials, formatDate } from '@/lib/utils'

export default function ProfilePage() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState<'overview' | 'personal' | 'job' | 'salary' | 'security'>('overview')
  const [employee, setEmployee] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Edit form state
  const [phone, setPhone] = useState('')
  const [dob, setDob] = useState('')
  const [gender, setGender] = useState('')
  const [address, setAddress] = useState('')
  const [emergency, setEmergency] = useState('')

  useEffect(() => {
    fetch('/api/employees/me')
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data) {
          setEmployee(res.data)
          const p = res.data.profile
          if (p) {
            setPhone(p.phone || '')
            setDob(p.dateOfBirth ? p.dateOfBirth.split('T')[0] : '')
            setGender(p.gender || 'Male')
            setAddress(p.address || '')
            setEmergency(p.emergencyContact || '')
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!employee) return
    setSaving(true)

    try {
      const res = await fetch(`/api/employees/${employee.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          dateOfBirth: dob,
          gender,
          address,
          emergencyContact: emergency,
        }),
      })

      const json = await res.json()
      if (json.success) {
        toast.success('Profile updated successfully!')
      } else {
        toast.error(json.error || 'Failed to update profile')
      }
    } catch {
      toast.error('Update failed')
    } finally {
      setSaving(false)
    }
  }

  const profile = employee?.profile
  const fullName = `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim() || 'Employee'
  const initials = getInitials(profile?.firstName || 'E', profile?.lastName || 'P')

  return (
    <PageTransition>
      <PageHeader title="My Profile" description="Manage your personal information and job details." />

      {/* Tabs */}
      <div className="flex border-b border-df-border mb-6 overflow-x-auto">
        {[
          { key: 'overview', label: 'Overview' },
          { key: 'personal', label: 'Personal Info' },
          { key: 'job', label: 'Job Details' },
          { key: 'salary', label: 'Salary Info' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-5 py-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === tab.key
                ? 'border-royal-purple text-royal-purple'
                : 'border-transparent text-zinc-grey hover:text-charcoal'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="bg-white rounded-2xl p-6 border border-df-border shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-royal-purple text-white font-bold flex items-center justify-center text-2xl shadow-lg shadow-purple-500/20">
              {initials}
            </div>
            <div>
              <h2 className="text-xl font-bold text-charcoal">{fullName}</h2>
              <p className="text-xs text-zinc-grey mt-0.5">{profile?.designation?.name || 'Software Engineer'}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="font-mono text-xs bg-lavender text-royal-purple px-2 py-0.5 rounded font-semibold">
                  {employee?.employeeId || 'EMP001'}
                </span>
                <span className="text-xs text-zinc-grey bg-cool-grey px-2 py-0.5 rounded">
                  {profile?.department?.name || 'Engineering'}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-df-border">
            <div className="flex items-center gap-3 text-xs text-charcoal">
              <Mail className="w-4 h-4 text-royal-purple" />
              <span>{employee?.email}</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-charcoal">
              <Phone className="w-4 h-4 text-royal-purple" />
              <span>{phone || '+91 96765 43210'}</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-charcoal">
              <Calendar className="w-4 h-4 text-royal-purple" />
              <span>Joined {profile?.joiningDate ? formatDate(profile.joiningDate) : '01/06/2022'}</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-charcoal">
              <MapPin className="w-4 h-4 text-royal-purple" />
              <span>{address || 'Bangalore, Karnataka'}</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'personal' && (
        <form onSubmit={handleUpdateProfile} className="bg-white rounded-2xl p-6 border border-df-border shadow-sm space-y-4 max-w-xl">
          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">Phone Number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-mist-grey/60 text-xs px-3 py-2 rounded-xl border border-df-border"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">Date of Birth</label>
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full bg-mist-grey/60 text-xs px-3 py-2 rounded-xl border border-df-border"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full bg-mist-grey/60 text-xs px-3 py-2 rounded-xl border border-df-border"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">Address</label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-mist-grey/60 text-xs px-3 py-2 rounded-xl border border-df-border h-20"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">Emergency Contact</label>
            <input
              type="text"
              value={emergency}
              onChange={(e) => setEmergency(e.target.value)}
              className="w-full bg-mist-grey/60 text-xs px-3 py-2 rounded-xl border border-df-border"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="bg-royal-purple text-white text-xs font-semibold px-5 py-2.5 rounded-xl hover:bg-deep-violet"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      )}

      {activeTab === 'job' && (
        <div className="bg-white rounded-2xl p-6 border border-df-border shadow-sm space-y-4 max-w-xl text-xs text-charcoal">
          <div className="flex justify-between py-2 border-b border-df-border">
            <span className="text-zinc-grey">Employee ID</span>
            <span className="font-mono font-semibold">{employee?.employeeId}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-df-border">
            <span className="text-zinc-grey">Department</span>
            <span className="font-semibold">{profile?.department?.name || 'Engineering'}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-df-border">
            <span className="text-zinc-grey">Designation</span>
            <span className="font-semibold">{profile?.designation?.name || 'Software Engineer'}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-df-border">
            <span className="text-zinc-grey">Employment Type</span>
            <span className="font-semibold">{profile?.employmentType || 'FULL_TIME'}</span>
          </div>
        </div>
      )}

      {activeTab === 'salary' && (
        <div className="bg-white rounded-2xl p-6 border border-df-border shadow-sm max-w-xl space-y-4">
          <h3 className="font-semibold text-charcoal text-sm">Salary Structure Overview (Read-Only)</h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 text-zinc-grey">
              <span>Basic Salary</span>
              <span className="font-mono font-semibold text-charcoal">₹50,000</span>
            </div>
            <div className="flex justify-between py-1 text-zinc-grey">
              <span>HRA</span>
              <span className="font-mono font-semibold text-charcoal">₹20,000</span>
            </div>
            <div className="flex justify-between py-1 text-zinc-grey">
              <span>Allowances</span>
              <span className="font-mono font-semibold text-charcoal">₹8,000</span>
            </div>
            <div className="flex justify-between py-1 border-t border-df-border pt-2 text-charcoal font-bold">
              <span>Gross Salary</span>
              <span className="font-mono text-royal-purple">₹78,000</span>
            </div>
            <div className="flex justify-between py-1 text-red-600">
              <span>Deductions (PF + Tax)</span>
              <span className="font-mono font-semibold">-₹8,000</span>
            </div>
            <div className="flex justify-between py-2 bg-lavender p-3 rounded-xl text-royal-purple font-bold text-sm">
              <span>Net Monthly Salary</span>
              <CountUp value={70000} isCurrency />
            </div>
          </div>
        </div>
      )}
    </PageTransition>
  )
}
