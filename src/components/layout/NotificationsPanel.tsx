import { Bell, CheckCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useApp } from '@/context/AppContext'

export function NotificationsPanel() {
  const {
    currentUser,
    notifications,
    unreadCount,
    markNotificationRead,
    markAllNotificationsRead,
  } = useApp()
  const navigate = useNavigate()
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-8 w-8 rounded-md"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[9px] text-primary-foreground">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-80 p-0"
      >
        <div className="flex items-center justify-between border-b p-3">
          <div>
            <p className="text-sm font-semibold">Notifications</p>
            <p className="text-xs text-muted-foreground">{unreadCount} unread</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={markAllNotificationsRead}
          >
            <CheckCheck className="h-4 w-4" /> Mark all read
          </Button>
        </div>
        <div className="max-h-80 overflow-auto">
          {notifications.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => {
                markNotificationRead(n.id)
                if (currentUser) navigate(`/${currentUser.role.toLowerCase()}/notifications`)
              }}
              className="block w-full border-b p-3 text-left hover:bg-muted"
            >
              <p className="text-sm font-medium">{n.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{n.message}</p>
              <p className="mt-1 text-[10px] text-muted-foreground">{n.time}</p>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
