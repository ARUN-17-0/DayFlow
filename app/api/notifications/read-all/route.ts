import { NextRequest } from 'next/server'
import { getAuthUser, apiError, apiSuccess } from '@/lib/auth/helpers'
import { prisma } from '@/lib/db'

export async function PUT(request: NextRequest) {
  const auth = await getAuthUser()
  if (!auth.success) return apiError(auth.error, auth.status)

  try {
    await prisma.notification.updateMany({
      where: { userId: auth.user.id, isRead: false },
      data: { isRead: true },
    })

    return apiSuccess({ success: true }, 'All notifications marked as read')
  } catch (error) {
    console.error('[Notifications Read All Error]', error)
    return apiError('Failed to mark notifications as read', 500)
  }
}
