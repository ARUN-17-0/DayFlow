import { NextRequest } from 'next/server'
import { getAuthUser, requireAdmin, apiError, apiSuccess } from '@/lib/auth/helpers'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  const auth = await getAuthUser()
  if (!auth.success) return apiError(auth.error, auth.status)

  try {
    const designations = await prisma.designation.findMany({
      where: { isActive: true },
      include: {
        _count: { select: { employees: true } },
      },
      orderBy: { level: 'asc' },
    })

    return apiSuccess(designations)
  } catch (error) {
    console.error('[Designations GET Error]', error)
    return apiError('Failed to fetch designations', 500)
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin()
  if (!auth.success) return apiError(auth.error, auth.status)

  try {
    const { name, level } = await request.json()

    if (!name || name.trim().length < 2) {
      return apiError('Designation name must be at least 2 characters', 400)
    }

    const desig = await prisma.designation.create({
      data: { name: name.trim(), level: Number(level) || 1 },
    })

    return apiSuccess(desig, 'Designation created successfully', 201)
  } catch (error) {
    console.error('[Designations POST Error]', error)
    return apiError('Failed to create designation', 500)
  }
}
