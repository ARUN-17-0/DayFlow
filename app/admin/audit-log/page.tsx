'use client'

import { useState, useEffect } from 'react'
import { PageTransition } from '@/components/dayflow/animations/PageTransition'
import { PageHeader } from '@/components/dayflow/PageHeader'
import { Shield, Clock } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default function AuditLogPage() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/audit-log')
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data) {
          setLogs(res.data.items || [])
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <PageTransition>
      <PageHeader
        title="Audit Log"
        description="Immutable trail of admin actions, security events, and system mutations."
      />

      <div className="bg-white rounded-2xl border border-df-border shadow-sm overflow-hidden p-4">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-mist-grey/60 border-b border-df-border text-zinc-grey uppercase tracking-wider">
              <th className="px-4 py-3 font-semibold">Timestamp</th>
              <th className="px-4 py-3 font-semibold">User</th>
              <th className="px-4 py-3 font-semibold">Action</th>
              <th className="px-4 py-3 font-semibold">Entity Type</th>
              <th className="px-4 py-3 font-semibold">Entity ID</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-df-border/60">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-xs text-zinc-grey">
                  No audit logs recorded yet.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-cool-grey/60 font-mono">
                  <td className="px-4 py-3 text-zinc-grey">{formatDate(log.createdAt)}</td>
                  <td className="px-4 py-3 font-semibold text-charcoal font-sans">
                    {log.user?.profile?.firstName} {log.user?.profile?.lastName} ({log.user?.employeeId})
                  </td>
                  <td className="px-4 py-3">
                    <span className="bg-lavender text-royal-purple font-bold px-2 py-0.5 rounded text-[11px]">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-grey font-sans">{log.entityType}</td>
                  <td className="px-4 py-3 text-zinc-grey">{log.entityId || '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </PageTransition>
  )
}
