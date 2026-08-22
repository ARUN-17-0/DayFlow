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
    const lateNote = isLate ? 'LATE_CHECK_IN' : 'ON_TIME'

    let record
    if (existingRecord) {
      record = await prisma.attendanceRecord.update({
        where: { id: existingRecord.id },
        data: {
          checkIn: now,
          status: 'PRESENT',
          notes: lateNote,
        },
      })
    } else {
      record = await prisma.attendanceRecord.create({
        data: {
          userId: auth.user.id,
          date: today,
          checkIn: now,
          status: 'PRESENT',
          notes: lateNote,
        },
      })
    }

    // Notification
    await prisma.notification.create({
      data: {
        userId: auth.user.id,
        title: isLate ? 'Late Check-In Recorded' : 'Checked In',
        message: `You checked in at ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}${isLate ? ' (Late)' : ' (On Time)'}`,
        type: 'ATTENDANCE_MARKED',
      },
    })

    return apiSuccess(
      record,
      isLate
        ? 'Checked in! (Recorded as late check-in)'
        : 'Check-in successful! Have a great workday.'
    )
  } catch (error) {
    console.error('[Check-in Error]', error)
    return apiError('Failed to record check-in', 500)
  }
}
