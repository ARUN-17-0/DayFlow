import { NextRequest } from 'next/server'
import { getAuthUser, apiError, apiSuccess } from '@/lib/auth/helpers'
import { prisma } from '@/lib/db'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function POST(request: NextRequest) {
  const auth = await getAuthUser()
  if (!auth.success) return apiError(auth.error, auth.status)

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const targetUserId = (formData.get('userId') as string) || auth.user.id

    const isAdmin = ['ADMIN', 'HR_OFFICER'].includes(auth.user.role)
    if (!isAdmin && targetUserId !== auth.user.id) {
      return apiError('Forbidden: Cannot upload avatar for another user', 403)
    }

    if (!file) return apiError('No image file provided', 400)

    // Validate type (images only)
    if (!file.type.startsWith('image/')) {
      return apiError('File must be an image (JPEG, PNG, WEBP, GIF)', 400)
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return apiError('Image size must be less than 5MB', 400)
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'avatars')
    await mkdir(uploadDir, { recursive: true })

    const ext = file.name.split('.').pop() || 'png'
    const fileName = `${targetUserId}-${Date.now()}.${ext}`
    const filePath = path.join(uploadDir, fileName)

    await writeFile(filePath, buffer)

    const publicUrl = `/uploads/avatars/${fileName}`

    // Update profile
    await prisma.employeeProfile.update({
      where: { userId: targetUserId },
      data: { avatar: publicUrl },
    })

    return apiSuccess({ url: publicUrl }, 'Profile picture updated successfully')
  } catch (error) {
    console.error('[Avatar Upload Error]', error)
    return apiError('Failed to upload image', 500)
  }
}
