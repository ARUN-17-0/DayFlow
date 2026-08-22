import { NextRequest } from 'next/server'
import { getAuthUser, apiError, apiSuccess } from '@/lib/auth/helpers'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  const auth = await getAuthUser()
  if (!auth.success) return apiError(auth.error, auth.status)

  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const record = await prisma.attendanceRecord.findFirst({
      where: {
        userId: auth.user.id,
        date: {
          gte: today,
          lt: tomorrow,
        },
      },
    })

    return apiSuccess(record || null)
  } catch (error) {
    console.error('[Attendance Today Error]', error)
    return apiError('Failed to fetch today\'s attendance status', 500)
  }
}
