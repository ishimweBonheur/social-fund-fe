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
        'flex h-full min-h-0 w-full flex-col overflow-hidden bg-[#213448] py-4 text-[#EAE0CF] transition-all duration-200',
        expanded ? 'px-3' : 'items-center px-3',
      )}
    >
      <NavLink
        to={dashboardFor(currentUser.role)}
        className={cn(
          'mb-5 flex h-10 shrink-0 items-center text-sm font-semibold tracking-tight text-[#EAE0CF]',
          expanded ? 'w-full gap-3 px-2' : 'w-10 justify-center',
        )}
        title="Social Fund"
      >
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: BRAND_GREEN }}
        >
          <FinmLogoIcon className="h-4 w-4" />
        </span>
        {expanded && (
          <div>
            <span className="block truncate text-base">Social Fund</span>
            <span className="block text-[10px] font-medium text-[#94B4C1]">Community finance</span>
          </div>
        )}
      </NavLink>
      <nav
        aria-label="Primary navigation"
        className={cn(
          'flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto scrollbar-hide',
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
                'relative flex h-10 shrink-0 items-center rounded-md text-[13px] font-medium text-[#94B4C1] transition-colors hover:bg-[#547792]/25 hover:text-[#EAE0CF]',
                expanded ? 'w-full gap-3 px-3' : 'w-10 justify-center',
                isActive &&
                  'bg-[#547792]/35 text-[#EAE0CF] before:absolute before:left-0 before:h-5 before:w-0.5 before:rounded-full before:bg-[#94B4C1] hover:bg-[#547792]/45 hover:text-[#EAE0CF]',
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
          'flex h-10 shrink-0 items-center rounded-md border-t border-[#94B4C1]/20 text-[13px] font-medium text-[#94B4C1] transition-colors hover:bg-[#547792]/25 hover:text-[#EAE0CF]',
          expanded ? 'w-full gap-3 px-3' : 'w-10 justify-center',
        )}
      >
        {expanded ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
        {expanded && <span>Collapse</span>}
      </button>
    </aside>
  )
}
