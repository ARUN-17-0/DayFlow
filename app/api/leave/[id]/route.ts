import { NextRequest } from 'next/server'
import { getAuthUser, apiError, apiSuccess } from '@/lib/auth/helpers'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthUser()
  if (!auth.success) return apiError(auth.error, auth.status)

  const { id } = await params

  try {
    const leave = await prisma.leaveRequest.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            employeeId: true,
            email: true,
            profile: {
              include: { department: true, designation: true },
            },
          },
        },
        reviewedBy: {
          select: {
            profile: { select: { firstName: true, lastName: true } },
          },
        },
      },
    })

    if (!leave) return apiError('Leave request not found', 404)

    const isAdmin = ['ADMIN', 'HR_OFFICER'].includes(auth.user.role)
    if (!isAdmin && leave.userId !== auth.user.id) {
      return apiError('Forbidden: Cannot view other employee leave request', 403)
    }

    return apiSuccess(leave)
  } catch (error) {
    console.error('[Leave GET ID Error]', error)
    return apiError('Failed to fetch leave request', 500)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthUser()
  if (!auth.success) return apiError(auth.error, auth.status)

  const { id } = await params

  try {
    const leave = await prisma.leaveRequest.findUnique({ where: { id } })
    if (!leave) return apiError('Leave request not found', 404)

    if (leave.userId !== auth.user.id) {
      return apiError('Forbidden: Can only cancel own leave requests', 403)
    }

    if (leave.status !== 'PENDING') {
      return apiError('Only pending leave requests can be cancelled.', 400)
    }

    await prisma.leaveRequest.update({
      where: { id },
      data: { status: 'CANCELLED' },
    })

    return apiSuccess({ cancelled: true }, 'Leave request cancelled')
  } catch (error) {
    console.error('[Leave DELETE Error]', error)
    return apiError('Failed to cancel leave request', 500)
  }
}

