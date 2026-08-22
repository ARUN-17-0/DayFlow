/**
 * Dayflow Auth Helpers
 * Server-side auth utilities for session validation and RBAC
 */

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'
import { prisma } from '@/lib/db'

export type AuthUser = {
  id: string
  email: string
  employeeId: string
  role: 'ADMIN' | 'HR_OFFICER' | 'EMPLOYEE'
  isEmailVerified: boolean
}

export type AuthResult =
  | { success: true; user: AuthUser }
  | { success: false; error: string; status: number }

/**
 * Get the current authenticated user from the session.
 */
export async function getAuthUser(): Promise<AuthResult> {
  try {
    const session = await getServerSession(authOptions)

    const sessionUserId = (session?.user as any)?.id
    if (!sessionUserId) {
      return { success: false, error: 'Unauthorized', status: 401 }
    }

    const user = await prisma.user.findUnique({
      where: { id: sessionUserId },
      select: {
        id: true,
        email: true,
        employeeId: true,
        role: true,
        isEmailVerified: true,
        isActive: true,
      },
    })

    if (!user) {
      return { success: false, error: 'User not found', status: 401 }
    }

    if (!user.isActive) {
      return { success: false, error: 'Account is inactive', status: 403 }
    }

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        employeeId: user.employeeId,
        role: user.role as AuthUser['role'],
        isEmailVerified: user.isEmailVerified,
      },
    }
  } catch {
    return { success: false, error: 'Authentication failed', status: 500 }
  }
}

/**
 * Require admin or HR role.
 */
export async function requireAdmin(): Promise<AuthResult> {
  const result = await getAuthUser()
  if (!result.success) return result

  if (!['ADMIN', 'HR_OFFICER'].includes(result.user.role)) {
    return { success: false, error: 'Forbidden: Admin access required', status: 403 }
  }

  return result
}

/**
 * Require strict Admin role.
 */
export async function requireStrictAdmin(): Promise<AuthResult> {
  const result = await getAuthUser()
  if (!result.success) return result

  if (result.user.role !== 'ADMIN') {
    return { success: false, error: 'Forbidden: Super admin access required', status: 403 }
  }

  return result
}

/**
 * Check resource ownership/access
 */
export function canAccessUser(authUser: AuthUser, targetUserId: string): boolean {
  if (['ADMIN', 'HR_OFFICER'].includes(authUser.role)) return true
  return authUser.id === targetUserId
}

/**
 * Standard JSON error response
 */
export function apiError(message: string, status: number = 400) {
  return Response.json({ success: false, error: message }, { status })
}

/**
 * Standard JSON success response
 */
export function apiSuccess<T>(data: T, message?: string, status: number = 200) {
  return Response.json({ success: true, ...(message ? { message } : {}), data }, { status })
}

/**
 * Create audit log entry for admin actions
 */
export async function createAuditLog(params: {
  userId: string
  action: string
  entityType: string
  entityId?: string
  metadata?: Record<string, unknown>
  request?: Request
}) {
  try {
    const headers = params.request?.headers
    await prisma.auditLog.create({
      data: {
        userId: params.userId,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        metadata: (params.metadata as any) || undefined,
        ipAddress: headers?.get('x-forwarded-for') || headers?.get('x-real-ip'),
        userAgent: headers?.get('user-agent'),
      },
    })
  } catch (error) {
    console.error('[AuditLog Error]', error)
  }
}
