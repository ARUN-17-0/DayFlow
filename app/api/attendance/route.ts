import { NextRequest } from 'next/server'
import { getAuthUser, apiError, apiSuccess } from '@/lib/auth/helpers'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  const auth = await getAuthUser()
  if (!auth.success) return apiError(auth.error, auth.status)

  try {
    const { searchParams } = new URL(request.url)
    const isAdmin = ['ADMIN', 'HR_OFFICER'].includes(auth.user.role)
    const userIdParam = searchParams.get('userId')
    const departmentId = searchParams.get('departmentId') || undefined
    const status = searchParams.get('status') || undefined
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')))
    const skip = (page - 1) * limit

    const where: any = {}

    // Employees can only view own attendance
    if (!isAdmin) {
      where.userId = auth.user.id
    } else if (userIdParam) {
      where.userId = userIdParam
    }

    if (status) {
      where.status = status as any
    }

    if (dateFrom || dateTo) {
      where.date = {}
      if (dateFrom) where.date.gte = new Date(dateFrom)
      if (dateTo) where.date.lte = new Date(dateTo)
    }

    if (departmentId && isAdmin) {
      where.user = {
        profile: { departmentId },
      }
    }

    const [items, total] = await Promise.all([
      prisma.attendanceRecord.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              employeeId: true,
              email: true,
              profile: {
                select: {
                  firstName: true,
                  lastName: true,
                  avatar: true,
                  department: true,
                  designation: true,
                },
              },
            },
          },
        },
        orderBy: { date: 'desc' },
        skip,
        take: limit,
      }),
      prisma.attendanceRecord.count({ where }),
    ])

    return apiSuccess({
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('[Attendance GET Error]', error)
    return apiError('Failed to fetch attendance records', 500)
  }
}
