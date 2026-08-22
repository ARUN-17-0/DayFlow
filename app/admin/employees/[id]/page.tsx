'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { PageTransition } from '@/components/dayflow/animations/PageTransition'
import { PageHeader } from '@/components/dayflow/PageHeader'
import { StatusChip } from '@/components/dayflow/StatusChip'
import { ArrowLeft, Save, ShieldAlert } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { getInitials } from '@/lib/utils'

export default function EditEmployeePage() {
  const params = useParams()
  const id = params?.id as string

  const [employee, setEmployee] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [role, setRole] = useState('EMPLOYEE')
  const [status, setStatus] = useState('ACTIVE')
  const [phone, setPhone] = useState('')

  useEffect(() => {
    if (!id) return
    fetch(`/api/employees/${id}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data) {
          const emp = res.data
          setEmployee(emp)
          setFirstName(emp.profile?.firstName || '')
          setLastName(emp.profile?.lastName || '')
          setRole(emp.role || 'EMPLOYEE')
          setStatus(emp.profile?.status || 'ACTIVE')
          setPhone(emp.profile?.phone || '')
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const res = await fetch(`/api/employees/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          role,
          status,
          phone,
        }),
      })

      const json = await res.json()
      if (json.success) {
        toast.success('Employee profile updated!')
      } else {
        toast.error(json.error || 'Failed to update')
      }
    } catch {
      toast.error('Update failed')
    } finally {
      setSaving(false)
    }
  }

  const initials = getInitials(firstName || 'E', lastName || 'P')

  return (
    <PageTransition>
      <PageHeader
        title={`Edit Employee — ${employee?.employeeId || id}`}
        description="Update employee details, role, or administrative status."
        actions={
          <Link
            href="/admin/employees"
            className="bg-white border border-df-border text-charcoal text-xs font-semibold px-4 py-2 rounded-xl hover:bg-mist-grey flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-df-border shadow-sm text-center h-fit">
          <div className="w-20 h-20 rounded-full bg-royal-purple text-white font-bold flex items-center justify-center text-xl mx-auto mb-3">
            {initials}
          </div>
          <h3 className="font-bold text-charcoal text-lg">{firstName} {lastName}</h3>
          <p className="text-xs text-zinc-grey mb-3">{employee?.email}</p>
          <StatusChip status={status} size="sm" />
        </div>

        <form onSubmit={handleSave} className="lg:col-span-2 bg-white rounded-2xl p-6 border border-df-border shadow-sm space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full bg-mist-grey/60 text-xs px-3 py-2 rounded-xl border border-df-border"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full bg-mist-grey/60 text-xs px-3 py-2 rounded-xl border border-df-border"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Role / Permissions</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-mist-grey/60 text-xs px-3 py-2 rounded-xl border border-df-border"
              >
                <option value="EMPLOYEE">Employee</option>
                <option value="HR_OFFICER">HR Officer</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Account Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-mist-grey/60 text-xs px-3 py-2 rounded-xl border border-df-border"
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="TERMINATED">Terminated</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">Phone Number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-mist-grey/60 text-xs px-3 py-2 rounded-xl border border-df-border"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="bg-[#6D28D9] hover:bg-[#5B21B6] text-white text-xs font-semibold px-6 py-2.5 rounded-xl flex items-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4 text-white" />
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </form>
      </div>
    </PageTransition>
  )
}
