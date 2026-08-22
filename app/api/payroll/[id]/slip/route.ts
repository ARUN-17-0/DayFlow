import { NextRequest } from 'next/server'
import { getAuthUser, apiError, apiSuccess } from '@/lib/auth/helpers'
import { prisma } from '@/lib/db'

export function generateStaticParams() {
  return [{ id: 'demo' }]
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthUser()
  if (!auth.success) return apiError(auth.error, auth.status)

  const { id } = await params

  try {
    const slip = await prisma.salarySlip.findUnique({
      where: { payrollId: id },
      include: {
        payroll: {
          include: {
            user: {
              select: {
                id: true,
                employeeId: true,
                email: true,
                profile: { include: { department: true, designation: true } },
              },
            },
          },
        },
      },
    })

    if (!slip) return apiError('Salary slip not found', 404)

    const isAdmin = ['ADMIN', 'HR_OFFICER'].includes(auth.user.role)
    if (!isAdmin && slip.userId !== auth.user.id) {
      return apiError('Forbidden: Cannot view other employee salary slip', 403)
    }

    return apiSuccess(slip)
  } catch (error) {
    console.error('[Salary Slip GET Error]', error)
    return apiError('Failed to fetch salary slip', 500)
  }
}

