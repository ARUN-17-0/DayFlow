/**
 * Dayflow Zod Validation Schemas
 * All server-side input validation schemas
 */

import { z } from 'zod'

// ─────────────────────────────────────────────────────────
// Auth Schemas
// ─────────────────────────────────────────────────────────

export const registerSchema = z.object({
  employeeId: z
    .string()
    .min(3, 'Employee ID must be at least 3 characters')
    .max(20, 'Employee ID too long')
    .regex(/^[A-Z0-9]+$/i, 'Employee ID must be alphanumeric'),
  email: z.string().email('Invalid email address').toLowerCase(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[@$!%*?&]/, 'Password must contain at least one special character (@$!%*?&)'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
})

export const verifyOTPSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6, 'OTP must be 6 digits').regex(/^\d{6}$/, 'OTP must contain only digits'),
  purpose: z.enum(['EMAIL_VERIFICATION', 'PASSWORD_RESET']),
})

export const resendOTPSchema = z.object({
  email: z.string().email(),
  purpose: z.enum(['EMAIL_VERIFICATION', 'PASSWORD_RESET']),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase(),
})

export const resetPasswordSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6).regex(/^\d{6}$/),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase')
    .regex(/[a-z]/, 'Must contain lowercase')
    .regex(/[0-9]/, 'Must contain number')
    .regex(/[@$!%*?&]/, 'Must contain special character'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase')
    .regex(/[a-z]/, 'Must contain lowercase')
    .regex(/[0-9]/, 'Must contain number')
    .regex(/[@$!%*?&]/, 'Must contain special character'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

// ─────────────────────────────────────────────────────────
// Employee Schemas
// ─────────────────────────────────────────────────────────

export const createEmployeeSchema = z.object({
  employeeId: z.string().min(3).max(20).regex(/^[A-Z0-9]+$/i),
  email: z.string().email().toLowerCase(),
  password: z.string().min(8).regex(/[A-Z]/).regex(/[a-z]/).regex(/[0-9]/),
  role: z.enum(['ADMIN', 'HR_OFFICER', 'EMPLOYEE']).default('EMPLOYEE'),
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  address: z.string().optional(),
  emergencyContact: z.string().optional(),
  departmentId: z.string().optional(),
  designationId: z.string().optional(),
  joiningDate: z.string().optional(),
  employmentType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN']).default('FULL_TIME'),
  reportingManagerId: z.string().optional(),
  // Salary
  basicSalary: z.number().min(0).optional(),
  hra: z.number().min(0).optional(),
  allowances: z.number().min(0).optional(),
  pf: z.number().min(0).optional(),
  deductions: z.number().min(0).optional(),
})

export const updateEmployeeSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  address: z.string().optional(),
  emergencyContact: z.string().optional(),
  departmentId: z.string().optional(),
  designationId: z.string().optional(),
  joiningDate: z.string().optional(),
  employmentType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN']).optional(),
  reportingManagerId: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'ON_PROBATION', 'TERMINATED']).optional(),
  role: z.enum(['ADMIN', 'HR_OFFICER', 'EMPLOYEE']).optional(),
})

export const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  address: z.string().optional(),
  emergencyContact: z.string().optional(),
})

// ─────────────────────────────────────────────────────────
// Attendance Schemas
// ─────────────────────────────────────────────────────────

export const checkInSchema = z.object({
  notes: z.string().max(500).optional(),
})

export const checkOutSchema = z.object({
  notes: z.string().max(500).optional(),
})

export const attendanceFilterSchema = z.object({
  userId: z.string().optional(),
  departmentId: z.string().optional(),
  status: z.enum(['PRESENT', 'ABSENT', 'HALF_DAY', 'ON_LEAVE', 'WEEKEND', 'HOLIDAY', 'NOT_MARKED']).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
})

// ─────────────────────────────────────────────────────────
// Leave Schemas
// ─────────────────────────────────────────────────────────

export const applyLeaveSchema = z.object({
  leaveType: z.enum(['PAID', 'SICK', 'UNPAID', 'CASUAL', 'MATERNITY', 'PATERNITY']),
  startDate: z.string().refine((d) => !isNaN(Date.parse(d)), 'Invalid start date'),
  endDate: z.string().refine((d) => !isNaN(Date.parse(d)), 'Invalid end date'),
  reason: z.string().min(10, 'Please provide at least 10 characters').max(500),
  attachment: z.string().optional(),
}).refine((data) => new Date(data.startDate) <= new Date(data.endDate), {
  message: 'End date must be after or equal to start date',
  path: ['endDate'],
})

export const reviewLeaveSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  reviewComment: z.string().max(500).optional(),
})

// ─────────────────────────────────────────────────────────
// Payroll Schemas
// ─────────────────────────────────────────────────────────

export const generatePayrollSchema = z.object({
  userIds: z.array(z.string()).min(1, 'Select at least one employee'),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2020).max(2100),
})

export const updateSalaryComponentSchema = z.object({
  basicSalary: z.number().min(0),
  hra: z.number().min(0),
  allowances: z.number().min(0),
  pf: z.number().min(0),
  deductions: z.number().min(0),
})

// ─────────────────────────────────────────────────────────
// Department / Designation Schemas
// ─────────────────────────────────────────────────────────

export const departmentSchema = z.object({
  name: z.string().min(2, 'Department name too short').max(100),
  description: z.string().max(500).optional(),
})

export const designationSchema = z.object({
  name: z.string().min(2, 'Designation name too short').max(100),
  level: z.number().int().min(1).max(10).default(1),
})

// ─────────────────────────────────────────────────────────
// Settings Schemas
// ─────────────────────────────────────────────────────────

export const companySettingSchema = z.object({
  key: z.string().min(1),
  value: z.string(),
})

export const updateCompanySettingsSchema = z.record(z.string(), z.string())

// ─────────────────────────────────────────────────────────
// Report Schemas
// ─────────────────────────────────────────────────────────

export const reportFilterSchema = z.object({
  type: z.enum(['attendance', 'leave', 'payroll']),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  departmentId: z.string().optional(),
  userId: z.string().optional(),
  month: z.number().int().min(1).max(12).optional(),
  year: z.number().int().min(2020).max(2100).optional(),
  status: z.string().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
})

// Type exports
export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type VerifyOTPInput = z.infer<typeof verifyOTPSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
export type ApplyLeaveInput = z.infer<typeof applyLeaveSchema>
export type ReviewLeaveInput = z.infer<typeof reviewLeaveSchema>
export type GeneratePayrollInput = z.infer<typeof generatePayrollSchema>
export type UpdateSalaryComponentInput = z.infer<typeof updateSalaryComponentSchema>
