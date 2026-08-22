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
    const name = (formData.get('name') as string) || file?.name || 'Document'
    const type = (formData.get('type') as string) || 'OTHER'
    const targetUserId = (formData.get('userId') as string) || auth.user.id

    const isAdmin = ['ADMIN', 'HR_OFFICER'].includes(auth.user.role)
    if (!isAdmin && targetUserId !== auth.user.id) {
      return apiError('Forbidden: Cannot upload document for another user', 403)
    }

    if (!file) return apiError('No document file provided', 400)

    // Validate size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return apiError('Document size must be less than 10MB', 400)
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'documents', targetUserId)
    await mkdir(uploadDir, { recursive: true })

    const ext = file.name.split('.').pop() || 'pdf'
    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    const filePath = path.join(uploadDir, fileName)

    await writeFile(filePath, buffer)

    const publicUrl = `/uploads/documents/${targetUserId}/${fileName}`

    const doc = await prisma.document.create({
      data: {
        userId: targetUserId,
        name,
        type: type as any,
        url: publicUrl,
        uploadedById: auth.user.id,
      },
    })

    return apiSuccess(doc, 'Document uploaded successfully', 201)
  } catch (error) {
    console.error('[Document Upload Error]', error)
    return apiError('Failed to upload document', 500)
  }
}
