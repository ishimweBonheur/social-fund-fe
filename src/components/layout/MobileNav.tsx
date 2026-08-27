import { NavLink } from 'react-router-dom'
import {
  BarChart3,
  LayoutGrid,
  MessageSquare,
  PieChart,
  Wallet,
  ArrowLeftRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const items = [
  { to: '/', icon: LayoutGrid, label: 'Dashboard', end: true },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
  { to: '/wallet', icon: Wallet, label: 'Wallet' },
  { to: '/transactions', icon: ArrowLeftRight, label: 'Transactions' },
  { to: '/analytics', icon: PieChart, label: 'Analytics' },
  { to: '/messages', icon: MessageSquare, label: 'Messages' },
] as const

export function MobileNav() {
  return (
    <nav className="fixed bottom-3 left-3 right-3 z-40 flex items-center justify-around rounded-xl bg-card px-1 py-1.5 shadow-sm border border-border/50 md:hidden">
      {items.map((item) => (
        <NavLink key={item.to} to={item.to} end={'end' in item ? item.end : false} title={item.label}>
          {({ isActive }) => {
            const Icon = item.icon
            return (
              <span
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full transition-colors',
                  isActive ? 'bg-[#0F9D58] text-white' : 'text-[#9CA3AF] hover:bg-muted'
                )}
              >
                <Icon className="h-4 w-4" strokeWidth={1.75} />
              </span>
            )
          }}
        </NavLink>
      ))}
    </nav>
  )
}
