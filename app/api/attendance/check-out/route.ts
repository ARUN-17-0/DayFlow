import { NextRequest } from 'next/server'
import { getAuthUser, apiError, apiSuccess } from '@/lib/auth/helpers'
import { prisma } from '@/lib/db'
import { calculateWorkingHours } from '@/lib/utils'

export async function POST(request: NextRequest) {
  const auth = await getAuthUser()
  if (!auth.success) return apiError(auth.error, auth.status)

  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Find today's attendance record
    const existingRecord = await prisma.attendanceRecord.findFirst({
      where: {
        userId: auth.user.id,
        date: {
          gte: today,
          lt: tomorrow,
        },
      },
    })

    if (!existingRecord || !existingRecord.checkIn) {
      return apiError('You must check in first before checking out.', 400)
    }

    if (existingRecord.checkOut) {
      return apiError('You have already checked out today.', 400)
    }

    const now = new Date()
    const workingHours = calculateWorkingHours(existingRecord.checkIn, now)
    const finalStatus = workingHours < 5 ? 'HALF_DAY' : 'PRESENT'

    const record = await prisma.attendanceRecord.update({
      where: { id: existingRecord.id },
      data: {
        checkOut: now,
        workingHours,
        status: finalStatus,
      },
    })

    // Notification
    await prisma.notification.create({
      data: {
        userId: auth.user.id,
        title: 'Checked Out',
        message: `You checked out at ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (${workingHours} hours worked)`,
        type: 'ATTENDANCE_MARKED',
      },
    })

    return apiSuccess(record, 'Check-out recorded successfully! Workday complete.')
  } catch (error) {
    console.error('[Check-out Error]', error)
    return apiError('Failed to record check-out', 500)
  }
}
