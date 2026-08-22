import { NextRequest } from 'next/server'
import { requireAdmin, apiError, apiSuccess } from '@/lib/auth/helpers'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  const auth = await requireAdmin()
  if (!auth.success) return apiError(auth.error, auth.status)

  try {
    const statusCounts = await prisma.leaveRequest.groupBy({
      by: ['status'],
      _count: { status: true },
    })

    const typeCounts = await prisma.leaveRequest.groupBy({
      by: ['leaveType'],
      _count: { leaveType: true },
    })

    const statusSummary = statusCounts.reduce((acc, curr) => {
      acc[curr.status] = curr._count.status
      return acc
    }, {} as Record<string, number>)

    const typeSummary = typeCounts.reduce((acc, curr) => {
      acc[curr.leaveType] = curr._count.leaveType
      return acc
    }, {} as Record<string, number>)

    return apiSuccess({
      statusSummary,
      typeSummary,
      pending: statusSummary['PENDING'] || 0,
      approved: statusSummary['APPROVED'] || 0,
      rejected: statusSummary['REJECTED'] || 0,
    })
  } catch (error) {
    console.error('[Leave Report Error]', error)
    return apiError('Failed to generate leave report', 500)
  }
}
