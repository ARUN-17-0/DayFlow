import { NextRequest } from 'next/server'
import { requireAdmin, apiError, apiSuccess } from '@/lib/auth/helpers'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  const auth = await requireAdmin()
  if (!auth.success) return apiError(auth.error, auth.status)

  try {
    const { searchParams } = new URL(request.url)
    const departmentId = searchParams.get('departmentId') || undefined
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    const where: any = {}
    if (dateFrom || dateTo) {
      where.date = {}
      if (dateFrom) where.date.gte = new Date(dateFrom)
      if (dateTo) where.date.lte = new Date(dateTo)
    }

    if (departmentId) {
      where.user = { profile: { departmentId } }
    }

    // Status aggregation
    const statusCounts = await prisma.attendanceRecord.groupBy({
      by: ['status'],
      where,
      _count: { status: true },
    })

    const summary = statusCounts.reduce((acc, curr) => {
      acc[curr.status] = curr._count.status
      return acc
    }, {} as Record<string, number>)

    // Total records
    const totalRecords = await prisma.attendanceRecord.count({ where })

    return apiSuccess({
      summary,
      totalRecords,
      present: summary['PRESENT'] || 0,
      absent: summary['ABSENT'] || 0,
      onLeave: summary['ON_LEAVE'] || 0,
      halfDay: summary['HALF_DAY'] || 0,
    })
  } catch (error) {
    console.error('[Attendance Report Error]', error)
    return apiError('Failed to generate attendance report', 500)
  }
}
