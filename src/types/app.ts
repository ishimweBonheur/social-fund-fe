export type UserRole = 'ADMIN' | 'MEMBER'
export interface User { id: string; fullName: string; email: string; role: UserRole }
export interface Notification { id: string; title: string; message: string; time: string; read: boolean; audience: UserRole | 'ALL' }
export type FundStatus = 'Active' | 'Paid' | 'Pending' | 'Overdue' | 'Approved' | 'Rejected'
