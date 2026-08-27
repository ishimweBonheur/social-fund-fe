export interface Notification {
  id: string
  title: string
  message: string
  time: string
  read: boolean
  type: 'payment' | 'security' | 'update' | 'message'
}

export interface Wallet {
  id: string
  name: string
  balance: number
  currency: string
  type: 'checking' | 'savings' | 'credit'
  lastFour: string
}

export interface Transaction {
  id: string
  name: string
  icon: 'dribbble' | 'google' | 'amazon' | 'transfer' | 'deposit'
  iconColor: string
  date: string
  time: string
  status: 'Successful' | 'Pending' | 'Failed'
  amount: number
  category: string
}

export interface Message {
  id: string
  sender: string
  avatar: string
  preview: string
  time: string
  unread: boolean
}

export interface Contact {
  id: string
  name: string
  email: string
  phone: string
  avatar: string
  company: string
}

export interface Document {
  id: string
  name: string
  type: string
  size: string
  date: string
}

export interface HistoryEntry {
  id: string
  action: string
  detail: string
  date: string
  time: string
}
