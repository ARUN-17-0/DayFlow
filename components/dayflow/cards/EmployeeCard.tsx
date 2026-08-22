'use client'

import { motion } from 'framer-motion'
import { StatusChip } from '../StatusChip'
import { Mail, Phone, Calendar, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { getInitials } from '@/lib/utils'

type EmployeeCardProps = {
  employee: {
    id: string
    employeeId: string
    email: string
    profile?: {
      firstName: string
      lastName: string
      avatar?: string | null
      phone?: string | null
      joiningDate?: Date | string | null
      status: string
      department?: { name: string } | null
      designation?: { name: string } | null
    } | null
  }
  adminView?: boolean
}

export function EmployeeCard({ employee, adminView = false }: EmployeeCardProps) {
  const profile = employee.profile
  const firstName = profile?.firstName || employee.employeeId
  const lastName = profile?.lastName || ''
  const fullName = `${firstName} ${lastName}`.trim()
  const initials = getInitials(firstName, lastName)
  const deptName = profile?.department?.name || 'General'
  const desigName = profile?.designation?.name || 'Team Member'
  const status = profile?.status || 'ACTIVE'

  return (
    <motion.div
      className="bg-white rounded-2xl p-5 border border-df-border shadow-sm hover:shadow-md transition-all duration-200 group flex flex-col justify-between"
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
    >
      <div>
        {/* Header with avatar + status */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              {profile?.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.avatar}
                  alt={fullName}
                  className="w-12 h-12 rounded-full object-cover border border-df-border"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-lavender text-royal-purple font-bold flex items-center justify-center text-sm border border-purple-200">
                  {initials}
                </div>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-charcoal text-base group-hover:text-royal-purple transition-colors">
                {fullName}
              </h3>
              <p className="text-xs text-zinc-grey">{desigName}</p>
            </div>
          </div>

          <StatusChip status={status} size="sm" />
        </div>

        {/* Info pills */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-xs text-zinc-grey py-1 border-b border-df-border/50">
            <span className="font-mono text-zinc font-medium bg-cool-grey px-1.5 py-0.5 rounded">
              {employee.employeeId}
            </span>
            <span className="bg-lavender text-royal-purple font-medium px-2 py-0.5 rounded-full text-[11px]">
              {deptName}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-zinc-grey">
            <Mail className="w-3.5 h-3.5 text-zinc-grey flex-shrink-0" />
            <span className="truncate">{employee.email}</span>
          </div>

          {profile?.phone && (
            <div className="flex items-center gap-2 text-xs text-zinc-grey">
              <Phone className="w-3.5 h-3.5 text-zinc-grey flex-shrink-0" />
              <span>{profile.phone}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer link */}
      {adminView && (
        <Link
          href={`/admin/employees/${employee.id}`}
          className="inline-flex items-center justify-center gap-1.5 w-full text-xs font-semibold text-royal-purple bg-lavender hover:bg-royal-purple hover:text-white py-2 rounded-xl transition-all duration-200 mt-2"
        >
          View Profile
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      )}
    </motion.div>
  )
}
