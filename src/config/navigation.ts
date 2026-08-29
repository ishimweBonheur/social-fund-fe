import {
  Activity,
  Bell,
  ClipboardCheck,
  FileClock,
  HandCoins,
  LayoutDashboard,
  ListChecks,
  Settings,
  UserRound,
  Users,
  WalletCards,
} from 'lucide-react'
import type { UserRole } from '@/types/app'

export const navigation = {
  ADMIN: [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/members', icon: Users, label: 'Members' },
    { to: '/admin/contribution-plans', icon: ListChecks, label: 'Contribution Plans' },
    { to: '/admin/contributions', icon: WalletCards, label: 'Contributions' },
    { to: '/admin/loans', icon: HandCoins, label: 'Assistance Requests' },
    { to: '/admin/repayments', icon: ClipboardCheck, label: 'Fund Ledger' },
    { to: '/admin/approvals', icon: ListChecks, label: 'Approvals' },
    { to: '/admin/notifications', icon: Bell, label: 'Notifications' },
    { to: '/admin/audit-logs', icon: FileClock, label: 'Audit Logs' },
    { to: '/admin/monitoring', icon: Activity, label: 'System Monitoring' },
    { to: '/admin/settings', icon: Settings, label: 'Settings' },
  ],
  MEMBER: [
    { to: '/member/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/member/contributions', icon: WalletCards, label: 'My Contributions' },
    { to: '/member/contribution-plan', icon: ListChecks, label: 'My Contribution Plan' },
    { to: '/member/loans', icon: HandCoins, label: 'My Assistance' },
    { to: '/member/transactions', icon: ClipboardCheck, label: 'Transaction History' },
    { to: '/member/notifications', icon: Bell, label: 'Notifications' },
    { to: '/member/profile', icon: UserRound, label: 'Profile' },
  ],
} satisfies Record<UserRole, Array<{ to: string; icon: typeof LayoutDashboard; label: string }>>
export const dashboardFor = (role: UserRole) =>
  role === 'ADMIN' ? '/admin/dashboard' : '/member/dashboard'
