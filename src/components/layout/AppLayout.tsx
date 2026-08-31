import { Outlet } from 'react-router-dom'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Header } from './Header'
import { MobileNav } from './MobileNav'
import { Sidebar } from './Sidebar'
import { Breadcrumbs } from './Breadcrumbs'

export function AppLayout() {
  const [sidebarExpanded, setSidebarExpanded] = useState(
    () => localStorage.getItem('social-fund-sidebar-expanded') === 'true',
  )
  const updateSidebar = (expanded: boolean) => {
    setSidebarExpanded(expanded)
    localStorage.setItem('social-fund-sidebar-expanded', String(expanded))
  }

  return (
    <div className="min-h-screen overflow-x-clip bg-background">
      <div
        className={cn(
          'fixed bottom-0 left-0 top-0 z-40 hidden overflow-visible bg-[#213448] shadow-[8px_0_28px_-20px_rgba(33,52,72,.8)] transition-[width] duration-200 md:block',
          sidebarExpanded ? 'w-60' : 'w-[4.5rem]',
        )}
      >
        <Sidebar
          expanded={sidebarExpanded}
          onExpandedChange={updateSidebar}
        />
      </div>

      <div
        className={cn(
          'fixed inset-x-0 top-0 z-30 bg-background/90 shadow-[0_8px_28px_-24px_rgba(33,52,72,.65)] backdrop-blur-xl transition-[left] duration-200',
          sidebarExpanded ? 'md:left-60' : 'md:left-[4.5rem]',
        )}
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="px-2 py-2 sm:px-3 sm:py-2.5">
          <Header />
        </div>
      </div>

      {/* Main content: padded so the fixed bars never cover it */}
      <main
        className={cn(
          'px-3 pb-[calc(4.75rem+env(safe-area-inset-bottom))] pt-[calc(5rem+env(safe-area-inset-top))] transition-[padding] duration-200 sm:px-5 md:pb-8 md:pr-6 md:pt-[calc(5.5rem+env(safe-area-inset-top))]',
          sidebarExpanded ? 'md:pl-[16.5rem]' : 'md:pl-[6rem]',
        )}
      >
        <div className="mx-auto w-full min-w-0 max-w-[1600px]">
          <Breadcrumbs />
          <Outlet />
        </div>
      </main>

      {/* Fixed bottom navigation (mobile/tablet only) */}
      <MobileNav />
    </div>
  )
}
