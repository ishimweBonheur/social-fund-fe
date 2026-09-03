import { useState } from 'react'
import { toast } from 'sonner'
import DetailDialog from '@/components/shared/DetailDialog'
import EmptyState from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import SupportRequestDialog from '@/components/shared/SupportRequestDialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useApp } from '@/context/AppContext'
import type { Notification } from '@/types/app'

export default function NotificationsContent() {
  const {
    currentUser,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    refreshNotifications,
  } = useApp()
  const [selected, setSelected] = useState<Notification>()
  const [supportOpen, setSupportOpen] = useState(false)

  const markAll = async () => {
    try {
      await markAllNotificationsRead()
      toast.success('All notifications marked as read.')
    } catch {
      toast.error('Unable to mark notifications as read.')
    }
  }

  return (
    <div>
      <PageHeader
        title="Notifications"
        description="Fund activity, reminders, and account updates"
        action={
          currentUser?.role === 'MEMBER' ? (
            <Button
              className="rounded-full"
              onClick={() => setSupportOpen(true)}
            >
              Request Support
            </Button>
          ) : notifications.some((item) => !item.read) ? (
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => void markAll()}
            >
              Mark all read
            </Button>
          ) : undefined
        }
      />
      <Card>
        <CardContent className="divide-y p-0">
          {notifications.length === 0 ? (
            <EmptyState
              title="No notifications"
              description="You are all caught up. New activity will appear here."
            />
          ) : (
            notifications.map((notification) => (
              <button
                key={notification.id}
                type="button"
                onClick={() => {
                  setSelected(notification)
                  markNotificationRead(notification.id)
                }}
                className={`block w-full border-l-4 p-4 text-left transition-colors hover:bg-muted ${notification.read ? 'border-l-transparent bg-background' : 'border-l-primary bg-primary/10'}`}
              >
                <div className="flex justify-between gap-4">
                  <div className="flex items-center gap-2">
                    {!notification.read && (
                      <span
                        className="size-2 shrink-0 rounded-full bg-primary"
                        aria-label="Unread"
                      />
                    )}
                    <p
                      className={notification.read ? 'text-sm font-semibold' : 'text-sm font-bold'}
                    >
                      {notification.title}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">{notification.time}</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{notification.message}</p>
              </button>
            ))
          )}
        </CardContent>
      </Card>
      <DetailDialog
        open={Boolean(selected)}
        onOpenChange={(open) => !open && setSelected(undefined)}
        title={selected?.title ?? 'Notification'}
        description="Notification details"
        items={
          selected
            ? [
                { label: 'Message', value: selected.message },
                { label: 'Time', value: selected.time },
                { label: 'Status', value: selected.read ? 'READ' : 'UNREAD', status: true },
              ]
            : []
        }
      />
      {supportOpen && (
        <SupportRequestDialog
          open={supportOpen}
          onOpenChange={setSupportOpen}
          onSent={refreshNotifications}
        />
      )}
    </div>
  )
}
