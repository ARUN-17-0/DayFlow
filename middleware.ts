import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

const PUBLIC_ROUTES = ['/', '/sign-in', '/sign-up', '/verify-email', '/forgot-password', '/reset-password']
const EMPLOYEE_ROUTES = ['/my-day', '/dashboard', '/profile', '/attendance', '/time-off', '/payroll', '/documents', '/notifications', '/settings']
const ADMIN_ROUTES = ['/admin']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public assets, API routes for auth
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/otp') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next()
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  const isPublicRoute = PUBLIC_ROUTES.some((r) => pathname === r || pathname.startsWith(r + '/'))
  const isAdminRoute = pathname.startsWith('/admin')
  const isEmployeeRoute = EMPLOYEE_ROUTES.some((r) => pathname === r || pathname.startsWith(r + '/'))
  const isApiRoute = pathname.startsWith('/api/')

  // Not authenticated
  if (!token) {
    if (isPublicRoute || isApiRoute) return NextResponse.next()
    const loginUrl = new URL('/sign-in', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  const userRole = token.role as string
  const isEmailVerified = token.isEmailVerified as boolean

  // Redirect authenticated user away from auth pages
  if (isPublicRoute && pathname !== '/') {
    const redirect = userRole === 'ADMIN' || userRole === 'HR_OFFICER'
      ? '/admin/dashboard'
      : '/my-day'
    return NextResponse.redirect(new URL(redirect, request.url))
  }

  // Email not verified — only allow verify-email page
  if (!isEmailVerified && !pathname.startsWith('/verify-email') && !isApiRoute) {
    return NextResponse.redirect(new URL(`/verify-email?email=${encodeURIComponent(token.email as string)}`, request.url))
  }

  // Admin route protection
  if (isAdminRoute && !['ADMIN', 'HR_OFFICER'].includes(userRole)) {
    return NextResponse.redirect(new URL('/my-day', request.url))
  }

  // Employee route protection (admins can also access employee routes)
  if (isEmployeeRoute && ['ADMIN', 'HR_OFFICER'].includes(userRole)) {
    // Allow admins to use employee routes if needed
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}
