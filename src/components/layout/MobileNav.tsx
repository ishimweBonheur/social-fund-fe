import { NavLink } from 'react-router-dom'
import { navigation } from '@/config/navigation'
import { useApp } from '@/context/AppContext'
import { cn } from '@/lib/utils'

export function MobileNav() {
  const { currentUser } = useApp()
  if (!currentUser) return null
  const items = navigation[currentUser.role]

  return (
    <nav
      aria-label="Primary navigation"
      className="fixed inset-x-0 bottom-0 z-50 bg-card/92 shadow-[0_-4px_24px_-8px_rgba(33,52,72,0.22)] backdrop-blur-xl dark:bg-[#213448]/92 md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="mx-auto flex w-full max-w-2xl items-stretch gap-0.5 overflow-x-auto px-2 pt-1.5 scrollbar-hide sm:gap-1">
        {items.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            title={label}
            aria-label={label}
            className={({ isActive }) =>
              cn(
                'group flex min-w-9 flex-1 flex-col items-center justify-center gap-1 rounded-xl px-1 pb-1.5 text-[10px] font-medium text-muted-foreground transition-colors sm:min-w-12 sm:px-1.5',
                isActive && 'text-primary',
              )
            }
          >
            {({ isActive }) => (
              <>
                <span
                  aria-hidden="true"
                  className={cn(
                    'flex h-7 w-12 items-center justify-center rounded-lg transition-colors sm:w-14',
                    isActive && 'bg-primary text-primary-foreground',
                  )}
                >
                  <Icon
                    className="h-[18px] w-[18px]"
                    strokeWidth={2}
                  />
                </span>
                <span className="hidden max-w-full truncate leading-none sm:block">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
