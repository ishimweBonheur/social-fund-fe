import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { MobileNav } from './MobileNav'
import { Sidebar } from './Sidebar'

export function AppLayout() {
  return (
    <div className="min-h-screen bg-background">
      <div
        className="fixed bottom-3 left-2 z-50 hidden w-14 overflow-visible sm:left-3 sm:w-16 md:block"
        style={{ top: '3.5rem' }}
      >
        <Sidebar />
      </div>

      <div className="fixed left-0 right-0 top-0 z-40 bg-background/95 backdrop-blur-md md:left-20">
        <div className="px-2 py-2 sm:px-3 sm:py-2.5">
          <Header />
        </div>
      </div>

      <main className="px-2 pb-20 pt-[3.75rem] sm:px-3 sm:pt-14 md:pl-20 md:pr-3 md:pb-4">
        <div className="mx-auto w-full min-w-0 max-w-[1320px]">
          <Outlet />
        </div>
      </main>

      <MobileNav />
    </div>
  )
}
