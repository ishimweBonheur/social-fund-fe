import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useApp } from '@/context/AppContext'

export default function NotificationsContent() {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useApp()
  return (
    <div>
      <PageHeader
        title="Notifications"
        description="Fund activity, reminders, and account updates"
        action={<Button variant="outline" className="rounded-full" onClick={markAllNotificationsRead}>Mark all read</Button>}
      />
      <Card>
        <CardContent className="divide-y p-0">
          {notifications.map((notification) => (
            <button key={notification.id} type="button" onClick={() => markNotificationRead(notification.id)} className="block w-full p-4 text-left hover:bg-muted">
              <div className="flex justify-between gap-4">
                <p className="text-sm font-semibold">{notification.title}</p>
                <span className="text-xs text-muted-foreground">{notification.time}</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{notification.message}</p>
            </button>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
