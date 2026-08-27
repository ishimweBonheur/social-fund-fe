import { LogOut } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { FinmLogoIcon } from '@/components/shared/FinmLogo'
import { navigation, dashboardFor } from '@/config/navigation'
import { useApp } from '@/context/AppContext'
import { BRAND_GREEN } from '@/lib/brand'
import { cn } from '@/lib/utils'

export function Sidebar() {
  const { currentUser, logout } = useApp()
  if (!currentUser) return null
  return (
    <aside className="flex h-full min-h-0 w-full flex-col items-center gap-2 overflow-y-auto rounded-full border border-border bg-card px-2 py-3 shadow-soft scrollbar-hide">
      <NavLink to={dashboardFor(currentUser.role)} className="mb-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: BRAND_GREEN }} title="Social Fund">
        <FinmLogoIcon className="h-4 w-4" />
      </NavLink>
      {navigation[currentUser.role].map(({ to, icon: Icon, label }) => (
        <NavLink key={to} to={to} title={label} className={({ isActive }) => cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[#9CA3AF] transition-colors hover:bg-muted hover:text-foreground', isActive && 'bg-[#1a7a4a] text-white hover:bg-[#1a7a4a] hover:text-white')}>
          <Icon className="h-4 w-4" strokeWidth={1.75} />
        </NavLink>
      ))}
      <button type="button" onClick={logout} title="Sign out" className="mt-auto flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[#9CA3AF] transition-colors hover:bg-red-50 hover:text-red-600">
        <LogOut className="h-4 w-4" />
      </button>
    </aside>
  )
}
