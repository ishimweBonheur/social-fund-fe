import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { AppProvider } from '@/context/AppContext'
import { AnalyticsPage } from '@/pages/AnalyticsPage'
import { ContactsPage } from '@/pages/ContactsPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { DocumentsPage } from '@/pages/DocumentsPage'
import { HistoryPage } from '@/pages/HistoryPage'
import { LogoutPage } from '@/pages/LogoutPage'
import { MessagesPage } from '@/pages/MessagesPage'
import { ReportsPage } from '@/pages/ReportsPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { TransactionsPage } from '@/pages/TransactionsPage'
import { WalletPage } from '@/pages/WalletPage'

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="wallet" element={<WalletPage />} />
            <Route path="transactions" element={<TransactionsPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="messages" element={<MessagesPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="documents" element={<DocumentsPage />} />
            <Route path="history" element={<HistoryPage />} />
            <Route path="contacts" element={<ContactsPage />} />
            <Route path="logout" element={<LogoutPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  )
}
