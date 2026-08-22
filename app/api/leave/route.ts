import { NextRequest } from 'next/server'
import { getAuthUser, apiError, apiSuccess } from '@/lib/auth/helpers'
import { prisma } from '@/lib/db'
import { applyLeaveSchema } from '@/lib/validations'
import { getBusinessDaysBetween } from '@/lib/utils'

export async function GET(request: NextRequest) {
  const auth = await getAuthUser()
  if (!auth.success) return apiError(auth.error, auth.status)

  try {
    const { searchParams } = new URL(request.url)
    const isAdmin = ['ADMIN', 'HR_OFFICER'].includes(auth.user.role)
    const userIdParam = searchParams.get('userId')
    const leaveType = searchParams.get('leaveType') || undefined
    const status = searchParams.get('status') || undefined
    const departmentId = searchParams.get('departmentId') || undefined
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')))
    const skip = (page - 1) * limit

    const where: any = {}

    if (!isAdmin) {
      where.userId = auth.user.id
    } else if (userIdParam) {
      where.userId = userIdParam
    }

    if (leaveType) where.leaveType = leaveType as any
    if (status) where.status = status as any
    if (departmentId && isAdmin) {
      where.user = {
        profile: { departmentId },
      }
    }

    const [items, total] = await Promise.all([
      prisma.leaveRequest.findMany({
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
          reviewedBy: {
            select: {
              profile: {
                select: { firstName: true, lastName: true },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.leaveRequest.count({ where }),
    ])

    return apiSuccess({
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('[Leave GET Error]', error)
    return apiError('Failed to fetch leave requests', 500)
  }
}

export async function POST(request: NextRequest) {
  const auth = await getAuthUser()
  if (!auth.success) return apiError(auth.error, auth.status)

  try {
    const body = await request.json()
    const parsed = applyLeaveSchema.safeParse(body)

    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message || 'Invalid leave application data', 400)
    }

    const { leaveType, startDate, endDate, reason, attachment } = parsed.data

    const start = new Date(startDate)
    const end = new Date(endDate)
    const totalDays = getBusinessDaysBetween(start, end)

    if (totalDays <= 0) {
      return apiError('Leave range must include at least 1 working day (excluding weekends).', 400)
    }

    // Check leave balance
    const balance = await prisma.leaveBalance.findUnique({
      where: { userId: auth.user.id },
    })

    if (balance && leaveType !== 'UNPAID') {
      const fieldMap: Record<string, keyof typeof balance> = {
        PAID: 'paidLeave',
        SICK: 'sickLeave',
        CASUAL: 'casualLeave',
      }
      const availableField = fieldMap[leaveType]
      if (availableField) {
        const available = Number(balance[availableField]) || 0
        if (totalDays > available) {
          return apiError(`Insufficient ${leaveType.toLowerCase()} leave balance (${available} days available).`, 400)
        }
      }
    }

    // Check overlapping leave requests
    const overlapping = await prisma.leaveRequest.findFirst({
      where: {
        userId: auth.user.id,
        status: { in: ['PENDING', 'APPROVED'] },
        OR: [
          { startDate: { lte: end }, endDate: { gte: start } },
        ],
      },
    })

    if (overlapping) {
      return apiError('You already have a pending or approved leave request during this date range.', 400)
    }

    const leaveRequest = await prisma.leaveRequest.create({
      data: {
        userId: auth.user.id,
        leaveType: leaveType as any,
        startDate: start,
        endDate: end,
        totalDays,
        reason,
        attachment,
        status: 'PENDING',
      },
      include: {
        user: {
          select: {
            profile: { select: { firstName: true, lastName: true } },
          },
        },
      },
    })

    // Notify admins / HR
    const adminUsers = await prisma.user.findMany({
      where: { role: { in: ['ADMIN', 'HR_OFFICER'] } },
      select: { id: true },
    })

    const empName = `${leaveRequest.user?.profile?.firstName || 'Employee'} ${leaveRequest.user?.profile?.lastName || ''}`.trim()

    await prisma.notification.createMany({
      data: adminUsers.map((a) => ({
        userId: a.id,
        title: 'New Leave Request',
        message: `${empName} has requested ${totalDays} day(s) of ${leaveType} leave.`,
        type: 'LEAVE_SUBMITTED',
        relatedEntityId: leaveRequest.id,
        relatedEntityType: 'LeaveRequest',
      })),
    })

    return apiSuccess(leaveRequest, 'Leave application submitted successfully!', 201)
  } catch (error) {
    console.error('[Leave POST Error]', error)
    return apiError('Failed to submit leave application', 500)
  }
}
