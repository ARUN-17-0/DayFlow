/**
 * Dayflow Email Service
 * Supports: console (dev), Resend (production), SMTP
 * OTP is NEVER exposed in frontend or response body.
 */

import crypto from 'crypto'

export type EmailPayload = {
  to: string
  subject: string
  html: string
  text?: string
}

// ─────────────────────────────────────────────────────────
// OTP Utilities
// ─────────────────────────────────────────────────────────

export function generateOTP(length = 6): string {
  const digits = '0123456789'
  let otp = ''
  const bytes = crypto.randomBytes(length)
  for (let i = 0; i < length; i++) {
    otp += digits[bytes[i] % digits.length]
  }
  return otp
}

export function hashOTP(otp: string): string {
  return crypto.createHash('sha256').update(otp).digest('hex')
}

export function verifyOTP(otp: string, hash: string): boolean {
  const otpHash = hashOTP(otp)
  return crypto.timingSafeEqual(Buffer.from(otpHash), Buffer.from(hash))
}

// ─────────────────────────────────────────────────────────
// Email Templates
// ─────────────────────────────────────────────────────────

function emailWrapper(content: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Dayflow</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif; background: #F4F3F7; color: #18181B; }
    .container { max-width: 560px; margin: 40px auto; background: #FFFFFF; border-radius: 16px; border: 1px solid #E4E4E7; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06); }
    .header { background: linear-gradient(135deg, #6D28D9 0%, #5B21B6 100%); padding: 32px; text-align: center; }
    .logo { color: white; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
    .logo span { opacity: 0.7; font-weight: 400; font-size: 14px; display: block; margin-top: 4px; }
    .body { padding: 40px 32px; }
    .otp-box { background: #F0EEFF; border: 2px dashed #8B5CF6; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0; }
    .otp-code { font-size: 42px; font-weight: 700; letter-spacing: 12px; color: #6D28D9; font-variant-numeric: tabular-nums; }
    .otp-expires { font-size: 13px; color: #71717A; margin-top: 8px; }
    .btn { display: inline-block; background: #6D28D9; color: white; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 15px; margin: 16px 0; }
    .footer { padding: 20px 32px; border-top: 1px solid #E4E4E7; text-align: center; }
    .footer p { font-size: 12px; color: #A1A1AA; }
    h2 { font-size: 22px; font-weight: 700; color: #18181B; margin-bottom: 12px; }
    p { color: #71717A; font-size: 14px; line-height: 1.6; margin-bottom: 12px; }
    .warning { background: #FEF3C7; border-left: 3px solid #F59E0B; padding: 12px 16px; border-radius: 6px; font-size: 13px; color: #92400E; margin-top: 16px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">
        ◆ Dayflow
        <span>Every workday, perfectly aligned.</span>
      </div>
    </div>
    <div class="body">${content}</div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Dayflow Technologies Pvt Ltd. All rights reserved.</p>
      <p>This is an automated message. Please do not reply.</p>
    </div>
  </div>
</body>
</html>
  `.trim()
}

export function getVerifyEmailTemplate(otp: string, email: string): EmailPayload {
  const html = emailWrapper(`
    <h2>Verify your email address</h2>
    <p>Welcome to Dayflow! To get started, please verify your email address <strong>${email}</strong> using the code below.</p>
    <div class="otp-box">
      <div class="otp-code">${otp.split('').join(' ')}</div>
      <div class="otp-expires">This code expires in 5 minutes</div>
    </div>
    <div class="warning">
      Never share this code with anyone. Dayflow will never ask for your OTP.
    </div>
  `)
  return {
    to: email,
    subject: 'Verify your Dayflow account',
    html,
    text: `Your Dayflow verification code is: ${otp}. It expires in 5 minutes.`,
  }
}

export function getPasswordResetTemplate(otp: string, email: string): EmailPayload {
  const html = emailWrapper(`
    <h2>Reset your password</h2>
    <p>We received a request to reset the password for your Dayflow account <strong>${email}</strong>. Use the code below to proceed.</p>
    <div class="otp-box">
      <div class="otp-code">${otp.split('').join(' ')}</div>
      <div class="otp-expires">This code expires in 5 minutes</div>
    </div>
    <p>If you did not request a password reset, please ignore this email and your password will remain unchanged.</p>
    <div class="warning">
      Never share this code with anyone. Dayflow will never ask for your OTP.
    </div>
  `)
  return {
    to: email,
    subject: 'Reset your Dayflow password',
    html,
    text: `Your Dayflow password reset code is: ${otp}. It expires in 5 minutes.`,
  }
}

export function getLeaveApprovedTemplate(
  email: string,
  employeeName: string,
  leaveType: string,
  startDate: string,
  endDate: string,
  comment?: string,
): EmailPayload {
  const html = emailWrapper(`
    <h2>Your leave request has been approved ✓</h2>
    <p>Hi <strong>${employeeName}</strong>,</p>
    <p>Your <strong>${leaveType}</strong> leave request from <strong>${startDate}</strong> to <strong>${endDate}</strong> has been approved.</p>
    ${comment ? `<p><em>Reviewer note: "${comment}"</em></p>` : ''}
    <p>Please ensure to handover any pending work before your leave begins.</p>
  `)
  return {
    to: email,
    subject: 'Leave Request Approved — Dayflow',
    html,
    text: `Your ${leaveType} leave from ${startDate} to ${endDate} has been approved.`,
  }
}

export function getLeaveRejectedTemplate(
  email: string,
  employeeName: string,
  leaveType: string,
  startDate: string,
  endDate: string,
  comment?: string,
): EmailPayload {
  const html = emailWrapper(`
    <h2>Your leave request has been declined</h2>
    <p>Hi <strong>${employeeName}</strong>,</p>
    <p>Your <strong>${leaveType}</strong> leave request from <strong>${startDate}</strong> to <strong>${endDate}</strong> has been declined.</p>
    ${comment ? `<p><em>Reviewer note: "${comment}"</em></p>` : ''}
    <p>Please reach out to HR if you have any questions.</p>
  `)
  return {
    to: email,
    subject: 'Leave Request Declined — Dayflow',
    html,
    text: `Your ${leaveType} leave from ${startDate} to ${endDate} has been declined. ${comment ? `Reason: ${comment}` : ''}`,
  }
}

export function getSalarySlipTemplate(
  email: string,
  employeeName: string,
  month: string,
  year: number,
): EmailPayload {
  const html = emailWrapper(`
    <h2>Your salary slip is ready 💰</h2>
    <p>Hi <strong>${employeeName}</strong>,</p>
    <p>Your salary slip for <strong>${month} ${year}</strong> has been generated and is now available in your Dayflow account.</p>
    <p>Log in to download your salary slip from the Payroll section.</p>
    <a href="${process.env.NEXT_PUBLIC_APP_URL}/payroll" class="btn">View Salary Slip</a>
  `)
  return {
    to: email,
    subject: `Salary Slip Ready — ${month} ${year} — Dayflow`,
    html,
    text: `Your salary slip for ${month} ${year} is ready. Visit ${process.env.NEXT_PUBLIC_APP_URL}/payroll to download it.`,
  }
}

// ─────────────────────────────────────────────────────────
// Email Senders
// ─────────────────────────────────────────────────────────

async function sendViaConsole(payload: EmailPayload): Promise<void> {
  console.log('\n' + '═'.repeat(60))
  console.log('📧 [Dayflow Dev Email]')
  console.log('═'.repeat(60))
  console.log(`To:      ${payload.to}`)
  console.log(`Subject: ${payload.subject}`)
  console.log('─'.repeat(60))
  if (payload.text) console.log(payload.text)
  console.log('═'.repeat(60) + '\n')
}

async function sendViaResend(payload: EmailPayload): Promise<void> {
  const { Resend } = await import('resend')
  const resend = new Resend(process.env.RESEND_API_KEY)
  const from = process.env.EMAIL_FROM || 'Dayflow <noreply@dayflow.io>'
  const result = await resend.emails.send({
    from,
    to: payload.to,
    subject: payload.subject,
    html: payload.html,
    text: payload.text,
  })
  if (result.error) throw new Error(`Resend error: ${result.error.message}`)
}

async function sendViaSMTP(payload: EmailPayload): Promise<void> {
  const nodemailer = await import('nodemailer')
  const transporter = nodemailer.default.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: Number(process.env.EMAIL_SERVER_PORT) || 587,
    secure: Number(process.env.EMAIL_SERVER_PORT) === 465,
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
  })
  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'Dayflow <noreply@dayflow.io>',
    to: payload.to,
    subject: payload.subject,
    html: payload.html,
    text: payload.text,
  })
}

export async function sendEmail(payload: EmailPayload): Promise<{ success: boolean; error?: string }> {
  try {
    const provider = process.env.EMAIL_PROVIDER || 'console'

    if (process.env.NODE_ENV !== 'production' || provider === 'console') {
      await sendViaConsole(payload)
      return { success: true }
    }

    if (provider === 'resend') {
      await sendViaResend(payload)
    } else if (provider === 'smtp') {
      await sendViaSMTP(payload)
    } else {
      await sendViaConsole(payload)
    }

    return { success: true }
  } catch (error) {
    console.error('[Email Error]', error)
    return { success: false, error: 'Failed to send email' }
  }
}
