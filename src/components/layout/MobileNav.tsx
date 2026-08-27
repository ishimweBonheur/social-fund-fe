import { NavLink } from 'react-router-dom'
import { navigation } from '@/config/navigation'
import { useApp } from '@/context/AppContext'
import { cn } from '@/lib/utils'

export function MobileNav() {
  const { currentUser } = useApp()
  if (!currentUser) return null
  return (
    <nav className="fixed inset-x-2 bottom-2 z-50 flex items-center gap-1 overflow-x-auto rounded-full border border-border bg-card/95 p-1.5 shadow-soft backdrop-blur-md md:hidden scrollbar-hide">
      {navigation[currentUser.role].map(({ to, icon: Icon, label }) => (
        <NavLink key={to} to={to} title={label} className={({ isActive }) => cn('flex h-9 min-w-10 flex-1 items-center justify-center rounded-full text-muted-foreground', isActive && 'bg-[#1a7a4a] text-white')}>
          <Icon className="h-4 w-4" />
          <span className="sr-only">{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
