import { NextRequest } from 'next/server'
import { registerSchema } from '@/lib/validations'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { generateOTP, hashOTP, getVerifyEmailTemplate, sendEmail } from '@/lib/email'
import { apiError, apiSuccess } from '@/lib/auth/helpers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = registerSchema.safeParse(body)

    if (!parsed.success) {
      const errorMsg = parsed.error.issues[0]?.message || 'Invalid input data'
      return apiError(errorMsg, 400)
    }

    const { employeeId, email, password } = parsed.data

    // Check if email already registered
    const existingEmail = await prisma.user.findUnique({ where: { email } })
    if (existingEmail) {
      return apiError('An account with this email already exists', 400)
    }

    // Check if employeeId already registered
    const existingId = await prisma.user.findUnique({ where: { employeeId } })
    if (existingId) {
      return apiError('Employee ID is already registered', 400)
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Derive name from employeeId or email
    const nameParts = email.split('@')[0].split('.')
    const firstName = nameParts[0] ? nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1) : employeeId
    const lastName = nameParts[1] ? nameParts[1].charAt(0).toUpperCase() + nameParts[1].slice(1) : ''

    // Create user and profile in transaction
    const user = await prisma.user.create({
      data: {
        employeeId,
        email,
        password: hashedPassword,
        role: 'EMPLOYEE', // Default role always EMPLOYEE for public sign up
        isEmailVerified: false,
        profile: {
          create: {
            firstName,
            lastName,
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
            basicSalary: 45000,
            hra: 18000,
            allowances: 7000,
            pf: 5400,
            deductions: 1600,
            grossSalary: 70000,
            netSalary: 63000,
          },
        },
      },
    })

    // Generate 6-digit OTP
    const otp = generateOTP(6)
    const otpHash = hashOTP(otp)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes

    // Store hashed OTP
    await prisma.oTPVerification.create({
      data: {
        email,
        otpHash,
        purpose: 'EMAIL_VERIFICATION',
        expiresAt,
        userId: user.id,
      },
    })

    // Send verification email
    const emailPayload = getVerifyEmailTemplate(otp, email)
    await sendEmail(emailPayload)

    // In development mode, print OTP to console
    if (process.env.NODE_ENV !== 'production' || process.env.EMAIL_PROVIDER === 'console') {
      console.log(`\n🔑 [DEV MODE OTP] Email: ${email} | OTP: ${otp}\n`)
    }

    return apiSuccess(
      { email, employeeId },
      'Registration successful. Please verify your email with the OTP sent.'
    )
  } catch (error) {
    console.error('[Register API Error]', error)
    return apiError('Registration failed. Please try again.', 500)
  }
}
