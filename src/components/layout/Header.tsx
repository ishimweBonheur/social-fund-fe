import { ChevronDown, Search, X } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { useApp } from '@/context/AppContext'
import { NotificationsPanel } from './NotificationsPanel'

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
    <header className="relative flex h-12 w-full min-w-0 items-center justify-end gap-2 rounded-full border border-border/50 bg-card/90 px-2 shadow-sm backdrop-blur-sm transition-all sm:px-3 md:px-4">
      
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
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 gap-2 rounded-full px-1.5 hover:bg-accent/50 transition-colors">
              <Avatar className="h-7 w-7 ring-2 ring-primary/10 ring-offset-2 ring-offset-background">
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-[10px] font-medium text-primary">
                  {currentUser.fullName.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <span className="hidden max-w-[12rem] truncate text-xs font-medium sm:inline">{currentUser.fullName}</span>
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent align="end" className="w-48 rounded-xl border-border/50 shadow-lg">
            <DropdownMenuItem 
              onClick={() => {
                logout()
                navigate('/login')
              }} 
              className="cursor-pointer rounded-lg text-destructive focus:text-destructive"
            >
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Mobile search overlay */}
      {isSearchOpen && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 md:hidden">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="h-10 w-full rounded-xl border-border/50 bg-background pl-9 pr-4 text-sm shadow-lg"
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
