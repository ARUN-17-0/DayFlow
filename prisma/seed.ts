import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding Dayflow HRMS SQLite database...')

  // Clean existing data
  await prisma.auditLog.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.salarySlip.deleteMany()
  await prisma.payrollRecord.deleteMany()
  await prisma.salaryComponent.deleteMany()
  await prisma.leaveRequest.deleteMany()
  await prisma.leaveBalance.deleteMany()
  await prisma.attendanceRecord.deleteMany()
  await prisma.document.deleteMany()
  await prisma.oTPVerification.deleteMany()
  await prisma.employeeProfile.deleteMany()
  await prisma.user.deleteMany()
  await prisma.designation.deleteMany()
  await prisma.department.deleteMany()
  await prisma.companySetting.deleteMany()

  // Company Settings
  await prisma.companySetting.createMany({
    data: [
      { key: 'company_name', value: 'Dayflow Technologies Pvt Ltd' },
      { key: 'company_email', value: 'hr@dayflow.io' },
      { key: 'company_phone', value: '+91 80 1234 5678' },
      { key: 'company_address', value: '123 Tech Park, Bangalore, Karnataka 560001' },
      { key: 'currency', value: 'INR' },
      { key: 'currency_symbol', value: '₹' },
      { key: 'work_start_time', value: '09:00' },
      { key: 'work_end_time', value: '18:00' },
      { key: 'working_days', value: 'MON,TUE,WED,THU,FRI' },
      { key: 'leave_year_start', value: 'JANUARY' },
      { key: 'paid_leave_per_year', value: '12' },
      { key: 'sick_leave_per_year', value: '8' },
      { key: 'casual_leave_per_year', value: '6' },
      { key: 'timezone', value: 'Asia/Kolkata' },
      { key: 'date_format', value: 'DD/MM/YYYY' },
    ],
  })

  // Departments
  const departments = await Promise.all([
    prisma.department.create({ data: { name: 'Engineering', description: 'Software development and architecture' } }),
    prisma.department.create({ data: { name: 'Human Resources', description: 'HR operations and talent management' } }),
    prisma.department.create({ data: { name: 'Finance', description: 'Financial operations and accounting' } }),
    prisma.department.create({ data: { name: 'Marketing', description: 'Marketing and brand management' } }),
    prisma.department.create({ data: { name: 'Design', description: 'UI/UX and product design' } }),
    prisma.department.create({ data: { name: 'Operations', description: 'Business operations and administration' } }),
  ])

  const [engineering, hr, finance, marketing, design, operations] = departments

  // Designations
  const designations = await Promise.all([
    prisma.designation.create({ data: { name: 'Software Engineer', level: 3 } }),
    prisma.designation.create({ data: { name: 'Senior Software Engineer', level: 4 } }),
    prisma.designation.create({ data: { name: 'Tech Lead', level: 5 } }),
    prisma.designation.create({ data: { name: 'Engineering Manager', level: 6 } }),
    prisma.designation.create({ data: { name: 'HR Manager', level: 5 } }),
    prisma.designation.create({ data: { name: 'HR Executive', level: 3 } }),
    prisma.designation.create({ data: { name: 'Finance Manager', level: 5 } }),
    prisma.designation.create({ data: { name: 'Accountant', level: 3 } }),
    prisma.designation.create({ data: { name: 'Marketing Manager', level: 5 } }),
    prisma.designation.create({ data: { name: 'UI/UX Designer', level: 3 } }),
    prisma.designation.create({ data: { name: 'Operations Manager', level: 5 } }),
  ])

  const [swEng, srSwEng, techLead, engMgr, hrMgr, hrExec, finMgr, accountant, mktMgr, designer, opsMgr] = designations

  const hashPassword = (pwd: string) => bcrypt.hashSync(pwd, 12)

  // Admin user
  const adminUser = await prisma.user.create({
    data: {
      employeeId: 'EMP001',
      email: 'admin@dayflow.io',
      password: hashPassword('Admin@123'),
      role: 'ADMIN',
      isEmailVerified: true,
      profile: {
        create: {
          firstName: 'Priya',
          lastName: 'Sharma',
          phone: '+91 98765 00001',
          dateOfBirth: new Date('1988-03-15'),
          gender: 'Female',
          address: '12, MG Road, Bangalore 560001',
          departmentId: operations.id,
          designationId: opsMgr.id,
          joiningDate: new Date('2020-01-01'),
          employmentType: 'FULL_TIME',
          status: 'ACTIVE',
        },
      },
    },
  })

  // HR user
  const hrUser = await prisma.user.create({
    data: {
      employeeId: 'EMP002',
      email: 'hr@dayflow.io',
      password: hashPassword('HR@123'),
      role: 'HR_OFFICER',
      isEmailVerified: true,
      profile: {
        create: {
          firstName: 'Kavitha',
          lastName: 'Nair',
          phone: '+91 98765 00002',
          dateOfBirth: new Date('1990-07-22'),
          gender: 'Female',
          address: '34, Koramangala, Bangalore 560034',
          departmentId: hr.id,
          designationId: hrMgr.id,
          joiningDate: new Date('2021-03-01'),
          employmentType: 'FULL_TIME',
          status: 'ACTIVE',
        },
      },
    },
  })

  // Employee users
  const employeeData = [
    { id: 'EMP003', email: 'arun.karthik@dayflow.io', pwd: 'Employee@123', first: 'Arun', last: 'Karthik', phone: '+91 96765 43210', dob: '1995-04-12', gender: 'Male', addr: '185, 2nd Cross, Koramangala, Bangalore 560034', dept: engineering.id, desig: srSwEng.id, join: '2022-06-01', type: 'FULL_TIME' },
    { id: 'EMP004', email: 'rahul.kumar@dayflow.io', pwd: 'Employee@123', first: 'Rahul', last: 'Kumar', phone: '+91 98800 11223', dob: '1993-11-08', gender: 'Male', addr: '56, Indiranagar, Bangalore 560038', dept: engineering.id, desig: swEng.id, join: '2023-01-15', type: 'FULL_TIME' },
    { id: 'EMP005', email: 'priya.patel@dayflow.io', pwd: 'Employee@123', first: 'Priya', last: 'Patel', phone: '+91 99009 22334', dob: '1996-06-30', gender: 'Female', addr: '78, HSR Layout, Bangalore 560102', dept: design.id, desig: designer.id, join: '2022-09-01', type: 'FULL_TIME' },
    { id: 'EMP006', email: 'sneha.b@dayflow.io', pwd: 'Employee@123', first: 'Sneha', last: 'Balakrishnan', phone: '+91 97711 33445', dob: '1994-02-18', gender: 'Female', addr: '90, Whitefield, Bangalore 560066', dept: marketing.id, desig: mktMgr.id, join: '2021-11-01', type: 'FULL_TIME' },
    { id: 'EMP007', email: 'vikram.s@dayflow.io', pwd: 'Employee@123', first: 'Vikram', last: 'Singh', phone: '+91 96630 44556', dob: '1991-09-05', gender: 'Male', addr: '23, Jayanagar, Bangalore 560041', dept: finance.id, desig: accountant.id, join: '2023-04-10', type: 'FULL_TIME' },
    { id: 'EMP008', email: 'deepa.r@dayflow.io', pwd: 'Employee@123', first: 'Deepa', last: 'Ramesh', phone: '+91 95520 55667', dob: '1997-12-25', gender: 'Female', addr: '45, Electronic City, Bangalore 560100', dept: engineering.id, desig: swEng.id, join: '2024-02-01', type: 'CONTRACT' },
  ]

  const employees = []
  for (const emp of employeeData) {
    const user = await prisma.user.create({
      data: {
        employeeId: emp.id,
        email: emp.email,
        password: hashPassword(emp.pwd),
        role: 'EMPLOYEE',
        isEmailVerified: true,
        profile: {
          create: {
            firstName: emp.first,
            lastName: emp.last,
            phone: emp.phone,
            dateOfBirth: new Date(emp.dob),
            gender: emp.gender,
            address: emp.addr,
            departmentId: emp.dept,
            designationId: emp.desig,
            joiningDate: new Date(emp.join),
            employmentType: emp.type,
            status: 'ACTIVE',
          },
        },
      },
    })
    employees.push(user)
  }

  const allUsers = [adminUser, hrUser, ...employees]

  // Salary Components
  const salaryData = [
    { userId: adminUser.id, basic: 150000, hra: 60000, allowances: 25000, pf: 18000, ded: 5000 },
    { userId: hrUser.id, basic: 85000, hra: 34000, allowances: 15000, pf: 10200, ded: 3000 },
    { userId: employees[0].id, basic: 95000, hra: 38000, allowances: 18000, pf: 11400, ded: 3500 },
    { userId: employees[1].id, basic: 65000, hra: 26000, allowances: 12000, pf: 7800, ded: 2500 },
    { userId: employees[2].id, basic: 70000, hra: 28000, allowances: 13000, pf: 8400, ded: 2800 },
    { userId: employees[3].id, basic: 90000, hra: 36000, allowances: 16000, pf: 10800, ded: 3200 },
    { userId: employees[4].id, basic: 55000, hra: 22000, allowances: 10000, pf: 6600, ded: 2000 },
    { userId: employees[5].id, basic: 60000, hra: 24000, allowances: 11000, pf: 7200, ded: 2200 },
  ]

  for (const s of salaryData) {
    const gross = s.basic + s.hra + s.allowances
    const net = gross - s.pf - s.ded
    await prisma.salaryComponent.create({
      data: {
        userId: s.userId,
        basicSalary: s.basic,
        hra: s.hra,
        allowances: s.allowances,
        pf: s.pf,
        deductions: s.ded,
        grossSalary: gross,
        netSalary: net,
      },
    })
  }

  // Leave Balances
  for (const user of allUsers) {
    await prisma.leaveBalance.create({
      data: {
        userId: user.id,
        paidLeave: 12,
        sickLeave: 8,
        casualLeave: 6,
        unpaidLeave: 0,
        year: 2025,
      },
    })
  }

  // Attendance records
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (const user of allUsers) {
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dayOfWeek = date.getDay()

      if (dayOfWeek === 0 || dayOfWeek === 6) {
        await prisma.attendanceRecord.create({
          data: { userId: user.id, date, status: 'WEEKEND' },
        })
        continue
      }

      const rand = Math.random()
      let status = 'PRESENT'
      let checkIn: Date | null = null
      let checkOut: Date | null = null
      let workingHours: number | null = null

      if (rand < 0.85) {
        const ciHour = 8 + Math.floor(Math.random() * 2)
        const ciMin = Math.floor(Math.random() * 60)
        checkIn = new Date(date)
        checkIn.setHours(ciHour, ciMin, 0, 0)

        const hoursWorked = 7 + Math.random() * 2.5
        checkOut = new Date(checkIn)
        checkOut.setMinutes(checkOut.getMinutes() + Math.round(hoursWorked * 60))
        workingHours = Math.round(hoursWorked * 100) / 100

        if (hoursWorked < 5) status = 'HALF_DAY'
      } else if (rand < 0.92) {
        status = 'ON_LEAVE'
      } else {
        status = 'ABSENT'
      }

      await prisma.attendanceRecord.create({
        data: { userId: user.id, date, checkIn, checkOut, workingHours, status },
      })
    }
  }

  // Leave Requests
  const arun = employees[0]
  const rahul = employees[1]
  const priya = employees[2]

  const leaveRequests = [
    { userId: arun.id, type: 'PAID', start: new Date('2025-08-22'), end: new Date('2025-08-24'), days: 3, reason: 'Personal work', status: 'PENDING' },
    { userId: rahul.id, type: 'SICK', start: new Date('2025-08-10'), end: new Date('2025-08-12'), days: 3, reason: 'Not feeling well', status: 'APPROVED', reviewedById: hrUser.id, reviewComment: 'Take rest, get well soon!', reviewedAt: new Date('2025-08-09') },
    { userId: priya.id, type: 'PAID', start: new Date('2025-07-15'), end: new Date('2025-07-18'), days: 4, reason: 'Family function', status: 'APPROVED', reviewedById: hrUser.id, reviewComment: 'Approved!', reviewedAt: new Date('2025-07-14') },
    { userId: arun.id, type: 'SICK', start: new Date('2025-07-10'), end: new Date('2025-07-11'), days: 2, reason: 'Fever', status: 'APPROVED', reviewedById: adminUser.id, reviewComment: 'Get well soon', reviewedAt: new Date('2025-07-09') },
    { userId: rahul.id, type: 'UNPAID', start: new Date('2025-08-25'), end: new Date('2025-08-27'), days: 3, reason: 'Personal emergency', status: 'PENDING' },
    { userId: priya.id, type: 'CASUAL', start: new Date('2025-08-28'), end: new Date('2025-08-28'), days: 1, reason: 'Personal work', status: 'REJECTED', reviewedById: hrUser.id, reviewComment: 'Critical project phase, please reschedule', reviewedAt: new Date('2025-08-20') },
  ]

  for (const lr of leaveRequests) {
    await prisma.leaveRequest.create({
      data: {
        userId: lr.userId,
        leaveType: lr.type,
        startDate: lr.start,
        endDate: lr.end,
        totalDays: lr.days,
        reason: lr.reason,
        status: lr.status,
        reviewedById: lr.reviewedById,
        reviewComment: lr.reviewComment,
        reviewedAt: lr.reviewedAt,
      },
    })
  }

  // Payroll Records
  for (const user of allUsers.slice(0, 4)) {
    const salaryComp = await prisma.salaryComponent.findUnique({ where: { userId: user.id } })
    if (!salaryComp) continue

    for (let m = 1; m <= 7; m++) {
      await prisma.payrollRecord.create({
        data: {
          userId: user.id,
          month: m,
          year: 2025,
          basicSalary: salaryComp.basicSalary,
          hra: salaryComp.hra,
          allowances: salaryComp.allowances,
          pf: salaryComp.pf,
          deductions: salaryComp.deductions,
          grossSalary: salaryComp.grossSalary,
          netSalary: salaryComp.netSalary,
          workingDays: 26,
          presentDays: 22 + Math.floor(Math.random() * 4),
          status: m <= 6 ? 'PAID' : 'PROCESSED',
          generatedById: adminUser.id,
          paidAt: m <= 6 ? new Date(`2025-0${m + 1}-01`) : null,
        },
      })
    }
  }

  // Notifications
  for (const user of allUsers) {
    await prisma.notification.createMany({
      data: [
        {
          userId: user.id,
          title: 'Welcome to Dayflow!',
          message: 'Your account has been set up. Explore your dashboard to get started.',
          type: 'EMAIL_VERIFIED',
          isRead: true,
        },
        {
          userId: user.id,
          title: 'Attendance Marked',
          message: 'Your attendance has been marked for today.',
          type: 'ATTENDANCE_MARKED',
          isRead: false,
        },
      ],
    })
  }

  console.log('✅ SQLite Database Seeding Complete!')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
