import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { FinmLogoIcon } from '@/components/shared/FinmLogo'
import { navigation, dashboardFor } from '@/config/navigation'
import { useApp } from '@/context/AppContext'
import { BRAND_GREEN } from '@/lib/brand'
import { cn } from '@/lib/utils'

interface SidebarProps {
  expanded: boolean
  onExpandedChange: (expanded: boolean) => void
}

export function Sidebar({ expanded, onExpandedChange }: SidebarProps) {
  const { currentUser } = useApp()
  if (!currentUser) return null
  const items = navigation[currentUser.role].filter(
    ({ label }) => label !== 'Notifications' && label !== 'Settings',
  )

  return (
    <aside
      className={cn(
        'flex h-full min-h-0 w-full flex-col gap-2 overflow-hidden border border-border bg-card py-3 shadow-soft transition-[border-radius] duration-200',
        expanded ? 'rounded-2xl px-3' : 'items-center rounded-full px-2',
      )}
    >
      <NavLink
        to={dashboardFor(currentUser.role)}
        className={cn(
          'mb-1 flex h-9 shrink-0 items-center rounded-full text-sm font-semibold tracking-tight text-foreground',
          expanded ? 'w-full gap-3 px-0' : 'w-9 justify-center',
        )}
        title="Social Fund"
      >
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: BRAND_GREEN }}
        >
          <FinmLogoIcon className="h-4 w-4" />
        </span>
        {expanded && <span className="truncate">Social Fund</span>}
      </NavLink>
      <nav
        aria-label="Primary navigation"
        className={cn(
          'flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto scrollbar-hide',
          expanded ? 'w-full' : 'items-center',
        )}
      >
        {items.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            title={label}
            className={({ isActive }) =>
              cn(
                'flex h-9 shrink-0 items-center rounded-xl text-sm font-medium text-[#9CA3AF] transition-colors hover:bg-muted hover:text-foreground',
                expanded ? 'w-full gap-3 px-3' : 'w-9 justify-center',
                isActive && 'bg-[#1a7a4a] text-white hover:bg-[#1a7a4a] hover:text-white',
              )
            }
          >
            <Icon
              className="h-4 w-4"
              strokeWidth={1.75}
            />
            {expanded && <span className="truncate">{label}</span>}
          </NavLink>
        ))}
      </nav>
      <button
        type="button"
        onClick={() => onExpandedChange(!expanded)}
        title={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
        aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
        aria-expanded={expanded}
        className={cn(
          'flex h-9 shrink-0 items-center rounded-xl text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
          expanded ? 'w-full gap-3 px-3' : 'w-9 justify-center',
        )}
      >
        {expanded ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
        {expanded && <span>Collapse</span>}
      </button>
    </aside>
  )
}
