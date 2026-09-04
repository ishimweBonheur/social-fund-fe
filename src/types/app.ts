export type UserRole = 'ADMIN' | 'MEMBER'
export interface User {
  id: string
  fullName: string
  email: string
  phone?: string
  role: UserRole
  status?: string
}
export interface GoogleAuthResponse {
  access_token: string
  user: {
    id: string
    full_name: string
    email: string
    phone?: string
    role: UserRole
    status: string
  }
}
export type MemberStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
export type ContributionFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM'
export type ReminderFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM'
export interface Member {
  id: string
  fullName: string
  email: string
  phone: string
  role: UserRole
  status: MemberStatus
  googleId?: string | null
  lastLoginAt?: string | null
  createdAt: string
  updatedAt?: string
}
export interface ContributionInput {
  amount: string
  frequency: ContributionFrequency
  intervalValue?: number
  dueDay?: number
  startDate: string
  lateFeeEnabled: boolean
  lateFeePercentage?: string
  gracePeriodDays: number
}
export interface ReminderInput {
  enabled: boolean
  startDate?: string
  frequency: ReminderFrequency
  interval?: number
}
export interface MemberInput {
  fullName: string
  email: string
  phone: string
  contribution: ContributionInput
  preDueReminder: ReminderInput
  overdueReminder: ReminderInput
}
export interface MemberUpdateInput {
  fullName: string
  email: string
  phone: string
}
export interface Notification {
  id: string
  title: string
  message: string
  time: string
  read: boolean
  audience: UserRole | 'ALL'
  deliveryStatus?: string
  attempts: number
  sentAt?: string
  lastError?: string
  nextRetryAt?: string
  recipient: string
}
export type FundStatus = 'Active' | 'Paid' | 'Pending' | 'Overdue' | 'Approved' | 'Rejected'
