import { NextRequest } from 'next/server'
import { resendOTPSchema } from '@/lib/validations'
import { prisma } from '@/lib/db'
import { generateOTP, hashOTP, getVerifyEmailTemplate, getPasswordResetTemplate, sendEmail } from '@/lib/email'
import { apiError, apiSuccess } from '@/lib/auth/helpers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = resendOTPSchema.safeParse(body)

    if (!parsed.success) {
      return apiError('Invalid request parameters', 400)
    }

    const { email, purpose } = parsed.data

    // Check cooldown (must wait at least 30 seconds before resending)
    const recentOtp = await prisma.oTPVerification.findFirst({
      where: {
        email,
        purpose: purpose as any,
      },
      orderBy: { createdAt: 'desc' },
    })

    if (recentOtp) {
      const secondsSinceLast = (Date.now() - new Date(recentOtp.createdAt).getTime()) / 1000
      if (secondsSinceLast < 30) {
        const waitTime = Math.ceil(30 - secondsSinceLast)
        return apiError(`Please wait ${waitTime} seconds before requesting a new code.`, 429)
      }
    }

    // Invalidate old OTPs
    await prisma.oTPVerification.updateMany({
      where: { email, purpose: purpose as any, isUsed: false },
      data: { isUsed: true },
    })

    // Generate new OTP
    const otp = generateOTP(6)
    const otpHash = hashOTP(otp)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000)

    const user = await prisma.user.findUnique({ where: { email } })

    await prisma.oTPVerification.create({
      data: {
        email,
        otpHash,
        purpose: purpose as any,
        expiresAt,
        userId: user?.id,
      },
    })

    // Send email template based on purpose
    const emailPayload = purpose === 'EMAIL_VERIFICATION'
      ? getVerifyEmailTemplate(otp, email)
      : getPasswordResetTemplate(otp, email)

    await sendEmail(emailPayload)

    if (process.env.NODE_ENV !== 'production' || process.env.EMAIL_PROVIDER === 'console') {
      console.log(`\n🔑 [DEV MODE RESEND OTP] Email: ${email} | Purpose: ${purpose} | OTP: ${otp}\n`)
    }

    return apiSuccess({ sent: true }, 'A new verification code has been sent.')
  } catch (error) {
    console.error('[Resend OTP Error]', error)
    return apiError('Failed to resend code. Please try again.', 500)
  }
}
