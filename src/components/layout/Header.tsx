import { ChevronDown } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { FinmLogo } from '@/components/shared/FinmLogo'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { dashboardFor } from '@/config/navigation'
import { useApp } from '@/context/AppContext'
import type { UserRole } from '@/types/app'
import { NotificationsPanel } from './NotificationsPanel'

export function Header() {
  const { currentUser, switchRole, logout } = useApp(); const navigate = useNavigate()
  if (!currentUser) return null
  const chooseRole = (role: UserRole) => { switchRole(role); navigate(dashboardFor(role)) }
  return <header className="flex h-10 items-center justify-between rounded-full border border-border bg-card px-3 shadow-soft">
    <FinmLogo className="md:hidden" />
    <div className="hidden md:block"><p className="text-xs font-semibold text-foreground">Social Fund Management</p><p className="text-[10px] text-muted-foreground">{currentUser.role === 'ADMIN' ? 'Administration portal' : 'Member portal'}</p></div>
    <div className="flex items-center gap-1"><NotificationsPanel /><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 gap-2 rounded-full px-1.5"><Avatar className="h-7 w-7"><AvatarFallback className="bg-accent text-[10px] text-primary">BI</AvatarFallback></Avatar><span className="hidden text-xs sm:inline">{currentUser.fullName}</span><ChevronDown className="h-3 w-3" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onClick={() => chooseRole('ADMIN')}>Use Admin role</DropdownMenuItem><DropdownMenuItem onClick={() => chooseRole('MEMBER')}>Use Member role</DropdownMenuItem><DropdownMenuItem onClick={() => { logout(); navigate('/login') }}>Sign out</DropdownMenuItem></DropdownMenuContent></DropdownMenu></div>
  </header>
}
