import { NextRequest } from 'next/server'
import { getAuthUser, apiError, apiSuccess } from '@/lib/auth/helpers'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  const auth = await getAuthUser()
  if (!auth.success) return apiError(auth.error, auth.status)

  try {
    const employee = await prisma.user.findUnique({
      where: { id: auth.user.id },
      select: {
        id: true,
        employeeId: true,
        email: true,
        role: true,
        isEmailVerified: true,
        isActive: true,
        createdAt: true,
        profile: {
          include: {
            department: true,
            designation: true,
          },
        },
        salaryComponent: true,
        leaveBalance: true,
      },
    })

    if (!employee) return apiError('Employee record not found', 404)

    return apiSuccess(employee)
  } catch (error) {
    console.error('[Employee ME Error]', error)
    return apiError('Failed to fetch profile', 500)
  }
}
