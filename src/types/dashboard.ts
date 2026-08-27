import type { ComponentType } from 'react'

export type SortDirection = 'asc' | 'desc'

export type PaymentSortKey = 'name' | 'date' | 'time' | 'status' | 'amount'

export interface PaymentRecord {
  id: string
  name: string
  icon: 'dribbble' | 'google' | 'amazon'
  iconColor: string
  date: string
  time: string
  status: 'Successful' | 'Pending' | 'Failed'
  amount: number
}

export interface EngagementDataPoint {
  month: string
  value: number
  isActive?: boolean
}

export interface AreaChartDataPoint {
  label: string
  value: number
}

export interface SidebarItem {
  id: string
  label: string
  icon: ComponentType<{ className?: string }>
}

export interface NavLink {
  label: string
  href: string
  active?: boolean
}
