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
    const payroll = await prisma.payrollRecord.findUnique({
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
        salarySlip: true,
      },
    })

    if (!payroll) return apiError('Payroll record not found', 404)

    const isAdmin = ['ADMIN', 'HR_OFFICER'].includes(auth.user.role)
    if (!isAdmin && payroll.userId !== auth.user.id) {
      return apiError('Forbidden: Cannot view other employee payroll details', 403)
    }

    return apiSuccess(payroll)
  } catch (error) {
    console.error('[Payroll GET ID Error]', error)
    return apiError('Failed to fetch payroll record', 500)
  }
}

