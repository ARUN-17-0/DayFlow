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
    const targetUserId = isAdmin && userIdParam ? userIdParam : auth.user.id

    let balance = await prisma.leaveBalance.findUnique({
      where: { userId: targetUserId },
    })

    // If balance doesn't exist, auto-create default
    if (!balance) {
      balance = await prisma.leaveBalance.create({
        data: {
          userId: targetUserId,
          paidLeave: 12,
          sickLeave: 8,
          casualLeave: 6,
          unpaidLeave: 0,
          year: new Date().getFullYear(),
        },
      })
    }

    return apiSuccess(balance)
  } catch (error) {
    console.error('[Leave Balance Error]', error)
    return apiError('Failed to fetch leave balance', 500)
  }
}
