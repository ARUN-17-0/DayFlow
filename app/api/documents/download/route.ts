import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser, apiError } from '@/lib/auth/helpers'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const docType = searchParams.get('type') || 'OFFER_LETTER'
  const auth = await getAuthUser()

  if (!auth.success) return apiError(auth.error, auth.status)

  const profile = await prisma.employeeProfile.findUnique({
    where: { userId: auth.user.id },
  })

  const userName = profile ? `${profile.firstName} ${profile.lastName}` : 'Arun Karthik'
  const employeeId = auth.user.employeeId || 'EMP003'

  let htmlContent = ''

  if (docType === 'OFFER_LETTER') {
    htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Offer Letter - ${userName}</title>
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1e293b; padding: 40px; max-width: 800px; margin: 0 auto; line-height: 1.6; }
    .header { border-bottom: 2px solid #6d28d9; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
    .company-title { font-size: 24px; font-weight: bold; color: #5b21b6; }
    .doc-title { font-size: 18px; font-weight: bold; text-transform: uppercase; color: #475569; letter-spacing: 1px; }
    .meta-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    .meta-table td { padding: 8px 0; font-size: 14px; }
    .meta-label { font-weight: bold; color: #64748b; width: 140px; }
    .content { font-size: 14px; color: #334155; margin-bottom: 30px; }
    .ctc-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .ctc-table th, .ctc-table td { border: 1px solid #cbd5e1; padding: 10px; text-align: left; font-size: 13px; }
    .ctc-table th { background-color: #f1f5f9; font-weight: bold; color: #1e293b; }
    .ctc-total { background-color: #f8fafc; font-weight: bold; }
    .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; }
    .stamp { border: 2px dashed #6d28d9; color: #6d28d9; padding: 10px 15px; border-radius: 8px; font-weight: bold; text-transform: uppercase; font-size: 11px; display: inline-block; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="company-title">Dayflow Technologies Pvt Ltd</div>
      <div style="font-size: 12px; color: #64748b;">123 Tech Park, Koramangala, Bangalore - 560034</div>
    </div>
    <div class="stamp">Official Employment Record</div>
  </div>

  <div style="text-align: center; margin-bottom: 25px;">
    <h2 class="doc-title">LETTER OF EMPLOYMENT OFFER</h2>
    <div style="font-size: 12px; color: #64748b;">Ref: DAYFLOW/HR/2022/OFF-094</div>
  </div>

  <table class="meta-table">
    <tr>
      <td class="meta-label">Date:</td>
      <td>01 June 2022</td>
      <td class="meta-label">Employee ID:</td>
      <td><strong>${employeeId}</strong></td>
    </tr>
    <tr>
      <td class="meta-label">Candidate Name:</td>
      <td><strong>${userName}</strong></td>
      <td class="meta-label">Designation:</td>
      <td>Senior Software Engineer</td>
    </tr>
    <tr>
      <td class="meta-label">Department:</td>
      <td>Engineering</td>
      <td class="meta-label">Joining Date:</td>
      <td>01 July 2022</td>
    </tr>
  </table>

  <div class="content">
    <p>Dear <strong>${userName}</strong>,</p>
    <p>We are delighted to offer you the position of <strong>Senior Software Engineer</strong> at <strong>Dayflow Technologies Pvt Ltd</strong>. We were immensely impressed with your technical capabilities, background, and alignment with our company values.</p>

    <h4 style="color: #1e293b; margin-top: 20px;">1. Compensation Structure</h4>
    <p>Your total Annual Gross Compensation (CTC) will be <strong>₹18,12,000 (Eighteen Lakh Twelve Thousand Rupees Only)</strong> per annum, broken down as follows:</p>

    <table class="ctc-table">
      <thead>
        <tr>
          <th>Salary Component</th>
          <th>Monthly (₹)</th>
          <th>Annual (₹)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Basic Salary</td>
          <td>95,000</td>
          <td>11,40,000</td>
        </tr>
        <tr>
          <td>House Rent Allowance (HRA)</td>
          <td>38,000</td>
          <td>4,56,000</td>
        </tr>
        <tr>
          <td>Special Allowances</td>
          <td>18,000</td>
          <td>2,16,000</td>
        </tr>
        <tr class="ctc-total">
          <td>Total Gross Compensation (CTC)</td>
          <td>₹1,51,000</td>
          <td>₹18,12,000</td>
        </tr>
      </tbody>
    </table>

    <h4 style="color: #1e293b; margin-top: 20px;">2. Place of Work & Terms</h4>
    <p>Your primary location of work will be Bangalore, Karnataka. You will be subject to company policies regarding working hours, confidentiality, and professional code of conduct.</p>

    <p style="margin-top: 30px;">We look forward to welcoming you to the Dayflow team!</p>
  </div>

  <div class="footer">
    <div>
      <p style="font-weight: bold; margin-bottom: 40px;">For Dayflow Technologies Pvt Ltd</p>
      <div style="font-size: 14px; font-weight: bold; color: #5b21b6;">Kavitha Nair</div>
      <div style="font-size: 12px; color: #64748b;">Head of Human Resources</div>
    </div>
    <div style="text-align: right;">
      <p style="font-weight: bold; margin-bottom: 40px;">Accepted & Confirmed</p>
      <div style="font-size: 14px; font-weight: bold; color: #1e293b;">${userName}</div>
      <div style="font-size: 12px; color: #64748b;">Signature of Employee</div>
    </div>
  </div>
</body>
</html>
    `
  } else if (docType === 'CONTRACT') {
    htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Employment Contract - ${userName}</title>
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1e293b; padding: 40px; max-width: 800px; margin: 0 auto; line-height: 1.6; }
    .header { border-bottom: 2px solid #6d28d9; padding-bottom: 20px; margin-bottom: 30px; text-align: center; }
    .company-title { font-size: 22px; font-weight: bold; color: #5b21b6; }
    .doc-title { font-size: 18px; font-weight: bold; text-transform: uppercase; color: #334155; margin-top: 5px; }
    .clause-title { font-size: 14px; font-weight: bold; color: #5b21b6; margin-top: 20px; }
    p { font-size: 13px; color: #334155; }
    .footer { margin-top: 60px; padding-top: 20px; border-top: 1px solid #cbd5e1; display: flex; justify-content: space-between; }
  </style>
</head>
<body>
  <div class="header">
    <div class="company-title">DAYFLOW TECHNOLOGIES PVT LTD</div>
    <div class="doc-title">MASTER EMPLOYMENT AGREEMENT</div>
    <div style="font-size: 12px; color: #64748b;">Contract Ref: DAYFLOW/LEG/2022/EMP-003</div>
  </div>

  <p>This Employment Agreement is entered into on <strong>01 June 2022</strong> between <strong>Dayflow Technologies Pvt Ltd</strong> ("Employer") and <strong>${userName}</strong>, Employee ID: <strong>${employeeId}</strong> ("Employee").</p>

  <div class="clause-title">1. Position & Scope of Services</div>
  <p>The Employee is appointed as <strong>Senior Software Engineer</strong>. The Employee agrees to perform duties diligently and in good faith, reporting to the Department Manager of Engineering.</p>

  <div class="clause-title">2. Confidentiality & Non-Disclosure</div>
  <p>The Employee shall not disclose, copy, or use any proprietary software code, customer data, trade secrets, or confidential documentation during or after employment with Dayflow.</p>

  <div class="clause-title">3. Intellectual Property Assignment</div>
  <p>All software source code, patents, system architecture designs, and algorithms developed by the Employee during working hours shall remain the sole intellectual property of Dayflow Technologies Pvt Ltd.</p>

  <div class="clause-title">4. Termination & Notice Period</div>
  <p>Either party may terminate this agreement by providing a mandatory <strong>60 (Sixty) Days</strong> written notice or equivalent basic salary in lieu of notice.</p>

  <div class="footer">
    <div>
      <p style="font-weight: bold; margin-bottom: 40px;">Employer Representative</p>
      <div style="font-size: 14px; font-weight: bold; color: #5b21b6;">Kavitha Nair</div>
      <div style="font-size: 12px; color: #64748b;">HR Manager, Dayflow Technologies</div>
    </div>
    <div style="text-align: right;">
      <p style="font-weight: bold; margin-bottom: 40px;">Employee Acceptance</p>
      <div style="font-size: 14px; font-weight: bold; color: #1e293b;">${userName}</div>
      <div style="font-size: 12px; color: #64748b;">Signature & Date</div>
    </div>
  </div>
</body>
</html>
    `
  } else {
    htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Aadhaar Identity Verification - ${userName}</title>
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1e293b; padding: 40px; max-width: 800px; margin: 0 auto; line-height: 1.6; }
    .header { border-bottom: 2px solid #22c55e; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
    .status-badge { background: #dcfce7; color: #15803d; border: 1px solid #86efac; padding: 6px 14px; border-radius: 20px; font-weight: bold; font-size: 12px; }
    .card { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 12px; padding: 25px; margin-top: 20px; }
    .field { margin-bottom: 12px; }
    .label { font-size: 11px; font-weight: bold; text-transform: uppercase; color: #64748b; }
    .val { font-size: 15px; font-weight: bold; color: #0f172a; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h2 style="margin: 0; color: #0f172a;">Government ID Verification Record</h2>
      <div style="font-size: 12px; color: #64748b;">Verified via UIDAI Security Gate</div>
    </div>
    <div class="status-badge">✓ VERIFIED & APPROVED</div>
  </div>

  <div class="card">
    <div class="field">
      <div class="label">Full Name</div>
      <div class="val">${userName}</div>
    </div>
    <div class="field">
      <div class="label">Employee ID</div>
      <div class="val">${employeeId}</div>
    </div>
    <div class="field">
      <div class="label">Identity Document</div>
      <div class="val">Aadhaar Card (UIDAI)</div>
    </div>
    <div class="field">
      <div class="label">Aadhaar Number (Masked)</div>
      <div class="val">XXXX - XXXX - 4321</div>
    </div>
    <div class="field">
      <div class="label">Address Recorded</div>
      <div class="val">185, 2nd Cross, Koramangala, Bangalore, Karnataka - 560034</div>
    </div>
    <div class="field">
      <div class="label">Verification Date</div>
      <div class="val">05 June 2022</div>
    </div>
  </div>
</body>
</html>
    `
  }

  return new NextResponse(htmlContent, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Disposition': `inline; filename="${docType}_${employeeId}.html"`,
    },
  })
}
