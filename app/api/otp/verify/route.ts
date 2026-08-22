import { NextRequest } from 'next/server'
import { verifyOTPSchema } from '@/lib/validations'
import { prisma } from '@/lib/db'
import { verifyOTP } from '@/lib/email'
import { apiError, apiSuccess } from '@/lib/auth/helpers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = verifyOTPSchema.safeParse(body)

    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message || 'Invalid input', 400)
    }

    const { email, otp, purpose } = parsed.data

    // Find the latest unused OTP verification record
    const otpRecord = await prisma.oTPVerification.findFirst({
      where: {
        email,
        purpose: purpose as any,
        isUsed: false,
      },
      orderBy: { createdAt: 'desc' },
    })

    if (!otpRecord) {
      return apiError('No verification code found. Please request a new code.', 400)
    }

    // Check attempts limit
    if (otpRecord.attempts >= 5) {
      return apiError('Too many failed attempts. Please request a new code.', 400)
    }

    // Increment attempts
    await prisma.oTPVerification.update({
      where: { id: otpRecord.id },
      data: { attempts: { increment: 1 } },
    })

    // Check expiry
    if (new Date() > new Date(otpRecord.expiresAt)) {
      return apiError('Verification code has expired. Please request a new code.', 400)
    }

    // Verify OTP timing-safe
    const isValid = verifyOTP(otp, otpRecord.otpHash)

    if (!isValid) {
      return apiError('Invalid verification code. Please check and try again.', 400)
    }

    // Mark OTP as used
    await prisma.oTPVerification.update({
      where: { id: otpRecord.id },
      data: { isUsed: true },
    })

    // If purpose is EMAIL_VERIFICATION, mark user email as verified
    if (purpose === 'EMAIL_VERIFICATION') {
      const user = await prisma.user.findUnique({ where: { email } })
      if (user) {
        await prisma.user.update({
          where: { id: user.id },
          data: { isEmailVerified: true },
        })

        // Create welcome notification
        await prisma.notification.create({
          data: {
            userId: user.id,
            title: 'Email Verified',
            message: 'Your email address has been successfully verified. Welcome to Dayflow!',
            type: 'EMAIL_VERIFIED',
          },
        })
      }
    }

    return apiSuccess({ verified: true, email }, 'Verification successful!')
  } catch (error) {
    console.error('[Verify OTP Error]', error)
    return apiError('Verification failed. Please try again.', 500)
  }
}
