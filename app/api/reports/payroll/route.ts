import { NextRequest } from 'next/server'
import { requireAdmin, apiError, apiSuccess } from '@/lib/auth/helpers'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  const auth = await requireAdmin()
  if (!auth.success) return apiError(auth.error, auth.status)

  try {
    const { searchParams } = new URL(request.url)
    const year = searchParams.get('year') ? parseInt(searchParams.get('year')!) : new Date().getFullYear()

    const records = await prisma.payrollRecord.findMany({
      where: { year },
      include: {
        user: {
          select: {
            profile: {
              select: { department: true },
            },
          },
        },
      },
    })

    const totalPayout = records.reduce((acc, r) => acc + r.netSalary, 0)
    const averageSalary = records.length > 0 ? totalPayout / records.length : 0

    // Department breakdown
    const deptMap: Record<string, { name: string; count: number; total: number }> = {}

    records.forEach((r) => {
      const deptName = r.user?.profile?.department?.name || 'General'
      if (!deptMap[deptName]) {
        deptMap[deptName] = { name: deptName, count: 0, total: 0 }
      }
      deptMap[deptName].count++
      deptMap[deptName].total += r.netSalary
    })

    return apiSuccess({
      year,
      totalPayout,
      averageSalary,
      recordCount: records.length,
      departmentBreakdown: Object.values(deptMap),
    })
  } catch (error) {
    console.error('[Payroll Report Error]', error)
    return apiError('Failed to generate payroll report', 500)
  }
}
