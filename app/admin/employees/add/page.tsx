'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PageTransition } from '@/components/dayflow/animations/PageTransition'
import { PageHeader } from '@/components/dayflow/PageHeader'
import { ArrowLeft, UserPlus, Save } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

export default function AddEmployeePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const [employeeId, setEmployeeId] = useState('EMP009')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('Employee@123')
  const [role, setRole] = useState('EMPLOYEE')
  const [phone, setPhone] = useState('')
  const [basicSalary, setBasicSalary] = useState(50000)
  const [hra, setHra] = useState(20000)
  const [allowances, setAllowances] = useState(8000)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId,
          firstName,
          lastName,
          email,
          password,
          role,
          phone,
          basicSalary: Number(basicSalary),
          hra: Number(hra),
          allowances: Number(allowances),
        }),
      })

      const json = await res.json()

      if (json.success) {
        toast.success('Employee account created successfully!')
        router.push('/admin/employees')
      } else {
        toast.error(json.error || 'Failed to create employee')
      }
    } catch {
      toast.error('Failed to create employee')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageTransition>
      <PageHeader
        title="Add New Employee"
        description="Provision a new employee or HR account in Dayflow."
        actions={
          <Link
            href="/admin/employees"
            className="bg-white border border-df-border text-charcoal text-xs font-semibold px-4 py-2 rounded-xl hover:bg-mist-grey flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Directory
          </Link>
        }
      />

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-df-border shadow-sm max-w-2xl space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">Employee ID</label>
            <input
              type="text"
              required
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="w-full bg-mist-grey/60 text-xs px-3 py-2 rounded-xl border border-df-border font-mono font-bold"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">Role</label>
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
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">First Name</label>
            <input
              type="text"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full bg-mist-grey/60 text-xs px-3 py-2 rounded-xl border border-df-border"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">Last Name</label>
            <input
              type="text"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full bg-mist-grey/60 text-xs px-3 py-2 rounded-xl border border-df-border"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">Work Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-mist-grey/60 text-xs px-3 py-2 rounded-xl border border-df-border"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">Temporary Password</label>
            <input
              type="text"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-mist-grey/60 text-xs px-3 py-2 rounded-xl border border-df-border font-mono"
            />
          </div>
        </div>

        <div className="border-t border-df-border pt-4 mt-2">
          <h4 className="font-semibold text-charcoal text-xs mb-3">Salary Components (Monthly)</h4>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-zinc-grey mb-1">Basic Salary (₹)</label>
              <input
                type="number"
                value={basicSalary}
                onChange={(e) => setBasicSalary(Number(e.target.value))}
                className="w-full bg-mist-grey/60 text-xs px-3 py-2 rounded-xl border border-df-border font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-zinc-grey mb-1">HRA (₹)</label>
              <input
                type="number"
                value={hra}
                onChange={(e) => setHra(Number(e.target.value))}
                className="w-full bg-mist-grey/60 text-xs px-3 py-2 rounded-xl border border-df-border font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-zinc-grey mb-1">Allowances (₹)</label>
              <input
                type="number"
                value={allowances}
                onChange={(e) => setAllowances(Number(e.target.value))}
                className="w-full bg-mist-grey/60 text-xs px-3 py-2 rounded-xl border border-df-border font-mono"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-royal-purple text-white text-xs font-semibold px-6 py-3 rounded-xl hover:bg-deep-violet flex items-center gap-1.5 shadow-md shadow-purple-500/20 mt-4"
        >
          <Save className="w-4 h-4" />
          {loading ? 'Creating...' : 'Create Employee Account'}
        </button>
      </form>
    </PageTransition>
  )
}
