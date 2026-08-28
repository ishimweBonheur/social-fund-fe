export type UserRole = 'ADMIN' | 'MEMBER'
export interface User { id: string; fullName: string; email: string; phone?: string; role: UserRole; status?: string }
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
export type ReminderFrequency = 'DAILY' | 'WEEKLY' | 'CUSTOM'
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
export interface ReminderInput { enabled: boolean; frequency: ReminderFrequency; interval?: number }
export interface MemberInput {
  fullName: string
  email: string
  phone: string
  contribution: ContributionInput
  reminder: ReminderInput
}
export interface MemberUpdateInput { fullName: string; email: string; phone: string }
export interface Notification { id: string; title: string; message: string; time: string; read: boolean; audience: UserRole | 'ALL'; deliveryStatus?: string }
export type FundStatus = 'Active' | 'Paid' | 'Pending' | 'Overdue' | 'Approved' | 'Rejected'
