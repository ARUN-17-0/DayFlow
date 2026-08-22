import { NextRequest } from 'next/server'
import { resetPasswordSchema } from '@/lib/validations'
import { prisma } from '@/lib/db'
import { verifyOTP } from '@/lib/email'
import bcrypt from 'bcryptjs'
import { apiError, apiSuccess } from '@/lib/auth/helpers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = resetPasswordSchema.safeParse(body)

    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message || 'Invalid data', 400)
    }

    const { email, otp, password } = parsed.data

    // Find the latest password reset OTP record
    const otpRecord = await prisma.oTPVerification.findFirst({
      where: {
        email,
        purpose: 'PASSWORD_RESET',
        isUsed: false,
      },
      orderBy: { createdAt: 'desc' },
    })

    if (!otpRecord) {
      return apiError('No reset code found. Please request a new password reset.', 400)
    }

    if (new Date() > new Date(otpRecord.expiresAt)) {
      return apiError('Reset code has expired. Please request a new one.', 400)
    }

    const isValid = verifyOTP(otp, otpRecord.otpHash)
    if (!isValid) {
      return apiError('Invalid reset code.', 400)
    }

    // Mark OTP as used
    await prisma.oTPVerification.update({
      where: { id: otpRecord.id },
      data: { isUsed: true },
    })

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Update user password
    const user = await prisma.user.findUnique({ where: { email } })
    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      })

      // Send security notification
      await prisma.notification.create({
        data: {
          userId: user.id,
          title: 'Password Changed',
          message: 'Your Dayflow account password was successfully updated.',
          type: 'SECURITY_EVENT',
        },
      })
    }

    return apiSuccess({ reset: true }, 'Password has been reset successfully. You can now sign in.')
  } catch (error) {
    console.error('[Reset Password Error]', error)
    return apiError('Failed to reset password. Please try again.', 500)
  }
}
