import { Session } from 'next-auth'

export type UserRole = 'ADMIN' | 'HR_OFFICER' | 'EMPLOYEE'

export type SafeUser = {
  id: string
  employeeId: string
  email: string
  role: UserRole
  isEmailVerified: boolean
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export type DepartmentData = {
  id: string
  name: string
  description?: string | null
  isActive: boolean
}

export type DesignationData = {
  id: string
  name: string
  level: number
  isActive: boolean
}

export type EmployeeProfileData = {
  id: string
  firstName: string
  lastName: string
  fullName: string
  phone?: string | null
  dateOfBirth?: Date | null
  gender?: string | null
  address?: string | null
  emergencyContact?: string | null
  avatar?: string | null
  joiningDate?: Date | null
  employmentType: string
  status: string
  department?: DepartmentData | null
  designation?: DesignationData | null
}

export type EmployeeWithProfile = SafeUser & {
  profile: EmployeeProfileData | null
}

export type AttendanceRecord = {
  id: string
  userId: string
  date: Date
  checkIn?: Date | null
  checkOut?: Date | null
  workingHours?: number | null
  status: string
  notes?: string | null
  user?: {
    employeeId: string
    profile: { firstName: string; lastName: string; avatar?: string | null } | null
  }
}

export type LeaveRequest = {
  id: string
  userId: string
  leaveType: string
  startDate: Date
  endDate: Date
  totalDays: number
  reason: string
  status: string
  reviewComment?: string | null
  reviewedAt?: Date | null
  createdAt: Date
  user?: {
    employeeId: string
    profile: {
      firstName: string
      lastName: string
      avatar?: string | null
      department?: DepartmentData | null
    } | null
  }
  reviewedBy?: {
    profile: { firstName: string; lastName: string } | null
  } | null
}

export type LeaveBalance = {
  id: string
  userId: string
  paidLeave: number
  sickLeave: number
  unpaidLeave: number
  casualLeave: number
  year: number
}

export type PayrollRecord = {
  id: string
  userId: string
  month: number
  year: number
  basicSalary: number
  hra: number
  allowances: number
  pf: number
  deductions: number
  grossSalary: number
  netSalary: number
  workingDays: number
  presentDays: number
  status: string
  generatedAt: Date
  paidAt?: Date | null
  user?: {
    employeeId: string
    profile: { firstName: string; lastName: string } | null
  }
}

export type SalaryComponent = {
  id: string
  userId: string
  basicSalary: number
  hra: number
  allowances: number
  pf: number
  deductions: number
  grossSalary: number
  netSalary: number
  effectiveFrom: Date
}

export type NotificationItem = {
  id: string
  userId: string
  title: string
  message: string
  type: string
  isRead: boolean
  relatedEntityId?: string | null
  relatedEntityType?: string | null
  createdAt: Date
}

export type AuditLogEntry = {
  id: string
  userId: string
  action: string
  entityType: string
  entityId?: string | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: any
  ipAddress?: string | null
  createdAt: Date
  user?: {
    employeeId: string
    profile: { firstName: string; lastName: string } | null
  }
}

export type ApiResponse<T> = {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export type PaginatedResponse<T> = ApiResponse<{
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}>

export type DashboardStats = {
  totalEmployees: number
  presentToday: number
  onLeave: number
  pendingRequests: number
  totalPayrollThisMonth: number
  averageSalary: number
}

export type AttendanceSummary = {
  present: number
  absent: number
  onLeave: number
  halfDay: number
  weekend: number
  notMarked: number
  total: number
  workingDays: number
}

export type ExtendedSession = Session & {
  user: {
    id: string
    email: string
    name: string
    image?: string | null
    employeeId: string
    role: UserRole
    isEmailVerified: boolean
  }
}

export type NavItem = {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  badge?: number
  exact?: boolean
}

export type TableColumn<T> = {
  key: keyof T | string
  header: string
  cell?: (row: T) => React.ReactNode
  sortable?: boolean
  className?: string
}

export type SortConfig = {
  key: string
  direction: 'asc' | 'desc'
}
