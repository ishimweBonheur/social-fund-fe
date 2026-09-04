import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { Toaster } from 'sonner'
import { AppLayout } from '@/components/layout/AppLayout'
import { dashboardFor } from '@/config/navigation'
import { AppProvider, useApp } from '@/context/AppContext'
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage'
import AuditLogsPage from '@/pages/admin/AuditLogsPage'
import ContributionPlansPage from '@/pages/admin/ContributionPlansPage'
import ContributionsPage from '@/pages/admin/ContributionsPage'
import ContributionReviewPage from '@/pages/admin/ContributionReviewPage'
import EmailNotificationsPage from '@/pages/admin/EmailNotificationsPage'
import MembersPage from '@/pages/admin/MembersPage'
import NewMemberPage from '@/pages/admin/NewMemberPage'
import NotificationsPage from '@/pages/admin/NotificationsPage'
import RepaymentsPage from '@/pages/admin/RepaymentsPage'
import SettingsPage from '@/pages/admin/SettingsPage'
import PaymentSettingsPage from '@/pages/admin/PaymentSettingsPage'
import LoginPage from '@/pages/LoginPage'
import MemberContributionsPage from '@/pages/member/MemberContributionsPage'
import MemberDashboardPage from '@/pages/member/MemberDashboardPage'
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
            path="/admin/members/new"
            element={<NewMemberPage />}
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
            path="/admin/repayments"
            element={<RepaymentsPage />}
          />
          <Route
            path="/admin/notifications"
            element={<NotificationsPage />}
          />
          <Route
            path="/admin/email-notifications"
            element={<EmailNotificationsPage />}
          />
          <Route
            path="/admin/audit-logs"
            element={<AuditLogsPage />}
          />
          <Route
            path="/admin/settings"
            element={<SettingsPage />}
          />
          <Route
            path="/admin/settings/payment-method"
            element={<PaymentSettingsPage />}
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
        className="app-toaster"
        position="top-right"
        richColors
        closeButton
        toastOptions={{
          duration: 5000,
          classNames: {
            toast: 'app-toast',
            title: 'app-toast-title',
            description: 'app-toast-description',
            success: 'app-toast-success',
            error: 'app-toast-error',
            warning: 'app-toast-warning',
            info: 'app-toast-info',
          },
        }}
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
