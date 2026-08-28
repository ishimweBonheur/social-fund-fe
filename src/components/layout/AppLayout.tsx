import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { MobileNav } from './MobileNav'
import { Sidebar } from './Sidebar'

export function AppLayout() {
  return (
    <div className="min-h-screen overflow-x-clip bg-background">
      {/* Fixed desktop sidebar rail (shown on md and up) */}
      <div
        className="fixed bottom-3 left-2 z-40 hidden w-14 overflow-visible sm:left-3 sm:w-16 md:block"
        style={{ top: '3.5rem' }}
      >
        <Sidebar />
      </div>

      {/* Fixed top navigation bar */}
      <div
        className="fixed inset-x-0 top-0 z-50 bg-background/95 backdrop-blur-md md:left-20"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="px-2 py-2 sm:px-3 sm:py-2.5">
          <Header />
        </div>
      </div>

      {/* Main content: padded so the fixed bars never cover it */}
      <main className="px-2 pb-[calc(4.75rem+env(safe-area-inset-bottom))] pt-[calc(4.5rem+env(safe-area-inset-top))] sm:px-3 sm:pt-[calc(4.75rem+env(safe-area-inset-top))] md:pb-4 md:pl-20 md:pr-3 md:pt-[calc(4.5rem+env(safe-area-inset-top))]">
        <div className="mx-auto w-full min-w-0 ">
          <Outlet />
        </div>
      </main>

      {/* Fixed bottom navigation (mobile/tablet only) */}
      <MobileNav />
    </div>
  )
}