import { NextRequest } from 'next/server'
import { requireAdmin, apiError, apiSuccess, createAuditLog } from '@/lib/auth/helpers'
import { prisma } from '@/lib/db'
import { createEmployeeSchema } from '@/lib/validations'
import bcrypt from 'bcryptjs'

export async function GET(request: NextRequest) {
  const auth = await requireAdmin()
  if (!auth.success) return apiError(auth.error, auth.status)

  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const departmentId = searchParams.get('departmentId') || undefined
    const status = searchParams.get('status') || undefined
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10')))
    const skip = (page - 1) * limit

    const where: any = {}

    if (departmentId) {
      where.profile = { ...where.profile, departmentId }
    }

    if (status) {
      where.profile = { ...where.profile, status: status as any }
    }

    if (search) {
      where.OR = [
        { employeeId: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { profile: { firstName: { contains: search, mode: 'insensitive' } } },
        { profile: { lastName: { contains: search, mode: 'insensitive' } } },
      ]
    }

    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          employeeId: true,
          email: true,
          role: true,
          isEmailVerified: true,
          isActive: true,
          createdAt: true,
          profile: {
            include: {
              department: true,
              designation: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ])

    return apiSuccess({
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('[Employees GET Error]', error)
    return apiError('Failed to fetch employees', 500)
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin()
  if (!auth.success) return apiError(auth.error, auth.status)

  try {
    const body = await request.json()
    const parsed = createEmployeeSchema.safeParse(body)

    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message || 'Invalid input data', 400)
    }

    const data = parsed.data

    // Check unique employeeId
    const existingEmpId = await prisma.user.findUnique({ where: { employeeId: data.employeeId } })
    if (existingEmpId) return apiError('Employee ID already in use', 400)

    // Check unique email
    const existingEmail = await prisma.user.findUnique({ where: { email: data.email } })
    if (existingEmail) return apiError('Email address already registered', 400)

    const hashedPassword = await bcrypt.hash(data.password, 12)

    // Calculate gross & net salary defaults if provided
    const basic = data.basicSalary || 50000
    const hra = data.hra || 20000
    const allowances = data.allowances || 8000
    const pf = data.pf || 6000
    const deductions = data.deductions || 2000
    const gross = basic + hra + allowances
    const net = gross - pf - deductions

    const newEmployee = await prisma.user.create({
      data: {
        employeeId: data.employeeId,
        email: data.email,
        password: hashedPassword,
        role: data.role as any,
        isEmailVerified: true, // Admin-created accounts auto-verified
        profile: {
          create: {
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
            dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
            gender: data.gender,
            address: data.address,
            emergencyContact: data.emergencyContact,
            departmentId: data.departmentId,
            designationId: data.designationId,
            joiningDate: data.joiningDate ? new Date(data.joiningDate) : new Date(),
            employmentType: data.employmentType as any,
            reportingManagerId: data.reportingManagerId,
            status: 'ACTIVE',
          },
        },
        leaveBalance: {
          create: {
            paidLeave: 12,
            sickLeave: 8,
            casualLeave: 6,
            unpaidLeave: 0,
            year: new Date().getFullYear(),
          },
        },
        salaryComponent: {
          create: {
            basicSalary: basic,
            hra,
            allowances,
            pf,
            deductions,
            grossSalary: gross,
            netSalary: net,
          },
        },
      },
      select: {
        id: true,
        employeeId: true,
        email: true,
        role: true,
        profile: {
          include: {
            department: true,
            designation: true,
          },
        },
      },
    })

    await createAuditLog({
      userId: auth.user.id,
      action: 'CREATE_EMPLOYEE',
      entityType: 'User',
      entityId: newEmployee.id,
      metadata: { employeeId: newEmployee.employeeId, email: newEmployee.email },
      request,
    })

    return apiSuccess(newEmployee, 'Employee added successfully', 201)
  } catch (error) {
    console.error('[Employees POST Error]', error)
    return apiError('Failed to create employee', 500)
  }
}
