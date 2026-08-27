import type { Notification } from '@/types/app'

export const members = [
  ['SF-001', 'Aline Mukamana', 'aline@example.rw', '0788 120 441', 'Active', '05 Jan 2024'],
  ['SF-002', 'Eric Niyonzima', 'eric@example.rw', '0783 490 112', 'Active', '12 Feb 2024'],
  ['SF-003', 'Diane Uwase', 'diane@example.rw', '0722 801 904', 'Active', '20 Mar 2024'],
  ['SF-004', 'Patrick Habimana', 'patrick@example.rw', '0781 663 220', 'Pending', '18 Aug 2026'],
]
export const contributions = [
  ['Aline Mukamana', 'RWF 20,000', 'RWF 20,000', '05 Aug 2026', '03 Aug 2026', 'Mobile Money', 'TXN-88491', 'Paid'],
  ['Eric Niyonzima', 'RWF 30,000', 'RWF 30,000', '05 Aug 2026', '05 Aug 2026', 'Bank Transfer', 'TXN-88496', 'Paid'],
  ['Bonheur Ishimwe', 'RWF 20,000', 'RWF 20,000', '05 Aug 2026', '04 Aug 2026', 'Mobile Money', 'TXN-88494', 'Paid'],
  ['Diane Uwase', 'RWF 25,000', 'RWF 0', '05 Aug 2026', '—', '—', '—', 'Overdue'],
]
export const contributionPlans = [
  ['Aline Mukamana', 'RWF 20,000', 'Monthly', '05 Jan 2024', 'Open-ended', '05 Sep 2026', 'Active'],
  ['Eric Niyonzima', 'RWF 30,000', 'Monthly', '12 Feb 2024', 'Open-ended', '05 Sep 2026', 'Active'],
  ['Bonheur Ishimwe', 'RWF 20,000', 'Monthly', '10 Mar 2024', 'Open-ended', '05 Sep 2026', 'Active'],
]
export const loans = [
  ['Aline Mukamana', 'RWF 500,000', '02 Jul 2026', 'RWF 500,000', 'RWF 325,000', 'Active', 'Grace Uwera'],
  ['Bonheur Ishimwe', 'RWF 250,000', '15 May 2026', 'RWF 250,000', 'RWF 150,000', 'Active', 'Grace Uwera'],
  ['Eric Niyonzima', 'RWF 800,000', '21 Aug 2026', '—', '—', 'Pending', '—'],
]
export const repayments = [
  ['Aline Mukamana', 'LN-1042', 'RWF 50,000', 'RWF 50,000', '15 Aug 2026', '14 Aug 2026', 'Paid'],
  ['Bonheur Ishimwe', 'LN-1031', 'RWF 25,000', 'RWF 25,000', '20 Aug 2026', '19 Aug 2026', 'Paid'],
  ['Diane Uwase', 'LN-1028', 'RWF 40,000', 'RWF 0', '10 Aug 2026', '—', 'Overdue'],
]
export const fundGrowth = [
  { month: 'MAR', value: 14800000 }, { month: 'APR', value: 15600000 }, { month: 'MAY', value: 16900000 },
  { month: 'JUN', value: 17750000 }, { month: 'JUL', value: 18900000 }, { month: 'AUG', value: 19750000 },
]
export const notifications: Notification[] = [
  { id: 'n1', title: 'New loan request', message: 'Eric Niyonzima requested RWF 800,000.', time: '12 min ago', read: false, audience: 'ADMIN' },
  { id: 'n2', title: 'Overdue contribution', message: 'One August contribution requires follow-up.', time: '1 hour ago', read: false, audience: 'ADMIN' },
  { id: 'n3', title: 'Contribution confirmed', message: 'Your RWF 20,000 contribution was recorded.', time: '2 days ago', read: false, audience: 'MEMBER' },
  { id: 'n4', title: 'Repayment reminder', message: 'Your next RWF 25,000 repayment is due 20 Sep 2026.', time: '3 days ago', read: true, audience: 'MEMBER' },
  { id: 'n5', title: 'Monthly statement ready', message: 'The August Social Fund statement is available.', time: '4 days ago', read: true, audience: 'ALL' },
]
