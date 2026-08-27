import type { AreaChartDataPoint, EngagementDataPoint, PaymentRecord } from '@/types/dashboard'

export const engagementData: EngagementDataPoint[] = [
  { month: 'JAN', value: 2800 },
  { month: 'FEB', value: 3200 },
  { month: 'MAR', value: 2600 },
  { month: 'APR', value: 4200, isActive: true },
  { month: 'MAY', value: 3100 },
  { month: 'JUN', value: 2900 },
]

export const paymentGoalData: AreaChartDataPoint[] = [
  { label: 'Jan', value: 22000 },
  { label: 'Feb', value: 24500 },
  { label: 'Mar', value: 23800 },
  { label: 'Apr', value: 26800 },
  { label: 'May', value: 30200 },
  { label: 'Jun', value: 32678 },
  { label: 'Jul', value: 31800 },
]

export const paymentHistory: PaymentRecord[] = [
  {
    id: '1',
    name: 'Dribbble Design',
    icon: 'dribbble',
    iconColor: '#EA4C89',
    date: '16 Jun 2025',
    time: '10:30 PM',
    status: 'Successful',
    amount: 89345.23,
  },
  {
    id: '2',
    name: 'Google Pay',
    icon: 'google',
    iconColor: '#4285F4',
    date: '15 Jun 2025',
    time: '11:45 PM',
    status: 'Successful',
    amount: 12345.89,
  },
  {
    id: '3',
    name: 'Amazon Shopping',
    icon: 'amazon',
    iconColor: '#FF9900',
    date: '14 Jun 2025',
    time: '10:15 PM',
    status: 'Successful',
    amount: 32123.67,
  },
]

export { mandatoryPaymentAvatars } from '@/data/avatars'
