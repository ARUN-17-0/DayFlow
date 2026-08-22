export interface DemoEmployee {
  id: string
  employeeId: string
  email: string
  role: 'ADMIN' | 'HR_OFFICER' | 'EMPLOYEE'
  profile: {
    firstName: string
    lastName: string
    phone: string
    avatar?: string
    address?: string
    joiningDate?: string
    employmentType: string
    status: string
    department: { name: string }
    designation: { name: string }
  }
}

export const DEMO_EMPLOYEES: DemoEmployee[] = [
  {
    id: 'usr_1',
    employeeId: 'EMP001',
    email: 'admin@dayflow.io',
    role: 'ADMIN',
    profile: {
      firstName: 'Priya',
      lastName: 'Sharma',
      phone: '+91 98765 00001',
      address: '12, MG Road, Bangalore 560001',
      joiningDate: '2020-01-01',
      employmentType: 'FULL_TIME',
      status: 'ACTIVE',
      department: { name: 'Operations' },
      designation: { name: 'Operations Manager' },
    },
  },
  {
    id: 'usr_2',
    employeeId: 'EMP002',
    email: 'hr@dayflow.io',
    role: 'HR_OFFICER',
    profile: {
      firstName: 'Kavitha',
      lastName: 'Nair',
      phone: '+91 98765 00002',
      address: '34, Koramangala, Bangalore 560034',
      joiningDate: '2021-03-01',
      employmentType: 'FULL_TIME',
      status: 'ACTIVE',
      department: { name: 'Human Resources' },
      designation: { name: 'HR Manager' },
    },
  },
  {
    id: 'usr_3',
    employeeId: 'EMP003',
    email: 'arun.karthik@dayflow.io',
    role: 'EMPLOYEE',
    profile: {
      firstName: 'Arun',
      lastName: 'Karthik',
      phone: '+91 96765 43210',
      address: '185, 2nd Cross, Koramangala, Bangalore 560034',
      joiningDate: '2022-06-01',
      employmentType: 'FULL_TIME',
      status: 'ACTIVE',
      department: { name: 'Engineering' },
      designation: { name: 'Senior Software Engineer' },
    },
  },
  {
    id: 'usr_4',
    employeeId: 'EMP004',
    email: 'rahul.kumar@dayflow.io',
    role: 'EMPLOYEE',
    profile: {
      firstName: 'Rahul',
      lastName: 'Kumar',
      phone: '+91 98800 11223',
      address: '56, Indiranagar, Bangalore 560038',
      joiningDate: '2023-01-15',
      employmentType: 'FULL_TIME',
      status: 'ACTIVE',
      department: { name: 'Engineering' },
      designation: { name: 'Software Engineer' },
    },
  },
  {
    id: 'usr_5',
    employeeId: 'EMP005',
    email: 'priya.patel@dayflow.io',
    role: 'EMPLOYEE',
    profile: {
      firstName: 'Priya',
      lastName: 'Patel',
      phone: '+91 99009 22334',
      address: '78, HSR Layout, Bangalore 560102',
      joiningDate: '2022-09-01',
      employmentType: 'FULL_TIME',
      status: 'ACTIVE',
      department: { name: 'Design' },
      designation: { name: 'UI/UX Designer' },
    },
  },
  {
    id: 'usr_6',
    employeeId: 'EMP006',
    email: 'sneha.b@dayflow.io',
    role: 'EMPLOYEE',
    profile: {
      firstName: 'Sneha',
      lastName: 'Balakrishnan',
      phone: '+91 97711 33445',
      address: '90, Whitefield, Bangalore 560066',
      joiningDate: '2021-11-01',
      employmentType: 'FULL_TIME',
      status: 'ACTIVE',
      department: { name: 'Marketing' },
      designation: { name: 'Marketing Manager' },
    },
  },
  {
    id: 'usr_7',
    employeeId: 'EMP007',
    email: 'vikram.s@dayflow.io',
    role: 'EMPLOYEE',
    profile: {
      firstName: 'Vikram',
      lastName: 'Singh',
      phone: '+91 96630 44556',
      address: '23, Jayanagar, Bangalore 560041',
      joiningDate: '2023-04-10',
      employmentType: 'FULL_TIME',
      status: 'ACTIVE',
      department: { name: 'Finance' },
      designation: { name: 'Accountant' },
    },
  },
  {
    id: 'usr_8',
    employeeId: 'EMP008',
    email: 'deepa.r@dayflow.io',
    role: 'EMPLOYEE',
    profile: {
      firstName: 'Deepa',
      lastName: 'Ramesh',
      phone: '+91 95520 55667',
      address: '45, Electronic City, Bangalore 560100',
      joiningDate: '2024-02-01',
      employmentType: 'CONTRACT',
      status: 'ACTIVE',
      department: { name: 'Engineering' },
      designation: { name: 'Software Engineer' },
    },
  },
]

export const DEMO_LEAVE_BALANCE = {
  paidLeave: 12,
  sickLeave: 8,
  casualLeave: 6,
  unpaidLeave: 0,
}

export const DEMO_LEAVE_REQUESTS = [
  {
    id: 'lr_1',
    leaveType: 'PAID',
    startDate: '2025-08-22T00:00:00.000Z',
    endDate: '2025-08-24T00:00:00.000Z',
    totalDays: 3,
    reason: 'Personal family vacation',
    status: 'PENDING',
    createdAt: '2025-08-20T10:00:00.000Z',
    user: {
      employeeId: 'EMP003',
      email: 'arun.karthik@dayflow.io',
      profile: { firstName: 'Arun', lastName: 'Karthik', department: { name: 'Engineering' } },
    },
  },
  {
    id: 'lr_2',
    leaveType: 'SICK',
    startDate: '2025-08-10T00:00:00.000Z',
    endDate: '2025-08-12T00:00:00.000Z',
    totalDays: 3,
    reason: 'Fever and viral infection',
    status: 'APPROVED',
    reviewComment: 'Take rest, get well soon!',
    createdAt: '2025-08-08T09:00:00.000Z',
    user: {
      employeeId: 'EMP004',
      email: 'rahul.kumar@dayflow.io',
      profile: { firstName: 'Rahul', lastName: 'Kumar', department: { name: 'Engineering' } },
    },
  },
  {
    id: 'lr_3',
    leaveType: 'CASUAL',
    startDate: '2025-08-25T00:00:00.000Z',
    endDate: '2025-08-27T00:00:00.000Z',
    totalDays: 3,
    reason: 'Family wedding ceremony',
    status: 'PENDING',
    createdAt: '2025-08-21T14:30:00.000Z',
    user: {
      employeeId: 'EMP005',
      email: 'priya.patel@dayflow.io',
      profile: { firstName: 'Priya', lastName: 'Patel', department: { name: 'Design' } },
    },
  },
  {
    id: 'lr_4',
    leaveType: 'PAID',
    startDate: '2025-07-15T00:00:00.000Z',
    endDate: '2025-07-18T00:00:00.000Z',
    totalDays: 4,
    reason: 'Annual family holiday',
    status: 'APPROVED',
    reviewComment: 'Approved! Have a great trip.',
    createdAt: '2025-07-10T11:00:00.000Z',
    user: {
      employeeId: 'EMP006',
      email: 'sneha.b@dayflow.io',
      profile: { firstName: 'Sneha', lastName: 'Balakrishnan', department: { name: 'Marketing' } },
    },
  },
]

export const DEMO_PAYROLL_RECORDS = [
  {
    id: 'pay_1',
    month: 7,
    year: 2025,
    basicSalary: 95000,
    hra: 38000,
    allowances: 18000,
    pf: 11400,
    deductions: 3500,
    grossSalary: 151000,
    netSalary: 136100,
    workingDays: 26,
    presentDays: 25,
    status: 'PAID',
    user: {
      employeeId: 'EMP003',
      email: 'arun.karthik@dayflow.io',
      profile: { firstName: 'Arun', lastName: 'Karthik', department: { name: 'Engineering' } },
    },
  },
  {
    id: 'pay_2',
    month: 6,
    year: 2025,
    basicSalary: 95000,
    hra: 38000,
    allowances: 18000,
    pf: 11400,
    deductions: 3500,
    grossSalary: 151000,
    netSalary: 136100,
    workingDays: 26,
    presentDays: 26,
    status: 'PAID',
    user: {
      employeeId: 'EMP003',
      email: 'arun.karthik@dayflow.io',
      profile: { firstName: 'Arun', lastName: 'Karthik', department: { name: 'Engineering' } },
    },
  },
]

export const DEMO_STATS = {
  totalEmployees: 8,
  activeEmployees: 8,
  presentToday: 7,
  pendingLeaves: 2,
  onLeaveToday: 1,
}
