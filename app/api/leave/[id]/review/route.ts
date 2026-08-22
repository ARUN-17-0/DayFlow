import { NextRequest } from 'next/server'
import { requireAdmin, apiError, apiSuccess, createAuditLog } from '@/lib/auth/helpers'
import { prisma } from '@/lib/db'
import { reviewLeaveSchema } from '@/lib/validations'
import { getLeaveApprovedTemplate, getLeaveRejectedTemplate, sendEmail } from '@/lib/email'
import { formatDate } from '@/lib/utils'

export function generateStaticParams() {
  return [{ id: 'demo' }]
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin()
  if (!auth.success) return apiError(auth.error, auth.status)

  const { id } = await params

  try {
    const body = await request.json()
    const parsed = reviewLeaveSchema.safeParse(body)

    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message || 'Invalid review data', 400)
    }

    const { status, reviewComment } = parsed.data

    const leave = await prisma.leaveRequest.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            profile: { select: { firstName: true, lastName: true } },
          },
        },
      },
    })

    if (!leave) return apiError('Leave request not found', 404)

    if (leave.status !== 'PENDING') {
      return apiError('This leave request has already been reviewed.', 400)
    }

    // Update leave request
    const updatedLeave = await prisma.leaveRequest.update({
      where: { id },
      data: {
        status: status as any,
        reviewComment,
        reviewedById: auth.user.id,
        reviewedAt: new Date(),
      },
    })

    // If APPROVED, update employee leave balance
    if (status === 'APPROVED' && leave.leaveType !== 'UNPAID') {
      const balanceFieldMap: Record<string, string> = {
        PAID: 'paidLeave',
        SICK: 'sickLeave',
        CASUAL: 'casualLeave',
      }
      const field = balanceFieldMap[leave.leaveType]
      if (field) {
        await prisma.leaveBalance.update({
          where: { userId: leave.userId },
          data: {
            [field]: { decrement: leave.totalDays },
          },
        })
      }
    }

    // Create in-app notification for employee
    const empName = `${leave.user?.profile?.firstName || 'Employee'} ${leave.user?.profile?.lastName || ''}`.trim()
    const isApproved = status === 'APPROVED'

    await prisma.notification.create({
      data: {
        userId: leave.userId,
        title: isApproved ? 'Leave Approved ✓' : 'Leave Request Declined',
        message: isApproved
          ? `Your ${leave.leaveType} leave request (${leave.totalDays} days) has been approved.`
          : `Your ${leave.leaveType} leave request was declined. ${reviewComment ? `Note: ${reviewComment}` : ''}`,
        type: isApproved ? 'LEAVE_APPROVED' : 'LEAVE_REJECTED',
        relatedEntityId: leave.id,
        relatedEntityType: 'LeaveRequest',
      },
    })

    // Send email notification to employee
    const startDateStr = formatDate(leave.startDate)
    const endDateStr = formatDate(leave.endDate)
    const emailPayload = isApproved
      ? getLeaveApprovedTemplate(leave.user.email, empName, leave.leaveType, startDateStr, endDateStr, reviewComment)
      : getLeaveRejectedTemplate(leave.user.email, empName, leave.leaveType, startDateStr, endDateStr, reviewComment)

    await sendEmail(emailPayload)

    await createAuditLog({
      userId: auth.user.id,
      action: isApproved ? 'APPROVE_LEAVE' : 'REJECT_LEAVE',
      entityType: 'LeaveRequest',
      entityId: leave.id,
      metadata: { targetUserId: leave.userId, days: leave.totalDays, type: leave.leaveType },
      request,
    })

    return apiSuccess(updatedLeave, `Leave request ${status.toLowerCase()} successfully.`)
  } catch (error) {
    console.error('[Leave Review Error]', error)
    return apiError('Failed to process leave review', 500)
  }
}
