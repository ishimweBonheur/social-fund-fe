import { useNavigate } from 'react-router-dom'
import { Bell, CheckCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useApp } from '@/context/AppContext'
import { cn } from '@/lib/utils'

const typeColors: Record<string, string> = {
  payment: 'bg-[#0F9D58]/10 text-[#0F9D58]',
  security: 'bg-amber-100 text-amber-700',
  update: 'bg-blue-100 text-blue-700',
  message: 'bg-purple-100 text-purple-700',
}

export function NotificationsPanel() {
  const navigate = useNavigate()
  const { notifications, unreadCount, markNotificationRead, markAllNotificationsRead } = useApp()

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-8 w-8 rounded-full text-muted-foreground">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#0F9D58] px-0.5 text-[9px] font-bold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 p-0">
        <div className="flex items-center justify-between border-b border-border px-3 py-2">
          <div>
            <p className="text-sm font-semibold">Notifications</p>
            <p className="text-xs text-muted-foreground">
              {unreadCount} unread update{unreadCount !== 1 ? 's' : ''}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1 text-xs"
              onClick={markAllNotificationsRead}
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all read
            </Button>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">No notifications</p>
          ) : (
            notifications.map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => {
                  markNotificationRead(n.id)
                  if (n.type === 'message') navigate('/messages')
                  else if (n.type === 'payment') navigate('/transactions')
                  else if (n.type === 'update') navigate('/reports')
                }}
                className={cn(
                  'flex w-full gap-3 border-b border-border/50 px-4 py-3 text-left transition-colors last:border-0 hover:bg-muted/60',
                  !n.read && 'bg-[#0F9D58]/[0.03]'
                )}
              >
                <div
                  className={cn(
                    'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold capitalize',
                    typeColors[n.type]
                  )}
                >
                  {n.type[0].toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className={cn('text-sm', !n.read && 'font-semibold')}>{n.title}</p>
                    {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#0F9D58]" />}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{n.message}</p>
                  <p className="mt-1 text-[10px] text-muted-foreground">{n.time}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
