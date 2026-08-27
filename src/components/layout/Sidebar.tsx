import { useRef, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  BarChart3,
  Contact,
  FileText,
  History,
  LayoutGrid,
  LogOut,
  MessageSquare,
  Settings,
  Wallet,
} from 'lucide-react'
import { FinmLogoIcon } from '@/components/shared/FinmLogo'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { avatars } from '@/data/avatars'
import { BRAND_GREEN, USER } from '@/lib/brand'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/', icon: LayoutGrid, label: 'Dashboard', end: true },
  { to: '/history', icon: History, label: 'History' },
  { to: '/documents', icon: FileText, label: 'Documents' },
  { to: '/messages', icon: MessageSquare, label: 'Messages' },
  { to: '/contacts', icon: Contact, label: 'Contacts' },
] as const

function SidebarCard({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex w-full min-w-0 flex-col items-center gap-1 rounded-full border-[0.5px] border-border bg-card py-2.5 px-1.5 sm:gap-1.5 sm:py-3 sm:px-2',
        className
      )}
    >
      {children}
    </div>
  )
}

const TOOLTIP_LEFT = '4.5rem'

function SidebarTooltip({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  const triggerRef = useRef<HTMLDivElement>(null)
  const [tooltipTop, setTooltipTop] = useState<number | null>(null)

  return (
    <div
      ref={triggerRef}
      className="relative w-8 shrink-0 sm:w-9"
      onMouseEnter={() => {
        const rect = triggerRef.current?.getBoundingClientRect()
        if (rect) setTooltipTop(rect.top + rect.height / 2)
      }}
      onMouseLeave={() => setTooltipTop(null)}
      onFocus={() => {
        const rect = triggerRef.current?.getBoundingClientRect()
        if (rect) setTooltipTop(rect.top + rect.height / 2)
      }}
      onBlur={() => setTooltipTop(null)}
    >
      {children}
      {tooltipTop !== null && (
        <span
          role="tooltip"
          className="pointer-events-none fixed z-[100] -translate-y-1/2 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-[11px] font-medium text-background shadow-sm"
          style={{ top: tooltipTop, left: TOOLTIP_LEFT }}
        >
          {label}
        </span>
      )}
    </div>
  )
}

const iconButtonClass =
  'flex h-8 w-8 items-center justify-center rounded-xl transition-colors duration-200 sm:h-9 sm:w-9'

function IconButton({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cn(
        iconButtonClass,
        'text-[#9CA3AF] hover:bg-[#F3F4F6] hover:text-[#6B7280]',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

function SidebarNavLink({
  to,
  icon: Icon,
  label,
  end,
}: {
  to: string
  icon: typeof LayoutGrid
  label: string
  end?: boolean
}) {
  return (
    <SidebarTooltip label={label}>
      <NavLink to={to} end={end}>
        {({ isActive }) => (
          <span
            className={cn(
              iconButtonClass,
              isActive
                ? 'bg-[#1a7a4a] text-white shadow-sm'
                : 'text-[#9CA3AF] hover:bg-[#F3F4F6] hover:text-[#6B7280]'
            )}
          >
            <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={1.75} />
          </span>
        )}
      </NavLink>
    </SidebarTooltip>
  )
}

export function Sidebar() {
  const navigate = useNavigate()

  return (
    <aside className="flex h-full min-h-0 w-full min-w-0 flex-col gap-3 overflow-hidden">
      <SidebarCard>
        <NavLink to="/" end title="Home">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full shadow-sm sm:h-9 sm:w-9"
            style={{ backgroundColor: BRAND_GREEN }}
          >
            <FinmLogoIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </div>
        </NavLink>
        <NavLink to="/wallet" title="Wallet">
          {({ isActive }) => (
            <span
              className={cn(
                iconButtonClass,
                isActive
                  ? 'bg-[#1a7a4a] text-white'
                  : 'text-[#9CA3AF] hover:bg-[#F3F4F6] hover:text-[#6B7280]'
              )}
            >
              <Wallet className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={1.75} />
            </span>
          )}
        </NavLink>
        <NavLink to="/reports" title="Reports">
          {({ isActive }) => (
            <span
              className={cn(
                iconButtonClass,
                isActive
                  ? 'bg-[#1a7a4a] text-white'
                  : 'text-[#9CA3AF] hover:bg-[#F3F4F6] hover:text-[#6B7280]'
              )}
            >
              <BarChart3 className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={1.75} />
            </span>
          )}
        </NavLink>
      </SidebarCard>

      <SidebarCard className="min-h-0 flex-1 py-0">
        <div className="scrollbar-hide flex min-h-0 w-full min-w-0 flex-1 flex-col items-center gap-1 overflow-x-hidden overflow-y-auto overscroll-contain py-2.5 sm:gap-1.5 sm:py-3">
          {navItems.map((item) => (
            <SidebarNavLink key={item.to} {...item} />
          ))}
        </div>
      </SidebarCard>

      <SidebarCard>
        <SidebarTooltip label="Settings">
          <NavLink to="/settings">
            {({ isActive }) => (
              <span
                className={cn(
                  iconButtonClass,
                  isActive
                    ? 'bg-[#1a7a4a] text-white'
                    : 'text-[#9CA3AF] hover:bg-[#F3F4F6] hover:text-[#6B7280]'
                )}
              >
                <Settings className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={1.75} />
              </span>
            )}
          </NavLink>
        </SidebarTooltip>
        <SidebarTooltip label="Logout">
          <IconButton onClick={() => navigate('/logout')} aria-label="Logout">
            <LogOut className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={1.75} />
          </IconButton>
        </SidebarTooltip>
        <Avatar className="h-8 w-8 sm:h-9 sm:w-9">
          <AvatarImage src={avatars.user} alt={USER.name} />
          <AvatarFallback
            className="text-[10px] font-semibold text-white sm:text-[11px]"
            style={{ backgroundColor: BRAND_GREEN }}
          >
            {USER.initials}
          </AvatarFallback>
        </Avatar>
      </SidebarCard>
    </aside>
  )
}
