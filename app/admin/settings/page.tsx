'use client'

import { useState, useEffect } from 'react'
import { PageTransition } from '@/components/dayflow/animations/PageTransition'
import { PageHeader } from '@/components/dayflow/PageHeader'
import { Building, Clock, IndianRupee, Save, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

export default function CompanySettingsPage() {
  const [activeTab, setActiveTab] = useState<'company' | 'departments' | 'designations' | 'policy'>('company')
  const [companyName, setCompanyName] = useState('Dayflow Technologies Pvt Ltd')
  const [currency, setCurrency] = useState('INR')
  const [currencySymbol, setCurrencySymbol] = useState('₹')
  const [workStartTime, setWorkStartTime] = useState('09:00')
  const [workEndTime, setWorkEndTime] = useState('18:00')

  const [departments, setDepartments] = useState<any[]>([])
  const [newDeptName, setNewDeptName] = useState('')

  const [designations, setDesignations] = useState<any[]>([])
  const [newDesigName, setNewDesigName] = useState('')

  const fetchSettings = async () => {
    try {
      const [deptRes, desigRes] = await Promise.all([
        fetch('/api/settings/departments'),
        fetch('/api/settings/designations'),
      ])
      const deptJson = await deptRes.json()
      const desigJson = await desigRes.json()

      if (deptJson.success) setDepartments(deptJson.data || [])
      if (desigJson.success) setDesignations(desigJson.data || [])
    } catch {}
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  const handleSaveCompany = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_name: companyName,
          currency,
          currency_symbol: currencySymbol,
          work_start_time: workStartTime,
          work_end_time: workEndTime,
        }),
      })

      const json = await res.json()
      if (json.success) toast.success('Company settings saved!')
      else toast.error('Failed to save settings')
    } catch {
      toast.error('Save failed')
    }
  }

  const handleAddDept = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newDeptName.trim()) return

    try {
      const res = await fetch('/api/settings/departments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newDeptName }),
      })
      const json = await res.json()
      if (json.success) {
        toast.success('Department created!')
        setNewDeptName('')
        fetchSettings()
      } else {
        toast.error(json.error || 'Failed to create department')
      }
    } catch {
      toast.error('Create failed')
    }
  }

  const handleAddDesig = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newDesigName.trim()) return

    try {
      const res = await fetch('/api/settings/designations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newDesigName, level: 1 }),
      })
      const json = await res.json()
      if (json.success) {
        toast.success('Designation created!')
        setNewDesigName('')
        fetchSettings()
      } else {
        toast.error(json.error || 'Failed to create designation')
      }
    } catch {
      toast.error('Create failed')
    }
  }

  return (
    <PageTransition>
      <PageHeader
        title="Company Settings"
        description="Configure organization profile, departments, designations, and working policies."
      />

      {/* Tabs */}
      <div className="flex border-b border-df-border mb-6 overflow-x-auto">
        {[
          { key: 'company', label: 'Company Profile' },
          { key: 'departments', label: 'Departments' },
          { key: 'designations', label: 'Designations' },
          { key: 'policy', label: 'Attendance & Leave Policy' },
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

      {activeTab === 'company' && (
        <form onSubmit={handleSaveCompany} className="bg-white rounded-2xl p-6 border border-df-border shadow-sm max-w-xl space-y-4">
          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">Company Name</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full bg-mist-grey/60 text-xs px-3 py-2.5 rounded-xl border border-df-border"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Default Currency</label>
              <select
                value={currency}
                onChange={(e) => {
                  setCurrency(e.target.value)
                  if (e.target.value === 'INR') setCurrencySymbol('₹')
                  else if (e.target.value === 'USD') setCurrencySymbol('$')
                  else if (e.target.value === 'EUR') setCurrencySymbol('€')
                }}
                className="w-full bg-mist-grey/60 text-xs px-3 py-2.5 rounded-xl border border-df-border"
              >
                <option value="INR">INR (Indian Rupee - ₹)</option>
                <option value="USD">USD (US Dollar - $)</option>
                <option value="EUR">EUR (Euro - €)</option>
                <option value="GBP">GBP (British Pound - £)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Currency Symbol</label>
              <input
                type="text"
                value={currencySymbol}
                onChange={(e) => setCurrencySymbol(e.target.value)}
                className="w-full bg-mist-grey/60 text-xs px-3 py-2.5 rounded-xl border border-df-border font-mono font-bold"
              />
            </div>
          </div>

          <button
            type="submit"
            className="bg-royal-purple text-white text-xs font-semibold px-6 py-2.5 rounded-xl hover:bg-deep-violet flex items-center gap-1.5 shadow-md shadow-purple-500/20"
          >
            <Save className="w-4 h-4" />
            Save Profile Settings
          </button>
        </form>
      )}

      {activeTab === 'departments' && (
        <div className="space-y-6 max-w-xl">
          <form onSubmit={handleAddDept} className="bg-white rounded-2xl p-4 border border-df-border flex gap-3">
            <input
              type="text"
              placeholder="New department name..."
              value={newDeptName}
              onChange={(e) => setNewDeptName(e.target.value)}
              className="flex-1 bg-mist-grey/60 text-xs px-3 py-2 rounded-xl border border-df-border"
            />
            <button
              type="submit"
              className="bg-royal-purple text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-deep-violet flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </form>

          <div className="bg-white rounded-2xl border border-df-border shadow-sm divide-y divide-df-border/60">
            {departments.map((d) => (
              <div key={d.id} className="p-3.5 flex items-center justify-between text-xs text-charcoal">
                <span className="font-semibold">{d.name}</span>
                <span className="text-zinc-grey font-mono">{d._count?.employees || 0} employees</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'designations' && (
        <div className="space-y-6 max-w-xl">
          <form onSubmit={handleAddDesig} className="bg-white rounded-2xl p-4 border border-df-border flex gap-3">
            <input
              type="text"
              placeholder="New designation name..."
              value={newDesigName}
              onChange={(e) => setNewDesigName(e.target.value)}
              className="flex-1 bg-mist-grey/60 text-xs px-3 py-2 rounded-xl border border-df-border"
            />
            <button
              type="submit"
              className="bg-royal-purple text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-deep-violet flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </form>

          <div className="bg-white rounded-2xl border border-df-border shadow-sm divide-y divide-df-border/60">
            {designations.map((d) => (
              <div key={d.id} className="p-3.5 flex items-center justify-between text-xs text-charcoal">
                <span className="font-semibold">{d.name}</span>
                <span className="text-zinc-grey font-mono">{d._count?.employees || 0} employees</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'policy' && (
        <div className="bg-white rounded-2xl p-6 border border-df-border shadow-sm max-w-xl space-y-4">
          <h3 className="font-semibold text-charcoal text-sm">Attendance Hours & Leave Policy</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Work Start Time</label>
              <input
                type="time"
                value={workStartTime}
                onChange={(e) => setWorkStartTime(e.target.value)}
                className="w-full bg-mist-grey/60 text-xs px-3 py-2.5 rounded-xl border border-df-border"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Work End Time</label>
              <input
                type="time"
                value={workEndTime}
                onChange={(e) => setWorkEndTime(e.target.value)}
                className="w-full bg-mist-grey/60 text-xs px-3 py-2.5 rounded-xl border border-df-border"
              />
            </div>
          </div>
        </div>
      )}
    </PageTransition>
  )
}
