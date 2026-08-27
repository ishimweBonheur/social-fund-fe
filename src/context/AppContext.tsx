import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { avatars } from '@/data/avatars'
import { paymentHistory } from '@/data/mock-data'
import type {
  Contact,
  Document,
  HistoryEntry,
  Message,
  Notification,
  Transaction,
  Wallet,
} from '@/types/app'

interface AppContextValue {
  isAuthenticated: boolean
  notifications: Notification[]
  unreadCount: number
  wallets: Wallet[]
  transactions: Transaction[]
  messages: Message[]
  contacts: Contact[]
  documents: Document[]
  history: HistoryEntry[]
  dateRange: { start: string; end: string }
  setDateRange: (range: { start: string; end: string }) => void
  markNotificationRead: (id: string) => void
  markAllNotificationsRead: () => void
  addNotification: (notification: Omit<Notification, 'id' | 'read'>) => void
  addWallet: (wallet: Omit<Wallet, 'id'>) => void
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void
  sendMoney: (amount: number, recipient: string) => void
  receiveMoney: (amount: number, sender: string) => void
  toggleMessageRead: (id: string) => void
  sendMessage: (contactId: string, text: string) => void
  addContact: (contact: Omit<Contact, 'id'>) => void
  logout: () => void
  login: () => void
}

const AppContext = createContext<AppContextValue | undefined>(undefined)

const initialNotifications: Notification[] = [
  {
    id: 'n1',
    title: 'Payment received',
    message: 'Google Pay sent you $12,345.89',
    time: '2 min ago',
    read: false,
    type: 'payment',
  },
  {
    id: 'n2',
    title: 'New login detected',
    message: 'Sign-in from Chrome on Windows',
    time: '1 hour ago',
    read: false,
    type: 'security',
  },
  {
    id: 'n3',
    title: 'Weekly report ready',
    message: 'Your engagement report for June is available',
    time: '3 hours ago',
    read: false,
    type: 'update',
  },
  {
    id: 'n4',
    title: 'New message',
    message: 'Aisha Williams: Can you review the invoice?',
    time: 'Yesterday',
    read: true,
    type: 'message',
  },
]

const initialWallets: Wallet[] = [
  {
    id: 'w1',
    name: 'Primary Checking',
    balance: 32678.9,
    currency: 'USD',
    type: 'checking',
    lastFour: '9090',
  },
  {
    id: 'w2',
    name: 'Business Savings',
    balance: 78989.09,
    currency: 'USD',
    type: 'credit',
    lastFour: '4242',
  },
]

const initialMessages: Message[] = [
  {
    id: 'm1',
    sender: 'Aisha Williams',
    avatar: avatars.aisha,
    preview: 'Can you review the invoice?',
    time: '10:30 AM',
    unread: true,
  },
  {
    id: 'm2',
    sender: 'Finance Team',
    avatar: avatars.financeTeam,
    preview: 'Q2 report has been uploaded',
    time: 'Yesterday',
    unread: true,
  },
  {
    id: 'm3',
    sender: 'Marcus Johnson',
    avatar: avatars.marcus,
    preview: 'Thanks for the quick transfer!',
    time: 'Mon',
    unread: false,
  },
]

const initialContacts: Contact[] = [
  {
    id: 'c1',
    name: 'Aisha Williams',
    email: 'aisha@design.co',
    phone: '+1 555-0101',
    avatar: avatars.aisha,
    company: 'Dribbble Design',
  },
  {
    id: 'c2',
    name: 'Marcus Johnson',
    email: 'marcus@morgan.io',
    phone: '+1 555-0102',
    avatar: avatars.marcus,
    company: 'Google Pay',
  },
  {
    id: 'c3',
    name: 'Jordan Ellis',
    email: 'jordan@amazon.com',
    phone: '+1 555-0103',
    avatar: avatars.jordan,
    company: 'Amazon Shopping',
  },
]

const initialDocuments: Document[] = [
  { id: 'd1', name: 'Q2 Financial Report.pdf', type: 'PDF', size: '2.4 MB', date: '16 Jun 2025' },
  { id: 'd2', name: 'Invoice #1042.pdf', type: 'PDF', size: '890 KB', date: '15 Jun 2025' },
  { id: 'd3', name: 'Tax Summary 2025.xlsx', type: 'Excel', size: '1.1 MB', date: '10 Jun 2025' },
]

const initialHistory: HistoryEntry[] = [
  {
    id: 'h1',
    action: 'Wallet created',
    detail: 'Business Savings account added',
    date: '16 Jun 2025',
    time: '09:15 AM',
  },
  {
    id: 'h2',
    action: 'Transfer sent',
    detail: `$5,000 to Marcus Johnson`,
    date: '15 Jun 2025',
    time: '04:30 PM',
  },
  {
    id: 'h3',
    action: 'Document uploaded',
    detail: 'Q2 Financial Report.pdf',
    date: '14 Jun 2025',
    time: '11:00 AM',
  },
]

const liveUpdates = [
  {
    title: 'Transaction completed',
    message: 'Amazon Shopping payment of $321.67 processed',
    type: 'payment' as const,
  },
  {
    title: 'Balance updated',
    message: 'Your Primary Checking balance increased by $1,200',
    type: 'update' as const,
  },
  {
    title: 'Security alert',
    message: 'Password changed successfully',
    type: 'security' as const,
  },
]

export function AppProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(true)
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications)
  const [wallets, setWallets] = useState<Wallet[]>(initialWallets)
  const [transactions, setTransactions] = useState<Transaction[]>(
    paymentHistory.map((p) => ({ ...p, category: 'Payment' }))
  )
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [contacts, setContacts] = useState<Contact[]>(initialContacts)
  const [documents] = useState<Document[]>(initialDocuments)
  const [history, setHistory] = useState<HistoryEntry[]>(initialHistory)
  const [dateRange, setDateRange] = useState({
    start: '29 Jun, 2025',
    end: '29 August, 2025',
  })

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  )

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }, [])

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }, [])

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'read'>) => {
    setNotifications((prev) => [
      {
        ...notification,
        id: `n-${Date.now()}`,
        read: false,
      },
      ...prev,
    ])
  }, [])

  const addWallet = useCallback((wallet: Omit<Wallet, 'id'>) => {
    setWallets((prev) => [...prev, { ...wallet, id: `w-${Date.now()}` }])
    setHistory((prev) => [
      {
        id: `h-${Date.now()}`,
        action: 'Wallet created',
        detail: `${wallet.name} account added`,
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      },
      ...prev,
    ])
    addNotification({
      title: 'Wallet added',
      message: `${wallet.name} has been created successfully`,
      time: 'Just now',
      type: 'update',
    })
  }, [addNotification])

  const addTransaction = useCallback((transaction: Omit<Transaction, 'id'>) => {
    setTransactions((prev) => [{ ...transaction, id: `t-${Date.now()}` }, ...prev])
  }, [])

  const sendMoney = useCallback(
    (amount: number, recipient: string) => {
      setWallets((prev) =>
        prev.map((w, i) => (i === 0 ? { ...w, balance: w.balance - amount } : w))
      )
      addTransaction({
        name: `Transfer to ${recipient}`,
        icon: 'transfer',
        iconColor: '#0F9D58',
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        status: 'Successful',
        amount: -amount,
        category: 'Transfer',
      })
      addNotification({
        title: 'Transfer sent',
        message: `$${amount.toLocaleString()} sent to ${recipient}`,
        time: 'Just now',
        type: 'payment',
      })
    },
    [addNotification, addTransaction]
  )

  const receiveMoney = useCallback(
    (amount: number, sender: string) => {
      setWallets((prev) =>
        prev.map((w, i) => (i === 0 ? { ...w, balance: w.balance + amount } : w))
      )
      addTransaction({
        name: `Received from ${sender}`,
        icon: 'deposit',
        iconColor: '#16A34A',
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        status: 'Successful',
        amount,
        category: 'Deposit',
      })
      addNotification({
        title: 'Payment received',
        message: `$${amount.toLocaleString()} received from ${sender}`,
        time: 'Just now',
        type: 'payment',
      })
    },
    [addNotification, addTransaction]
  )

  const toggleMessageRead = useCallback((id: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, unread: false } : m))
    )
  }, [])

  const sendMessage = useCallback((contactId: string, text: string) => {
    const contact = contacts.find((c) => c.id === contactId)
    if (!contact) return
    setMessages((prev) => [
      {
        id: `m-${Date.now()}`,
        sender: contact.name,
        avatar: contact.avatar,
        preview: text,
        time: 'Just now',
        unread: false,
      },
      ...prev,
    ])
    addNotification({
      title: 'Message sent',
      message: `Message sent to ${contact.name}`,
      time: 'Just now',
      type: 'message',
    })
  }, [contacts, addNotification])

  const addContact = useCallback((contact: Omit<Contact, 'id'>) => {
    setContacts((prev) => [...prev, { ...contact, id: `c-${Date.now()}` }])
    addNotification({
      title: 'Contact added',
      message: `${contact.name} added to your contacts`,
      time: 'Just now',
      type: 'update',
    })
  }, [addNotification])

  const logout = useCallback(() => setIsAuthenticated(false), [])
  const login = useCallback(() => setIsAuthenticated(true), [])

  useEffect(() => {
    let index = 0
    const interval = setInterval(() => {
      const update = liveUpdates[index % liveUpdates.length]
      addNotification({ ...update, time: 'Just now' })
      index += 1
    }, 45000)
    return () => clearInterval(interval)
  }, [addNotification])

  const value = useMemo(
    () => ({
      isAuthenticated,
      notifications,
      unreadCount,
      wallets,
      transactions,
      messages,
      contacts,
      documents,
      history,
      dateRange,
      setDateRange,
      markNotificationRead,
      markAllNotificationsRead,
      addNotification,
      addWallet,
      addTransaction,
      sendMoney,
      receiveMoney,
      toggleMessageRead,
      sendMessage,
      addContact,
      logout,
      login,
    }),
    [
      isAuthenticated,
      notifications,
      unreadCount,
      wallets,
      transactions,
      messages,
      contacts,
      documents,
      history,
      dateRange,
      markNotificationRead,
      markAllNotificationsRead,
      addNotification,
      addWallet,
      addTransaction,
      sendMoney,
      receiveMoney,
      toggleMessageRead,
      sendMessage,
      addContact,
      logout,
      login,
    ]
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) throw new Error('useApp must be used within AppProvider')
  return context
}
