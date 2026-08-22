import { NextRequest } from 'next/server'
import { forgotPasswordSchema } from '@/lib/validations'
import { prisma } from '@/lib/db'
import { generateOTP, hashOTP, getPasswordResetTemplate, sendEmail } from '@/lib/email'
import { apiError, apiSuccess } from '@/lib/auth/helpers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = forgotPasswordSchema.safeParse(body)

    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message || 'Invalid email', 400)
    }

    const { email } = parsed.data

    // Find user by email
    const user = await prisma.user.findUnique({ where: { email } })

    // Generic success response even if email doesn't exist (prevents email enumeration)
    if (!user) {
      return apiSuccess({ sent: true }, 'If an account exists with this email, a reset code has been sent.')
    }

    // Invalidate old password reset OTPs
    await prisma.oTPVerification.updateMany({
      where: { email, purpose: 'PASSWORD_RESET', isUsed: false },
      data: { isUsed: true },
    })

    // Generate 6-digit OTP
    const otp = generateOTP(6)
    const otpHash = hashOTP(otp)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000)

    await prisma.oTPVerification.create({
      data: {
        email,
        otpHash,
        purpose: 'PASSWORD_RESET',
        expiresAt,
        userId: user.id,
      },
    })

    // Send reset email
    const emailPayload = getPasswordResetTemplate(otp, email)
    await sendEmail(emailPayload)

    if (process.env.NODE_ENV !== 'production' || process.env.EMAIL_PROVIDER === 'console') {
      console.log(`\n🔑 [DEV MODE FORGOT PASSWORD] Email: ${email} | OTP: ${otp}\n`)
    }

    return apiSuccess({ sent: true }, 'If an account exists with this email, a reset code has been sent.')
  } catch (error) {
    console.error('[Forgot Password Error]', error)
    return apiError('Failed to process request. Please try again.', 500)
  }
}
