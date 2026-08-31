import { Bell, ChevronDown, LogOut, Search, Settings, UserRound, X } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { useApp } from '@/context/AppContext'
import { NotificationsPanel } from './NotificationsPanel'
import { ThemeToggle } from '@/components/shared/ThemeToggle'

export function Header() {
  const { currentUser, logout } = useApp()
  const navigate = useNavigate()
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  if (!currentUser) return null

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle search logic here
    console.log('Searching for:', searchQuery)
    setSearchQuery('')
    setIsSearchOpen(false)
  }

  return (
    <header className="relative flex h-14 w-full min-w-0 items-center justify-between gap-3 px-1 sm:px-3">
      <form
        onSubmit={handleSearch}
        className="relative hidden w-full max-w-xl md:block"
      >
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search members, payments, reports..."
          className="h-10 bg-card/70 pl-10 pr-16"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
          ⌘ K
        </kbd>
      </form>
      <div className="flex items-center gap-1 md:gap-2">
        {/* Search toggle - mobile */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full md:hidden"
          onClick={() => setIsSearchOpen(!isSearchOpen)}
        >
          {isSearchOpen ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
        </Button>

        <NotificationsPanel />
        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-10 gap-2 px-1.5 transition-colors hover:bg-accent/50"
            >
              <Avatar className="h-7 w-7 ring-2 ring-primary/10 ring-offset-2 ring-offset-background">
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-[10px] font-medium text-primary">
                  {currentUser.fullName
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </AvatarFallback>
              </Avatar>
              <span className="hidden max-w-[12rem] text-left sm:block">
                <span className="block truncate text-xs font-semibold">{currentUser.fullName}</span>
                <span className="block text-[10px] capitalize text-muted-foreground">
                  {currentUser.role.toLowerCase()}
                </span>
              </span>
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-48 rounded-xl border-border/50 shadow-lg"
          >
            <DropdownMenuItem
              onClick={() => navigate(`/${currentUser.role.toLowerCase()}/notifications`)}
              className="gap-2"
            >
              <Bell className="h-4 w-4" />
              Notifications
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                navigate(currentUser.role === 'ADMIN' ? '/admin/settings' : '/member/profile')
              }
              className="gap-2"
            >
              {currentUser.role === 'ADMIN' ? (
                <Settings className="h-4 w-4" />
              ) : (
                <UserRound className="h-4 w-4" />
              )}
              {currentUser.role === 'ADMIN' ? 'Settings' : 'Profile'}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                logout()
                navigate('/login')
              }}
              className="cursor-pointer gap-2 rounded-lg text-destructive focus:text-destructive"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Mobile search overlay */}
      {isSearchOpen && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 md:hidden">
          <form
            onSubmit={handleSearch}
            className="relative"
          >
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="h-10 w-full bg-background pl-9 pr-4 text-sm shadow-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
          </form>
        </div>
      )}
    </header>
  )
}
