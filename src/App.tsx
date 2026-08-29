import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { Toaster } from 'sonner'
import { AppLayout } from '@/components/layout/AppLayout'
import { dashboardFor } from '@/config/navigation'
import { AppProvider, useApp } from '@/context/AppContext'
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage'
import ApprovalsPage from '@/pages/admin/ApprovalsPage'
import AuditLogsPage from '@/pages/admin/AuditLogsPage'
import ContributionPlansPage from '@/pages/admin/ContributionPlansPage'
import ContributionsPage from '@/pages/admin/ContributionsPage'
import ContributionReviewPage from '@/pages/admin/ContributionReviewPage'
import LoansPage from '@/pages/admin/LoansPage'
import MembersPage from '@/pages/admin/MembersPage'
import MonitoringPage from '@/pages/admin/MonitoringPage'
import NotificationsPage from '@/pages/admin/NotificationsPage'
import RepaymentsPage from '@/pages/admin/RepaymentsPage'
import SettingsPage from '@/pages/admin/SettingsPage'
import LoginPage from '@/pages/LoginPage'
import MemberContributionsPage from '@/pages/member/MemberContributionsPage'
import MemberDashboardPage from '@/pages/member/MemberDashboardPage'
import MemberLoansPage from '@/pages/member/MemberLoansPage'
import MemberNotificationsPage from '@/pages/member/MemberNotificationsPage'
import MemberPlanPage from '@/pages/member/MemberPlanPage'
import MemberProfilePage from '@/pages/member/MemberProfilePage'
import MemberRepaymentsPage from '@/pages/member/MemberRepaymentsPage'
import type { UserRole } from '@/types/app'

function RoleGuard({ role }: { role: UserRole }) {
  const { currentUser, isAuthLoading } = useApp()
  if (isAuthLoading)
    return (
      <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">
        Loading…
      </div>
    )

  if (!currentUser)
    return (
      <Navigate
        to="/login"
        replace
      />
    )
  if (currentUser.role !== role)
    return (
      <Navigate
        to={dashboardFor(currentUser.role)}
        replace
      />
    )

  return <Outlet />
}

function HomeRedirect() {
  const { currentUser } = useApp()
  return (
    <Navigate
      to={currentUser ? dashboardFor(currentUser.role) : '/login'}
      replace
    />
  )
}

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/login"
        element={<LoginPage />}
      />

      <Route element={<AppLayout />}>
        {/* Admin Routes */}
        <Route element={<RoleGuard role="ADMIN" />}>
          <Route
            path="/admin/dashboard"
            element={<AdminDashboardPage />}
          />
          <Route
            path="/admin/members"
            element={<MembersPage />}
          />
          <Route
            path="/admin/contribution-plans"
            element={<ContributionPlansPage />}
          />
          <Route
            path="/admin/contributions"
            element={<ContributionsPage />}
          />
          <Route
            path="/admin/contributions/:id/review"
            element={<ContributionReviewPage />}
          />
          <Route
            path="/admin/loans"
            element={<LoansPage />}
          />
          <Route
            path="/admin/repayments"
            element={<RepaymentsPage />}
          />
          <Route
            path="/admin/approvals"
            element={<ApprovalsPage />}
          />
          <Route
            path="/admin/notifications"
            element={<NotificationsPage />}
          />
          <Route
            path="/admin/audit-logs"
            element={<AuditLogsPage />}
          />
          <Route
            path="/admin/monitoring"
            element={<MonitoringPage />}
          />
          <Route
            path="/admin/settings"
            element={<SettingsPage />}
          />
        </Route>

        {/* Member Routes */}
        <Route element={<RoleGuard role="MEMBER" />}>
          <Route
            path="/member/dashboard"
            element={<MemberDashboardPage />}
          />
          <Route
            path="/member/contributions"
            element={<MemberContributionsPage />}
          />
          <Route
            path="/member/contribution-plan"
            element={<MemberPlanPage />}
          />
          <Route
            path="/member/loans"
            element={<MemberLoansPage />}
          />
          <Route
            path="/member/repayments"
            element={<MemberRepaymentsPage />}
          />
          <Route
            path="/member/transactions"
            element={<MemberRepaymentsPage />}
          />
          <Route
            path="/member/notifications"
            element={<MemberNotificationsPage />}
          />
          <Route
            path="/member/profile"
            element={<MemberProfilePage />}
          />
        </Route>
      </Route>

      <Route
        path="*"
        element={<HomeRedirect />}
      />
    </Routes>
  )
}

export default function App() {
  const application = (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
      <Toaster
        position="top-right"
        richColors
        closeButton
      />
    </AppProvider>
  )
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
  return clientId ? (
    <GoogleOAuthProvider clientId={clientId}>{application}</GoogleOAuthProvider>
  ) : (
    application
  )
}
