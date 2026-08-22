export const APP_NAME = 'Dayflow'
export const APP_TAGLINE = 'Every workday, perfectly aligned.'
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export const ROLES = {
  ADMIN: 'ADMIN',
  HR_OFFICER: 'HR_OFFICER',
  EMPLOYEE: 'EMPLOYEE',
} as const

export const LEAVE_TYPES = [
  { value: 'PAID', label: 'Paid Leave', color: '#22C55E' },
  { value: 'SICK', label: 'Sick Leave', color: '#3B82F6' },
  { value: 'UNPAID', label: 'Unpaid Leave', color: '#EF4444' },
  { value: 'CASUAL', label: 'Casual Leave', color: '#F59E0B' },
  { value: 'MATERNITY', label: 'Maternity Leave', color: '#A855F7' },
  { value: 'PATERNITY', label: 'Paternity Leave', color: '#8B5CF6' },
] as const

export const LEAVE_STATUSES = [
  { value: 'PENDING', label: 'Pending', color: '#F59E0B', bg: '#FEF3C7' },
  { value: 'APPROVED', label: 'Approved', color: '#22C55E', bg: '#DCFCE7' },
  { value: 'REJECTED', label: 'Rejected', color: '#EF4444', bg: '#FEE2E2' },
  { value: 'CANCELLED', label: 'Cancelled', color: '#A1A1AA', bg: '#F4F4F5' },
] as const

export const ATTENDANCE_STATUSES = [
  { value: 'PRESENT', label: 'Present', color: '#22C55E', bg: '#DCFCE7' },
  { value: 'ABSENT', label: 'Absent', color: '#EF4444', bg: '#FEE2E2' },
  { value: 'HALF_DAY', label: 'Half Day', color: '#A855F7', bg: '#F3E8FF' },
  { value: 'ON_LEAVE', label: 'On Leave', color: '#3B82F6', bg: '#DBEAFE' },
  { value: 'WEEKEND', label: 'Weekend', color: '#A1A1AA', bg: '#F4F4F5' },
  { value: 'HOLIDAY', label: 'Holiday', color: '#F59E0B', bg: '#FEF3C7' },
  { value: 'NOT_MARKED', label: 'Not Marked', color: '#A1A1AA', bg: '#F4F4F5' },
] as const

export const PAYROLL_STATUSES = [
  { value: 'DRAFT', label: 'Draft', color: '#A1A1AA', bg: '#F4F4F5' },
  { value: 'PROCESSED', label: 'Processed', color: '#F59E0B', bg: '#FEF3C7' },
  { value: 'PAID', label: 'Paid', color: '#22C55E', bg: '#DCFCE7' },
] as const

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
] as const

export const OTP_EXPIRY_MINUTES = 5
export const OTP_MAX_ATTEMPTS = 5
export const OTP_RESEND_COOLDOWN_SECONDS = 60
export const OTP_LENGTH = 6

export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 10,
} as const

export const DAYFLOW_COLORS = {
  royalPurple: '#6D28D9',
  deepViolet: '#5B21B6',
  softViolet: '#8B5CF6',
  lavender: '#F0EEFF',
  mistGrey: '#F4F3F7',
  coolGrey: '#F8F8FA',
  charcoal: '#18181B',
  zincGrey: '#71717A',
  border: '#E4E4E7',
  present: '#22C55E',
  pending: '#F59E0B',
  error: '#EF4444',
  leave: '#3B82F6',
  halfDay: '#A855F7',
  inactive: '#A1A1AA',
} as const
