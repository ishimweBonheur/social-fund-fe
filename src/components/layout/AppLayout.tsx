import { Outlet } from 'react-router-dom'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Header } from './Header'
import { MobileNav } from './MobileNav'
import { Sidebar } from './Sidebar'

export function AppLayout() {
  const [sidebarExpanded, setSidebarExpanded] = useState(() => localStorage.getItem('social-fund-sidebar-expanded') === 'true')
  const updateSidebar = (expanded: boolean) => {
    setSidebarExpanded(expanded)
    localStorage.setItem('social-fund-sidebar-expanded', String(expanded))
  }

  return (
    <div className="min-h-screen overflow-x-clip bg-background">
      {/* Fixed desktop sidebar rail (shown on md and up) */}
      <div
        className={cn('fixed bottom-3 left-2 z-40 hidden overflow-visible transition-[width] duration-200 sm:left-3 md:block', sidebarExpanded ? 'w-60' : 'w-14 sm:w-16')}
        style={{ top: '3.5rem' }}
      >
        <Sidebar expanded={sidebarExpanded} onExpandedChange={updateSidebar} />
      </div>

      {/* Fixed top navigation bar */}
      <div
        className={cn('fixed inset-x-0 top-0 z-50 bg-background/95 backdrop-blur-md transition-[left] duration-200', sidebarExpanded ? 'md:left-64' : 'md:left-20')}
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="px-2 py-2 sm:px-3 sm:py-2.5">
          <Header />
        </div>
      </div>

      {/* Main content: padded so the fixed bars never cover it */}
      <main className={cn('px-2 pb-[calc(4.75rem+env(safe-area-inset-bottom))] pt-[calc(4.5rem+env(safe-area-inset-top))] transition-[padding] duration-200 sm:px-3 sm:pt-[calc(4.75rem+env(safe-area-inset-top))] md:pb-4 md:pr-3 md:pt-[calc(4.5rem+env(safe-area-inset-top))]', sidebarExpanded ? 'md:pl-64' : 'md:pl-20')}>
        <div className="mx-auto w-full min-w-0 ">
          <Outlet />
        </div>
      </main>

      {/* Fixed bottom navigation (mobile/tablet only) */}
      <MobileNav />
    </div>
  )
}
