import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { notifications as notificationData } from '@/data/social-fund-data'
import type { Notification, User, UserRole } from '@/types/app'

interface AppContextValue {
  currentUser: User | null; isAuthenticated: boolean; notifications: Notification[]; unreadCount: number
  login: (role?: UserRole) => void; logout: () => void; switchRole: (role: UserRole) => void
  markNotificationRead: (id: string) => void; markAllNotificationsRead: () => void
}
const users: Record<UserRole, User> = {
  ADMIN: { id: 'usr-admin-01', fullName: 'Bonheur Ishimwe', email: 'admin@socialfund.rw', role: 'ADMIN' },
  MEMBER: { id: 'usr-member-24', fullName: 'Bonheur Ishimwe', email: 'member@socialfund.rw', role: 'MEMBER' },
}
const AppContext = createContext<AppContextValue | undefined>(undefined)
export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(users.ADMIN)
  const [allNotifications, setNotifications] = useState<Notification[]>(notificationData)
  const notifications = useMemo(() => allNotifications.filter((n) => n.audience === 'ALL' || n.audience === currentUser?.role), [allNotifications, currentUser?.role])
  const unreadCount = notifications.filter((n) => !n.read).length
  const login = useCallback((role: UserRole = 'ADMIN') => setCurrentUser(users[role]), [])
  const logout = useCallback(() => setCurrentUser(null), [])
  const switchRole = useCallback((role: UserRole) => setCurrentUser(users[role]), [])
  const markNotificationRead = useCallback((id: string) => setNotifications((items) => items.map((n) => n.id === id ? { ...n, read: true } : n)), [])
  const markAllNotificationsRead = useCallback(() => setNotifications((items) => items.map((n) => n.audience === 'ALL' || n.audience === currentUser?.role ? { ...n, read: true } : n)), [currentUser?.role])
  const value = useMemo(() => ({ currentUser, isAuthenticated: Boolean(currentUser), notifications, unreadCount, login, logout, switchRole, markNotificationRead, markAllNotificationsRead }), [currentUser, notifications, unreadCount, login, logout, switchRole, markNotificationRead, markAllNotificationsRead])
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
// Context and its hook intentionally share a module so consumers cannot access the raw context.
// eslint-disable-next-line react-refresh/only-export-components
export function useApp() { const value = useContext(AppContext); if (!value) throw new Error('useApp must be used within AppProvider'); return value }
