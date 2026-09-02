import { Bell, ChevronDown, LoaderCircle, LogOut, Search, Settings, UserRound, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
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
import { navigation } from '@/config/navigation'
import { listMembers } from '@/services/memberService'
import type { Member } from '@/types/app'
import { NotificationsPanel } from './NotificationsPanel'

export function Header() {
  const { currentUser, logout } = useApp()
  const navigate = useNavigate()
  const searchRef = useRef<HTMLInputElement>(null)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [memberResults, setMemberResults] = useState<Member[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const role = currentUser?.role ?? 'MEMBER'
  const query = searchQuery.trim().toLowerCase()
  const pageResults = useMemo(
    () => navigation[role].filter((item) => item.label.toLowerCase().includes(query)),
    [role, query],
  )
  useEffect(() => {
    const focusSearch = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setIsSearchOpen(true)
        requestAnimationFrame(() => searchRef.current?.focus())
      }
    }
    window.addEventListener('keydown', focusSearch)
    return () => window.removeEventListener('keydown', focusSearch)
  }, [])

  if (!currentUser) return null

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query) return
    setShowResults(true)
    if (currentUser.role === 'ADMIN') {
      setIsSearching(true)
      try {
        const result = await listMembers({ search: searchQuery.trim(), page: 1, pageSize: 6 })
        setMemberResults(result.members)
      } catch {
        setMemberResults([])
      } finally {
        setIsSearching(false)
      }
    } else if (pageResults.length === 1) {
      navigate(pageResults[0].to)
      setShowResults(false)
      setIsSearchOpen(false)
    }
  }

  const searchResults = showResults && query && (
    <div className="absolute left-0 right-0 top-[calc(100%+.5rem)] z-50 max-h-96 overflow-auto rounded-xl bg-card p-2 shadow-card">
      {pageResults.length > 0 && (
        <div className="mb-1">
          <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Pages</p>
          {pageResults.map(({ to, label, icon: Icon }) => (
            <button
              key={to}
              type="button"
              onClick={() => {
                navigate(to)
                setShowResults(false)
                setIsSearchOpen(false)
              }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm hover:bg-accent"
            >
              <Icon className="h-4 w-4 text-primary" /> {label}
            </button>
          ))}
        </div>
      )}
      {currentUser.role === 'ADMIN' && (
        <div>
          <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Members</p>
          {isSearching ? (
            <div className="flex items-center gap-2 px-3 py-3 text-sm text-muted-foreground"><LoaderCircle className="h-4 w-4 animate-spin" /> Searching…</div>
          ) : memberResults.length ? (
            memberResults.map((member) => (
              <button
                key={member.id}
                type="button"
                onClick={() => {
                  navigate('/admin/members', { state: { member } })
                  setShowResults(false)
                  setIsSearchOpen(false)
                }}
                className="block w-full rounded-lg px-3 py-2 text-left hover:bg-accent"
              >
                <span className="block text-sm font-medium">{member.fullName}</span>
                <span className="block text-xs text-muted-foreground">{member.email}</span>
              </button>
            ))
          ) : (
            <p className="px-3 py-2 text-xs text-muted-foreground">Press Enter to search members.</p>
          )}
        </div>
      )}
      {!isSearching && pageResults.length === 0 && currentUser.role !== 'ADMIN' && (
        <p className="px-3 py-3 text-sm text-muted-foreground">No matching destination.</p>
      )}
    </div>
  )

  return (
    <header className="relative flex h-14 w-full min-w-0 items-center justify-between gap-3 px-1 sm:px-3">
      <NavLink
        to={`/${currentUser.role.toLowerCase()}/dashboard`}
        className="flex h-10 min-w-0 shrink items-center overflow-hidden md:hidden"
        title="Social Fund"
      >
        <img
          src="/logo i.png"
          alt="Social Fund"
          className="h-10 w-auto max-w-[8.5rem] object-contain object-left"
        />
      </NavLink>
      <form
        onSubmit={handleSearch}
        className="relative hidden w-full max-w-xl md:block"
      >
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={searchRef}
          type="search"
          placeholder="Search members, payments, reports..."
          className="h-10 bg-card/70 pl-10 pr-16"
          value={searchQuery}
          onFocus={() => setShowResults(true)}
          onChange={(e) => {
            setSearchQuery(e.target.value)
            setMemberResults([])
            setShowResults(true)
          }}
        />
        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
          ⌘ K
        </kbd>
        {searchResults}
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
              ref={searchRef}
              type="search"
              placeholder="Search..."
              className="h-10 w-full bg-background pl-9 pr-4 text-sm shadow-lg"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setMemberResults([])
                setShowResults(true)
              }}
              autoFocus
            />
            {searchResults}
          </form>
        </div>
      )}
    </header>
  )
}
