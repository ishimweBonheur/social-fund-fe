import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { authenticateWithGoogle, endSession, getCurrentUser } from '@/services/authService'
import { authStorage } from '@/services/authStorage'
import {
  listNotifications,
  subscribeNotifications,
  readAllNotifications,
  readNotification,
} from '@/services/notificationService'
import type { Notification, User } from '@/types/app'

interface AppContextValue {
  currentUser: User | null
  isAuthenticated: boolean
  isAuthLoading: boolean
  notifications: Notification[]
  unreadCount: number
  loginWithGoogle: (idToken: string) => Promise<User>
  logout: () => void
  markNotificationRead: (id: string) => void
  markAllNotificationsRead: () => void
  refreshNotifications: () => void
}

const AppContext = createContext<AppContextValue | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(() =>
    authStorage.getToken() ? authStorage.getUser() : null,
  )
  const [isAuthLoading, setIsAuthLoading] = useState(() =>
    Boolean(authStorage.getToken() && authStorage.getUser()),
  )
  const [allNotifications, setNotifications] = useState<Notification[]>([])
  const notifications = useMemo(
    () =>
      allNotifications.filter(
        (item) => item.audience === 'ALL' || item.audience === currentUser?.role,
      ),
    [allNotifications, currentUser?.role],
  )
  const unreadCount = notifications.filter((item) => !item.read).length

  const loginWithGoogle = useCallback(async (credential: string) => {
    const session = await authenticateWithGoogle(credential)
    authStorage.save(session.accessToken, session.user)
    const user = await getCurrentUser(session.user.id).catch(() => session.user)
    authStorage.save(session.accessToken, user)
    setCurrentUser(user)
    return user
  }, [])

  const logout = useCallback(() => {
    if (authStorage.getToken()) void endSession().catch(() => undefined)
    authStorage.clear()
    setCurrentUser(null)
  }, [])

  useEffect(() => {
    const handleUnauthorized = () => {
      authStorage.clear()
      setCurrentUser(null)
      setIsAuthLoading(false)
    }
    window.addEventListener('social-fund:unauthorized', handleUnauthorized)
    const token = authStorage.getToken()
    const storedUser = authStorage.getUser()
    if (token && storedUser)
      void getCurrentUser(storedUser.id)
        .then((user) => {
          setCurrentUser(user)
          authStorage.save(token, user)
        })
        .catch(handleUnauthorized)
        .finally(() => setIsAuthLoading(false))
    else authStorage.clear()
    return () => window.removeEventListener('social-fund:unauthorized', handleUnauthorized)
  }, [])
  const markNotificationRead = useCallback((id: string) => {
    setNotifications((items) =>
      items.map((item) => (item.id === id ? { ...item, read: true } : item)),
    )
    void readNotification(id).catch(() => undefined)
  }, [])
  const markAllNotificationsRead = useCallback(() => {
    setNotifications((items) =>
      items.map((item) =>
        item.audience === 'ALL' || item.audience === currentUser?.role
          ? { ...item, read: true }
          : item,
      ),
    )
    void readAllNotifications().catch(() => undefined)
  }, [currentUser?.role])

  const refreshNotifications = useCallback(() => {
    if (!currentUser) return
    void listNotifications()
      .then(setNotifications)
      .catch(() => setNotifications([]))
  }, [currentUser])
  const currentUserID = currentUser?.id
  useEffect(() => {
    if (!currentUserID) return
    let active = true
    void listNotifications()
      .then((items) => {
        if (active) setNotifications(items)
      })
      .catch(() => undefined)
    const unsubscribe = subscribeNotifications((items) => {
      if (active) setNotifications(items)
    })
    return () => {
      active = false
      unsubscribe()
    }
  }, [currentUserID])
  const value = useMemo(
    () => ({
      currentUser,
      isAuthenticated: Boolean(currentUser),
      isAuthLoading,
      notifications,
      unreadCount,
      loginWithGoogle,
      logout,
      markNotificationRead,
      markAllNotificationsRead,
      refreshNotifications,
    }),
    [
      currentUser,
      isAuthLoading,
      notifications,
      unreadCount,
      loginWithGoogle,
      logout,
      markNotificationRead,
      markAllNotificationsRead,
      refreshNotifications,
    ],
  )
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApp() {
  const value = useContext(AppContext)
  if (!value) throw new Error('useApp must be used within AppProvider')
  return value
}
