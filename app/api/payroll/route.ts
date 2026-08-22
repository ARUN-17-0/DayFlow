import { NextRequest } from 'next/server'
import { getAuthUser, requireAdmin, apiError, apiSuccess, createAuditLog } from '@/lib/auth/helpers'
import { prisma } from '@/lib/db'
import { generatePayrollSchema } from '@/lib/validations'
import { getSalarySlipTemplate, sendEmail } from '@/lib/email'
import { getMonthName } from '@/lib/utils'

export async function GET(request: NextRequest) {
  const auth = await getAuthUser()
  if (!auth.success) return apiError(auth.error, auth.status)

  try {
    const { searchParams } = new URL(request.url)
    const isAdmin = ['ADMIN', 'HR_OFFICER'].includes(auth.user.role)
    const userIdParam = searchParams.get('userId')
    const month = searchParams.get('month') ? parseInt(searchParams.get('month')!) : undefined
    const year = searchParams.get('year') ? parseInt(searchParams.get('year')!) : undefined
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')))
    const skip = (page - 1) * limit

    const where: any = {}

    if (!isAdmin) {
      where.userId = auth.user.id
    } else if (userIdParam) {
      where.userId = userIdParam
    }

    if (month) where.month = month
    if (year) where.year = year

    const [items, total] = await Promise.all([
      prisma.payrollRecord.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              employeeId: true,
              email: true,
              profile: {
                select: {
                  firstName: true,
                  lastName: true,
                  avatar: true,
                  department: true,
                  designation: true,
                },
              },
            },
          },
        },
        orderBy: [{ year: 'desc' }, { month: 'desc' }],
        skip,
        take: limit,
      }),
      prisma.payrollRecord.count({ where }),
    ])

    return apiSuccess({
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('[Payroll GET Error]', error)
    return apiError('Failed to fetch payroll records', 500)
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin()
  if (!auth.success) return apiError(auth.error, auth.status)

  try {
    const body = await request.json()
    const parsed = generatePayrollSchema.safeParse(body)

    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message || 'Invalid payroll generation data', 400)
    }

    const { userIds, month, year } = parsed.data

    let generatedCount = 0

    for (const userId of userIds) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          profile: { include: { department: true, designation: true } },
          salaryComponent: true,
        },
      })

      if (!user || !user.salaryComponent) continue

      const sc = user.salaryComponent

      // Upsert payroll record for this user, month, year
      const payroll = await prisma.payrollRecord.upsert({
        where: {
          userId_month_year: { userId, month, year },
        },
        update: {
          basicSalary: sc.basicSalary,
          hra: sc.hra,
          allowances: sc.allowances,
          pf: sc.pf,
          deductions: sc.deductions,
          grossSalary: sc.grossSalary,
          netSalary: sc.netSalary,
          status: 'PAID',
          paidAt: new Date(),
          generatedById: auth.user.id,
        },
        create: {
          userId,
          month,
          year,
          basicSalary: sc.basicSalary,
          hra: sc.hra,
          allowances: sc.allowances,
          pf: sc.pf,
          deductions: sc.deductions,
          grossSalary: sc.grossSalary,
          netSalary: sc.netSalary,
          status: 'PAID',
          paidAt: new Date(),
          generatedById: auth.user.id,
        },
      })

      // Generate SalarySlip record with JSON payload
      const slipData = {
        payrollId: payroll.id,
        employeeId: user.employeeId,
        employeeName: `${user.profile?.firstName || ''} ${user.profile?.lastName || ''}`.trim(),
        department: user.profile?.department?.name || 'General',
        designation: user.profile?.designation?.name || 'Staff',
        month: getMonthName(month),
        year,
        basicSalary: sc.basicSalary,
        hra: sc.hra,
        allowances: sc.allowances,
        pf: sc.pf,
        deductions: sc.deductions,
        grossSalary: sc.grossSalary,
        netSalary: sc.netSalary,
        generatedAt: new Date().toISOString(),
      }

      await prisma.salarySlip.upsert({
        where: { payrollId: payroll.id },
        update: { slipData: slipData as any },
        create: {
          payrollId: payroll.id,
          userId,
          slipData: slipData as any,
        },
      })

      // Send notification
      const monthName = getMonthName(month)
      await prisma.notification.create({
        data: {
          userId,
          title: 'Salary Slip Available',
          message: `Your salary slip for ${monthName} ${year} is ready.`,
          type: 'SALARY_GENERATED',
          relatedEntityId: payroll.id,
          relatedEntityType: 'PayrollRecord',
        },
      })

      // Send email
      const emailPayload = getSalarySlipTemplate(user.email, slipData.employeeName, monthName, year)
      await sendEmail(emailPayload)

      generatedCount++
    }

    await createAuditLog({
      userId: auth.user.id,
      action: 'GENERATE_PAYROLL',
      entityType: 'PayrollRecord',
      metadata: { month, year, count: generatedCount },
      request,
    })

    return apiSuccess({ generatedCount }, `Successfully generated ${generatedCount} salary slip(s).`)
  } catch (error) {
    console.error('[Payroll POST Error]', error)
    return apiError('Failed to generate payroll', 500)
  }
}
