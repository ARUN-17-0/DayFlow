import { NextRequest } from 'next/server'
import { getAuthUser, requireAdmin, apiError, apiSuccess, createAuditLog } from '@/lib/auth/helpers'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  const auth = await getAuthUser()
  if (!auth.success) return apiError(auth.error, auth.status)

  try {
    const settingsList = await prisma.companySetting.findMany()
    const settingsObj = settingsList.reduce((acc, item) => {
      acc[item.key] = item.value
      return acc
    }, {} as Record<string, string>)

    return apiSuccess(settingsObj)
  } catch (error) {
    console.error('[Company Settings GET Error]', error)
    return apiError('Failed to fetch settings', 500)
  }
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdmin()
  if (!auth.success) return apiError(auth.error, auth.status)

  try {
    const settingsMap = await request.json()

    if (typeof settingsMap !== 'object' || !settingsMap) {
      return apiError('Invalid settings payload', 400)
    }

    for (const [key, value] of Object.entries(settingsMap)) {
      await prisma.companySetting.upsert({
        where: { key },
        update: { value: String(value), updatedById: auth.user.id },
        create: { key, value: String(value), updatedById: auth.user.id },
      })
    }

    await createAuditLog({
      userId: auth.user.id,
      action: 'UPDATE_COMPANY_SETTINGS',
      entityType: 'CompanySetting',
      metadata: settingsMap,
      request,
    })

    return apiSuccess(settingsMap, 'Settings updated successfully')
  } catch (error) {
    console.error('[Company Settings PUT Error]', error)
    return apiError('Failed to update settings', 500)
  }
}
