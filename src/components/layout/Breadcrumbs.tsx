import { ChevronRight, Home } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { navigation } from '@/config/navigation'
import { useApp } from '@/context/AppContext'

export function Breadcrumbs() {
  const { currentUser } = useApp()
  const { pathname } = useLocation()
  if (!currentUser) return null

  const items = navigation[currentUser.role]
  const dashboard = items[0]
  const current = [...items]
    .sort((a, b) => b.to.length - a.to.length)
    .find((item) => pathname === item.to || pathname.startsWith(`${item.to}/`))
  const nestedLabel = pathname.includes('/review') ? 'Review contribution' : undefined
  const onDashboard = current?.to === dashboard.to && !nestedLabel

  return (
    <nav aria-label="Breadcrumb" className="mb-3 flex items-center gap-1.5 text-xs text-muted-foreground">
      <Link to={dashboard.to} className="flex items-center gap-1.5 transition-colors hover:text-foreground">
        <Home className="h-3.5 w-3.5" />
        {dashboard.label}
      </Link>
      {!onDashboard && current && (
        <>
          <ChevronRight className="h-3.5 w-3.5 opacity-60" />
          {nestedLabel ? (
            <Link to={current.to} className="transition-colors hover:text-foreground">{current.label}</Link>
          ) : (
            <span className="font-medium text-foreground">{current.label}</span>
          )}
        </>
      )}
      {nestedLabel && (
        <>
          <ChevronRight className="h-3.5 w-3.5 opacity-60" />
          <span className="font-medium text-foreground">{nestedLabel}</span>
        </>
      )}
    </nav>
  )
}
