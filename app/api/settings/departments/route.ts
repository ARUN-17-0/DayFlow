import { NextRequest } from 'next/server'
import { getAuthUser, requireAdmin, apiError, apiSuccess } from '@/lib/auth/helpers'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  const auth = await getAuthUser()
  if (!auth.success) return apiError(auth.error, auth.status)

  try {
    const departments = await prisma.department.findMany({
      where: { isActive: true },
      include: {
        _count: { select: { employees: true } },
      },
      orderBy: { name: 'asc' },
    })

    return apiSuccess(departments)
  } catch (error) {
    console.error('[Departments GET Error]', error)
    return apiError('Failed to fetch departments', 500)
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin()
  if (!auth.success) return apiError(auth.error, auth.status)

  try {
    const { name, description } = await request.json()

    if (!name || name.trim().length < 2) {
      return apiError('Department name must be at least 2 characters', 400)
    }

    const existing = await prisma.department.findUnique({ where: { name } })
    if (existing) return apiError('Department already exists', 400)

    const dept = await prisma.department.create({
      data: { name: name.trim(), description: description?.trim() },
    })

    return apiSuccess(dept, 'Department created successfully', 201)
  } catch (error) {
    console.error('[Departments POST Error]', error)
    return apiError('Failed to create department', 500)
  }
}
