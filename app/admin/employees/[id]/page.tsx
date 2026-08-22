'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { PageTransition } from '@/components/dayflow/animations/PageTransition'
import { PageHeader } from '@/components/dayflow/PageHeader'
import { StatusChip } from '@/components/dayflow/StatusChip'
import { ArrowLeft, Save, Loader2, Building2, Briefcase } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { getInitials } from '@/lib/utils'

export default function EditEmployeePage() {
  const params = useParams()
  const id = params?.id as string

  const [employee, setEmployee] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Form fields
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [role, setRole] = useState('EMPLOYEE')
  const [status, setStatus] = useState('ACTIVE')
  const [phone, setPhone] = useState('')
  const [departmentId, setDepartmentId] = useState('')
  const [designationId, setDesignationId] = useState('')
  const [employmentType, setEmploymentType] = useState('FULL_TIME')
  const [joiningDate, setJoiningDate] = useState('')

  // Dropdown options
  const [departments, setDepartments] = useState<any[]>([])
  const [designations, setDesignations] = useState<any[]>([])

  useEffect(() => {
    if (!id) return

    // Load employee data + departments + designations in parallel
    Promise.all([
      fetch(`/api/employees/${id}`).then((r) => r.json()),
      fetch('/api/settings/departments').then((r) => r.json()),
      fetch('/api/settings/designations').then((r) => r.json()),
    ])
      .then(([empRes, deptRes, desigRes]) => {
        if (empRes.success && empRes.data) {
          const emp = empRes.data
          setEmployee(emp)
          setFirstName(emp.profile?.firstName || '')
          setLastName(emp.profile?.lastName || '')
          setRole(emp.role || 'EMPLOYEE')
          setStatus(emp.profile?.status || 'ACTIVE')
          setPhone(emp.profile?.phone || '')
          setDepartmentId(emp.profile?.departmentId || '')
          setDesignationId(emp.profile?.designationId || '')
          setEmploymentType(emp.profile?.employmentType || 'FULL_TIME')
          setJoiningDate(
            emp.profile?.joiningDate
              ? new Date(emp.profile.joiningDate).toISOString().slice(0, 10)
              : ''
          )
        }
        if (deptRes.success) setDepartments(deptRes.data || [])
        if (desigRes.success) setDesignations(desigRes.data || [])
      })
      .catch(() => toast.error('Failed to load employee data'))
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
          departmentId: departmentId || undefined,
          designationId: designationId || undefined,
          employmentType,
          joiningDate: joiningDate || undefined,
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

  if (loading) {
    return (
      <PageTransition>
        <div className="flex items-center justify-center py-24 gap-3 text-zinc-grey text-sm">
          <Loader2 className="w-5 h-5 animate-spin text-royal-purple" />
          Loading employee profile...
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <PageHeader
        title={`Edit Employee — ${employee?.employeeId || id}`}
        description="Update employee details, position, role, or administrative status."
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
        {/* Avatar card */}
        <div className="bg-white rounded-2xl p-6 border border-df-border shadow-sm text-center h-fit space-y-3">
          <div className="w-20 h-20 rounded-full bg-royal-purple text-white font-bold flex items-center justify-center text-xl mx-auto">
            {initials}
          </div>
          <h3 className="font-bold text-charcoal text-lg">{firstName} {lastName}</h3>
          <p className="text-xs text-zinc-grey">{employee?.email}</p>
          <div className="flex justify-center"><StatusChip status={status} size="sm" /></div>
          {departments.find((d: any) => d.id === departmentId) && (
            <div className="flex items-center justify-center gap-1.5 text-xs text-zinc-grey">
              <Building2 className="w-3.5 h-3.5" />
              {departments.find((d: any) => d.id === departmentId)?.name}
            </div>
          )}
          {designations.find((d: any) => d.id === designationId) && (
            <div className="flex items-center justify-center gap-1.5 text-xs text-zinc-grey">
              <Briefcase className="w-3.5 h-3.5" />
              {designations.find((d: any) => d.id === designationId)?.name}
            </div>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="lg:col-span-2 space-y-5">
          {/* ── Basic Info ── */}
          <div className="bg-white rounded-2xl p-6 border border-df-border shadow-sm space-y-4">
            <h4 className="font-bold text-charcoal text-sm border-b border-df-border pb-2">Basic Information</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full bg-mist-grey/60 text-xs px-3 py-2 rounded-xl border border-df-border focus:outline-none focus:border-royal-purple"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-mist-grey/60 text-xs px-3 py-2 rounded-xl border border-df-border focus:outline-none focus:border-royal-purple"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-mist-grey/60 text-xs px-3 py-2 rounded-xl border border-df-border focus:outline-none focus:border-royal-purple"
              />
            </div>
          </div>

          {/* ── Position ── */}
          <div className="bg-white rounded-2xl p-6 border border-df-border shadow-sm space-y-4">
            <h4 className="font-bold text-charcoal text-sm border-b border-df-border pb-2 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-royal-purple" />
              Position & Department
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">Department</label>
                <select
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  className="w-full bg-mist-grey/60 text-xs px-3 py-2 rounded-xl border border-df-border focus:outline-none focus:border-royal-purple"
                >
                  <option value="">— Select Department —</option>
                  {departments.map((d: any) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">Designation / Title</label>
                <select
                  value={designationId}
                  onChange={(e) => setDesignationId(e.target.value)}
                  className="w-full bg-mist-grey/60 text-xs px-3 py-2 rounded-xl border border-df-border focus:outline-none focus:border-royal-purple"
                >
                  <option value="">— Select Designation —</option>
                  {designations.map((d: any) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">Employment Type</label>
                <select
                  value={employmentType}
                  onChange={(e) => setEmploymentType(e.target.value)}
                  className="w-full bg-mist-grey/60 text-xs px-3 py-2 rounded-xl border border-df-border focus:outline-none focus:border-royal-purple"
                >
                  <option value="FULL_TIME">Full Time</option>
                  <option value="PART_TIME">Part Time</option>
                  <option value="CONTRACT">Contract</option>
                  <option value="INTERN">Intern</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">Joining Date</label>
                <input
                  type="date"
                  value={joiningDate}
                  onChange={(e) => setJoiningDate(e.target.value)}
                  className="w-full bg-mist-grey/60 text-xs px-3 py-2 rounded-xl border border-df-border focus:outline-none focus:border-royal-purple"
                />
              </div>
            </div>
          </div>

          {/* ── Access & Status ── */}
          <div className="bg-white rounded-2xl p-6 border border-df-border shadow-sm space-y-4">
            <h4 className="font-bold text-charcoal text-sm border-b border-df-border pb-2">Access & Status</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">Role / Permissions</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-mist-grey/60 text-xs px-3 py-2 rounded-xl border border-df-border focus:outline-none focus:border-royal-purple"
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
                  className="w-full bg-mist-grey/60 text-xs px-3 py-2 rounded-xl border border-df-border focus:outline-none focus:border-royal-purple"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="ON_PROBATION">On Probation</option>
                  <option value="TERMINATED">Terminated</option>
                </select>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="bg-[#6D28D9] hover:bg-[#5B21B6] text-white text-xs font-semibold px-6 py-3 rounded-xl flex items-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </PageTransition>
  )
}
