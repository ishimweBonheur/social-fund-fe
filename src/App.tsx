import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { dashboardFor } from '@/config/navigation'
import { AppProvider, useApp } from '@/context/AppContext'
import { LoginPage } from '@/pages/LoginPage'
import { AdminDashboardPage, MemberDashboardPage } from '@/pages/SocialDashboardPage'
import { ApprovalsPage, AuditLogsPage, ContributionPlansPage, ContributionsPage, LoansPage, MemberContributionsPage, MemberLoansPage, MemberPlanPage, MemberRepaymentsPage, MembersPage, NotificationsPage, ProfilePage, RepaymentsPage, ReportsPage } from '@/pages/SocialFundPages'
import type { UserRole } from '@/types/app'

function RoleGuard({ role }: { role: UserRole }) {
  const { currentUser } = useApp()
  if (!currentUser) return <Navigate to="/login" replace />
  if (currentUser.role !== role) return <Navigate to={dashboardFor(currentUser.role)} replace />
  return <Outlet />
}
function HomeRedirect() { const { currentUser } = useApp(); return <Navigate to={currentUser ? dashboardFor(currentUser.role) : '/login'} replace /> }
function AppRoutes() { return <Routes>
  <Route path="/login" element={<LoginPage />} />
  <Route element={<AppLayout />}>
    <Route element={<RoleGuard role="ADMIN" />}>
      <Route path="/admin/dashboard" element={<AdminDashboardPage />} /><Route path="/admin/members" element={<MembersPage />} />
      <Route path="/admin/contribution-plans" element={<ContributionPlansPage />} /><Route path="/admin/contributions" element={<ContributionsPage />} />
      <Route path="/admin/loans" element={<LoansPage />} /><Route path="/admin/repayments" element={<RepaymentsPage />} />
      <Route path="/admin/approvals" element={<ApprovalsPage />} /><Route path="/admin/reports" element={<ReportsPage />} />
      <Route path="/admin/notifications" element={<NotificationsPage />} /><Route path="/admin/audit-logs" element={<AuditLogsPage />} />
      <Route path="/admin/settings" element={<ProfilePage admin />} />
    </Route>
    <Route element={<RoleGuard role="MEMBER" />}>
      <Route path="/member/dashboard" element={<MemberDashboardPage />} /><Route path="/member/contributions" element={<MemberContributionsPage />} />
      <Route path="/member/contribution-plan" element={<MemberPlanPage />} /><Route path="/member/loans" element={<MemberLoansPage />} />
      <Route path="/member/repayments" element={<MemberRepaymentsPage />} /><Route path="/member/notifications" element={<NotificationsPage />} />
      <Route path="/member/profile" element={<ProfilePage />} />
    </Route>
  </Route>
  <Route path="*" element={<HomeRedirect />} />
</Routes> }
export default function App() { return <AppProvider><BrowserRouter><AppRoutes /></BrowserRouter></AppProvider> }
