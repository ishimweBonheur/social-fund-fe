import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { ChevronDown, Search } from 'lucide-react'
import { FinmLogo } from '@/components/shared/FinmLogo'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { avatars } from '@/data/avatars'
import { USER } from '@/lib/brand'
import { NotificationsPanel } from './NotificationsPanel'
import { SearchDialog } from './SearchDialog'
import { cn } from '@/lib/utils'

const navLinks = [
  { label: 'Dashboard', to: '/' },
  { label: 'Reports', to: '/reports' },
  { label: 'Documents', to: '/documents' },
  { label: 'History', to: '/history' },
  { label: 'Contacts', to: '/contacts' },
] as const

export function Header() {
  const navigate = useNavigate()
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <>
      <header className="w-full">
        <div className="flex h-10 w-full min-w-0 items-center justify-between gap-2 rounded-2xl bg-card px-2 shadow-sm sm:h-11 sm:px-4">
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-4 lg:gap-6">
            <FinmLogo />
            <nav className="hidden min-w-0 items-center gap-0.5 overflow-x-auto scrollbar-hide lg:flex">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) =>
                    cn(
                      'shrink-0 rounded-md px-2.5 py-1.5 text-xs font-medium whitespace-nowrap transition-colors sm:px-3',
                      isActive
                        ? 'bg-muted text-foreground'
                        : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                    )
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="flex shrink-0 items-center gap-0.5">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full text-muted-foreground"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="h-4 w-4" />
            </Button>
            <NotificationsPanel />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="ml-0.5 flex items-center gap-1.5 rounded-full p-0.5 transition-colors hover:bg-muted"
                >
                  <Avatar className="h-7 w-7 sm:h-8 sm:w-8">
                    <AvatarImage src={avatars.user} alt={USER.name} />
                    <AvatarFallback className="text-[10px]">{USER.initials}</AvatarFallback>
                  </Avatar>
                  <ChevronDown className="hidden h-3.5 w-3.5 text-muted-foreground sm:block" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem onClick={() => navigate('/settings')}>Profile</DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/settings')}>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/logout')}>Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  )
}
