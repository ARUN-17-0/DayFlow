import { NextRequest } from 'next/server'
import { getAuthUser, apiError, apiSuccess } from '@/lib/auth/helpers'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  const auth = await getAuthUser()
  if (!auth.success) return apiError(auth.error, auth.status)

  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Check if already checked in today
    const existingRecord = await prisma.attendanceRecord.findFirst({
      where: {
        userId: auth.user.id,
        date: {
          gte: today,
          lt: tomorrow,
        },
      },
    })

    if (existingRecord && existingRecord.checkIn) {
      return apiError('You have already checked in today.', 400)
    }

    const now = new Date()
    const isLate = now.getHours() > 9 || (now.getHours() === 9 && now.getMinutes() > 15)

    let record
    if (existingRecord) {
      record = await prisma.attendanceRecord.update({
        where: { id: existingRecord.id },
        data: {
          checkIn: now,
          status: 'PRESENT',
          notes: isLate ? 'Late arrival (checked in after 09:15 AM)' : 'Checked in on time',
        },
      })
    } else {
      record = await prisma.attendanceRecord.create({
        data: {
          userId: auth.user.id,
          date: today,
          checkIn: now,
          status: 'PRESENT',
          notes: isLate ? 'Late arrival (checked in after 09:15 AM)' : 'Checked in on time',
        },
      })
    }

    // Notification
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    await prisma.notification.create({
      data: {
        userId: auth.user.id,
        title: isLate ? 'Late Check In' : 'Checked In',
        message: isLate
          ? `You checked in at ${timeStr} (Late Arrival recorded).`
          : `You checked in on time at ${timeStr}.`,
        type: 'ATTENDANCE_MARKED',
      },
    })

    return apiSuccess(
      record,
      isLate
        ? `Checked in at ${timeStr} (Late arrival recorded).`
        : `Checked in at ${timeStr}. Have a great workday!`
    )
  } catch (error) {
    console.error('[Check-in Error]', error)
    return apiError('Failed to record check-in', 500)
  }
}
