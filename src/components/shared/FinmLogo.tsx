import { Landmark } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { APP_NAME, BRAND_GREEN } from '@/lib/brand'
import { cn } from '@/lib/utils'

interface FinmLogoProps {
  showName?: boolean
  iconClassName?: string
  className?: string
}

export function FinmLogo({ showName = true, iconClassName, className }: FinmLogoProps) {
  return (
    <NavLink
      to="/"
      className={cn('flex min-w-0 items-center gap-2', className)}
    >
      <div
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full shadow-sm sm:h-8 sm:w-8"
        style={{ backgroundColor: BRAND_GREEN }}
      >
        <Landmark
          className={cn('h-3.5 w-3.5 text-white sm:h-4 sm:w-4', iconClassName)}
          strokeWidth={2}
        />
      </div>
      {showName && (
        <span className="truncate text-sm font-bold tracking-tight text-foreground sm:text-base">
          {APP_NAME}
        </span>
      )}
    </NavLink>
  )
}

export function FinmLogoIcon({ className }: { className?: string }) {
  return (
    <Landmark
      className={cn('h-4 w-4 text-white', className)}
      strokeWidth={2}
    />
  )
}
