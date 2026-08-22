import { NextRequest } from 'next/server'
import { getAuthUser, apiError, apiSuccess } from '@/lib/auth/helpers'
import { prisma } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthUser()
  if (!auth.success) return apiError(auth.error, auth.status)

  const { id } = await params

  try {
    const notification = await prisma.notification.findUnique({ where: { id } })
    if (!notification) return apiError('Notification not found', 404)

    if (notification.userId !== auth.user.id) {
      return apiError('Forbidden', 403)
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    })

    return apiSuccess(updated)
  } catch (error) {
    console.error('[Notification Read Error]', error)
    return apiError('Failed to mark notification as read', 500)
  }
}

