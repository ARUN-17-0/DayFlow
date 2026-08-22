import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser, apiError } from '@/lib/auth/helpers'
import { prisma } from '@/lib/db'
import { getMonthName } from '@/lib/utils'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthUser()
  if (!auth.success) return apiError(auth.error, auth.status)

  const { id } = await params

  try {
    const payroll = await prisma.payrollRecord.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            employeeId: true,
            email: true,
            profile: {
              include: {
                department: true,
                designation: true,
              },
            },
          },
        },
      },
    })

    if (!payroll) {
      return apiError('Payroll record not found', 404)
    }

    const isAdmin = ['ADMIN', 'HR_OFFICER'].includes(auth.user.role)
    if (!isAdmin && payroll.userId !== auth.user.id) {
      return apiError('Forbidden: Cannot view other employee salary slip', 403)
    }

    const userProfile = payroll.user?.profile
    const employeeName = userProfile
      ? `${userProfile.firstName} ${userProfile.lastName}`
      : 'Arun Karthik'
    const employeeId = payroll.user?.employeeId || 'EMP003'
    const designation = userProfile?.designation?.name || 'Senior Software Engineer'
    const department = userProfile?.department?.name || 'Engineering'
    const monthName = getMonthName(payroll.month)
    const year = payroll.year

    const basicSalary = payroll.basicSalary || 95000
    const hra = payroll.hra || 38000
    const allowances = payroll.allowances || 18000
    const grossSalary = payroll.grossSalary || basicSalary + hra + allowances

    const pf = payroll.pf || 11400
    const deductions = payroll.deductions || 3500
    const totalDeductions = pf + deductions
    const netSalary = payroll.netSalary || grossSalary - totalDeductions

    const paidDate = payroll.paidAt
      ? new Date(payroll.paidAt).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        })
      : `01 ${monthName} ${year}`

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Payslip_${monthName}_${year}_${employeeId}</title>
  <style>
    @media print {
      .no-print { display: none !important; }
      body { padding: 0; }
    }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #0f172a;
      background-color: #f8fafc;
      padding: 40px 20px;
      margin: 0;
    }
    .payslip-card {
      max-width: 800px;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 16px;
      padding: 40px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #6d28d9;
      padding-bottom: 20px;
      margin-bottom: 25px;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .brand-logo {
      width: 36 h-36;
      height: 36px;
      background: #6d28d9;
      color: white;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 20px;
    }
    .company-name {
      font-size: 22px;
      font-weight: 800;
      color: #5b21b6;
      margin: 0;
    }
    .company-sub {
      font-size: 11px;
      color: #64748b;
      margin-top: 2px;
    }
    .slip-title {
      text-align: right;
    }
    .title-text {
      font-size: 18px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #1e293b;
    }
    .period-text {
      font-size: 13px;
      font-weight: 600;
      color: #6d28d9;
      margin-top: 3px;
    }
    .meta-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
      background: #f1f5f9;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 25px;
      border: 1px solid #e2e8f0;
    }
    .meta-item {
      font-size: 13px;
    }
    .meta-label {
      color: #64748b;
      font-weight: 600;
      font-size: 11px;
      text-transform: uppercase;
      margin-bottom: 3px;
    }
    .meta-val {
      font-weight: 700;
      color: #0f172a;
    }
    .table-container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 25px;
    }
    .salary-table {
      width: 100%;
      border-collapse: collapse;
    }
    .salary-table th {
      background: #f8fafc;
      border-bottom: 2px solid #cbd5e1;
      padding: 10px 12px;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      color: #475569;
      text-align: left;
    }
    .salary-table td {
      padding: 10px 12px;
      border-bottom: 1px solid #f1f5f9;
      font-size: 13px;
      color: #334155;
    }
    .amount-col {
      text-align: right !important;
      font-family: monospace;
      font-weight: 600;
    }
    .net-box {
      background: linear-gradient(135deg, #6d28d9 0%, #4c1d95 100%);
      color: white;
      border-radius: 12px;
      padding: 20px 25px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      box-shadow: 0 4px 15px rgba(109, 40, 217, 0.2);
    }
    .net-label {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 1px;
      opacity: 0.9;
      font-weight: 600;
    }
    .net-amount {
      font-size: 26px;
      font-weight: 800;
      font-family: monospace;
    }
    .footer {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px dashed #cbd5e1;
    }
    .stamp {
      border: 2px dashed #22c55e;
      color: #15803d;
      background: #f0fdf4;
      padding: 8px 16px;
      border-radius: 8px;
      font-weight: 800;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .btn-container {
      max-width: 800px;
      margin: 0 auto 20px auto;
      display: flex;
      justify-content: flex-end;
      gap: 10px;
    }
    .btn {
      background: #6d28d9;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 10px;
      font-weight: 600;
      font-size: 13px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 4px 12px rgba(109, 40, 217, 0.2);
    }
    .btn:hover { background: #5b21b6; }
  </style>
</head>
<body>

  <div class="btn-container no-print">
    <button onclick="window.print()" class="btn">
      🖨️ Print / Save as PDF
    </button>
  </div>

  <div class="payslip-card">
    <div class="header">
      <div class="brand">
        <div class="brand-logo">D</div>
        <div>
          <h1 class="company-name">Dayflow Technologies</h1>
          <div class="company-sub">123 Tech Park, Koramangala, Bangalore - 560034</div>
        </div>
      </div>
      <div class="slip-title">
        <div class="title-text">Salary Slip</div>
        <div class="period-text">${monthName.toUpperCase()} ${year}</div>
      </div>
    </div>

    <div class="meta-grid">
      <div class="meta-item">
        <div class="meta-label">Employee Name</div>
        <div class="meta-val">${employeeName}</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Employee ID</div>
        <div class="meta-val">${employeeId}</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Designation</div>
        <div class="meta-val">${designation}</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Department</div>
        <div class="meta-val">${department}</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Payment Date</div>
        <div class="meta-val">${paidDate}</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Working Days / Present</div>
        <div class="meta-val">${payroll.workingDays || 26} Days / ${payroll.presentDays || 26} Days</div>
      </div>
    </div>

    <div class="table-container">
      <div>
        <table class="salary-table">
          <thead>
            <tr>
              <th>Earnings</th>
              <th class="amount-col">Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Basic Salary</td>
              <td class="amount-col">₹${basicSalary.toLocaleString('en-IN')}</td>
            </tr>
            <tr>
              <td>House Rent Allowance (HRA)</td>
              <td class="amount-col">₹${hra.toLocaleString('en-IN')}</td>
            </tr>
            <tr>
              <td>Special Allowances</td>
              <td class="amount-col">₹${allowances.toLocaleString('en-IN')}</td>
            </tr>
            <tr style="font-weight: 700; background: #f8fafc;">
              <td>Total Gross Earnings</td>
              <td class="amount-col">₹${grossSalary.toLocaleString('en-IN')}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div>
        <table class="salary-table">
          <thead>
            <tr>
              <th>Deductions</th>
              <th class="amount-col">Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Provident Fund (PF)</td>
              <td class="amount-col">₹${pf.toLocaleString('en-IN')}</td>
            </tr>
            <tr>
              <td>Professional Tax & TDS</td>
              <td class="amount-col">₹${deductions.toLocaleString('en-IN')}</td>
            </tr>
            <tr>
              <td>&nbsp;</td>
              <td class="amount-col">&nbsp;</td>
            </tr>
            <tr style="font-weight: 700; background: #f8fafc;">
              <td>Total Deductions</td>
              <td class="amount-col" style="color: #ef4444;">₹${totalDeductions.toLocaleString('en-IN')}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="net-box">
      <div>
        <div class="net-label">Net Disbursed Amount</div>
        <div style="font-size: 11px; opacity: 0.85; margin-top: 3px;">Credited directly to bank account</div>
      </div>
      <div class="net-amount">₹${netSalary.toLocaleString('en-IN')}</div>
    </div>

    <div class="footer">
      <div>
        <div class="stamp">✓ CONFIRMED & DISBURSED</div>
        <div style="font-size: 11px; color: #64748b; margin-top: 8px;">System Generated Pay Slip • Dayflow HRMS</div>
      </div>
      <div style="text-align: right;">
        <div style="font-size: 13px; font-weight: 700; color: #5b21b6;">Kavitha Nair</div>
        <div style="font-size: 11px; color: #64748b;">Head of HR & Finance</div>
      </div>
    </div>
  </div>

</body>
</html>
    `

    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `inline; filename="Payslip_${monthName}_${year}_${employeeId}.html"`,
      },
    })
  } catch (error) {
    console.error('[Salary Slip GET Error]', error)
    return apiError('Failed to generate salary slip', 500)
  }
}
