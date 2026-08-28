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
export type MemberStatus = 'ACTIVE' | 'PENDING' | 'SUSPENDED' | 'DISABLED'
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
export interface MemberInput { fullName: string; email: string; phone: string; status?: MemberStatus }
export interface Notification { id: string; title: string; message: string; time: string; read: boolean; audience: UserRole | 'ALL' }
export type FundStatus = 'Active' | 'Paid' | 'Pending' | 'Overdue' | 'Approved' | 'Rejected'
