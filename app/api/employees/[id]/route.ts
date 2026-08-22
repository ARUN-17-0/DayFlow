import { NextRequest } from 'next/server'
import { getAuthUser, requireAdmin, canAccessUser, apiError, apiSuccess, createAuditLog } from '@/lib/auth/helpers'
import { prisma } from '@/lib/db'
import { updateEmployeeSchema, updateProfileSchema } from '@/lib/validations'

export function generateStaticParams() {
  return [{ id: 'demo' }]
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthUser()
  if (!auth.success) return apiError(auth.error, auth.status)

  const { id } = await params

  if (!canAccessUser(auth.user, id)) {
    return apiError('Forbidden: Cannot view other employee details', 403)
  }

  try {
    const employee = await prisma.user.findUnique({
      where: { id },
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
            reportingManager: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        salaryComponent: true,
        leaveBalance: true,
        documents: true,
      },
    })

    if (!employee) return apiError('Employee not found', 404)

    return apiSuccess(employee)
  } catch (error) {
    console.error('[Employee GET ID Error]', error)
    return apiError('Failed to fetch employee', 500)
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthUser()
  if (!auth.success) return apiError(auth.error, auth.status)

  const { id } = await params
  const isAdmin = ['ADMIN', 'HR_OFFICER'].includes(auth.user.role)

  if (!isAdmin && auth.user.id !== id) {
    return apiError('Forbidden: Cannot edit other employee details', 403)
  }

  try {
    const body = await request.json()

    // Non-admin can only update basic profile fields
    if (!isAdmin) {
      const parsed = updateProfileSchema.safeParse(body)
      if (!parsed.success) return apiError(parsed.error.issues[0]?.message || 'Invalid input', 400)

      const updated = await prisma.employeeProfile.update({
        where: { userId: id },
        data: {
          firstName: parsed.data.firstName,
          lastName: parsed.data.lastName,
          phone: parsed.data.phone,
          dateOfBirth: parsed.data.dateOfBirth ? new Date(parsed.data.dateOfBirth) : undefined,
          gender: parsed.data.gender,
          address: parsed.data.address,
          emergencyContact: parsed.data.emergencyContact,
        },
      })

      return apiSuccess(updated, 'Profile updated successfully')
    }

    // Admin update
    const parsed = updateEmployeeSchema.safeParse(body)
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message || 'Invalid input', 400)

    const data = parsed.data

    if (data.role) {
      await prisma.user.update({
        where: { id },
        data: { role: data.role as any },
      })
    }

    const updatedProfile = await prisma.employeeProfile.update({
      where: { userId: id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
        gender: data.gender,
        address: data.address,
        emergencyContact: data.emergencyContact,
        departmentId: data.departmentId,
        designationId: data.designationId,
        joiningDate: data.joiningDate ? new Date(data.joiningDate) : undefined,
        employmentType: data.employmentType as any,
        reportingManagerId: data.reportingManagerId,
        status: data.status as any,
      },
      include: {
        department: true,
        designation: true,
      },
    })

    await createAuditLog({
      userId: auth.user.id,
      action: 'UPDATE_EMPLOYEE',
      entityType: 'User',
      entityId: id,
      request,
    })

    return apiSuccess(updatedProfile, 'Employee updated successfully')
  } catch (error) {
    console.error('[Employee PUT Error]', error)
    return apiError('Failed to update employee', 500)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin()
  if (!auth.success) return apiError(auth.error, auth.status)

  const { id } = await params

  try {
    // Soft delete employee
    await prisma.user.update({
      where: { id },
      data: {
        isActive: false,
        profile: {
          update: { status: 'TERMINATED' },
        },
      },
    })

    await createAuditLog({
      userId: auth.user.id,
      action: 'DEACTIVATE_EMPLOYEE',
      entityType: 'User',
      entityId: id,
      request,
    })

    return apiSuccess({ deactivated: true }, 'Employee account deactivated')
  } catch (error) {
    console.error('[Employee DELETE Error]', error)
    return apiError('Failed to deactivate employee', 500)
  }
}

