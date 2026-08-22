import { NextRequest } from 'next/server'
import { getAuthUser, requireAdmin, apiError, apiSuccess, createAuditLog } from '@/lib/auth/helpers'
import { prisma } from '@/lib/db'
import { updateSalaryComponentSchema } from '@/lib/validations'

export async function GET(request: NextRequest) {
  const auth = await getAuthUser()
  if (!auth.success) return apiError(auth.error, auth.status)

  try {
    const { searchParams } = new URL(request.url)
    const isAdmin = ['ADMIN', 'HR_OFFICER'].includes(auth.user.role)
    const userIdParam = searchParams.get('userId')
    const targetUserId = isAdmin && userIdParam ? userIdParam : auth.user.id

    let component = await prisma.salaryComponent.findUnique({
      where: { userId: targetUserId },
    })

    if (!component) {
      component = await prisma.salaryComponent.create({
        data: {
          userId: targetUserId,
          basicSalary: 50000,
          hra: 20000,
          allowances: 8000,
          pf: 6000,
          deductions: 2000,
          grossSalary: 78000,
          netSalary: 70000,
        },
      })
    }

    return apiSuccess(component)
  } catch (error) {
    console.error('[SalaryComponent GET Error]', error)
    return apiError('Failed to fetch salary structure', 500)
  }
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdmin()
  if (!auth.success) return apiError(auth.error, auth.status)

  try {
    const body = await request.json()
    const { userId, ...salaryData } = body

    if (!userId) return apiError('userId is required', 400)

    const parsed = updateSalaryComponentSchema.safeParse(salaryData)
    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message || 'Invalid salary data', 400)
    }

    const { basicSalary, hra, allowances, pf, deductions } = parsed.data
    const grossSalary = basicSalary + hra + allowances
    const netSalary = grossSalary - pf - deductions

    const updated = await prisma.salaryComponent.upsert({
      where: { userId },
      update: {
        basicSalary,
        hra,
        allowances,
        pf,
        deductions,
        grossSalary,
        netSalary,
      },
      create: {
        userId,
        basicSalary,
        hra,
        allowances,
        pf,
        deductions,
        grossSalary,
        netSalary,
      },
    })

    await createAuditLog({
      userId: auth.user.id,
      action: 'UPDATE_SALARY_STRUCTURE',
      entityType: 'SalaryComponent',
      entityId: updated.id,
      metadata: { targetUserId: userId, netSalary },
      request,
    })

    return apiSuccess(updated, 'Salary structure updated successfully')
  } catch (error) {
    console.error('[SalaryComponent PUT Error]', error)
    return apiError('Failed to update salary structure', 500)
  }
}
