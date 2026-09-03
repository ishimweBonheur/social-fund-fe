import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useApp } from '@/context/AppContext'
import { retryNotification } from '@/services/notificationService'
import SupportRequestDialog from '@/components/shared/SupportRequestDialog'

export default function NotificationsContent() {
  const {
    currentUser,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    refreshNotifications,
  } = useApp()
  const [selected, setSelected] = useState<(typeof notifications)[number]>()
  const [supportOpen, setSupportOpen] = useState(false)
  const markAll = () => {
    markAllNotificationsRead()
    toast.success('All notifications marked as read.')
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
          ) : notifications.length ? (
            <Button
              variant="outline"
              className="rounded-full"
              onClick={markAll}
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
              description="You are all caught up. New fund activity will appear here."
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
                className={`relative block w-full border-l-4 p-4 text-left transition-colors hover:bg-muted ${
                  notification.read
                    ? 'border-l-transparent bg-background'
                    : 'border-l-primary bg-primary/10'
                }`}
              >
                <div className="flex justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-2">
                    {!notification.read && (
                      <span
                        className="size-2 shrink-0 rounded-full bg-primary"
                        aria-label="Unread"
                      />
                    )}
                    <p className={`text-sm ${notification.read ? 'font-semibold' : 'font-bold'}`}>
                      {notification.title}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">{notification.time}</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{notification.message}</p>
                {notification.deliveryStatus === 'FAILED' && (
                  <Button
                    className="mt-2"
                    size="sm"
                    variant="outline"
                    onClick={(event) => {
                      event.stopPropagation()
                      void retryNotification(notification.id)
                        .then(() => toast.success('Notification queued for retry.'))
                        .catch(() => toast.error('Unable to retry notification.'))
                    }}
                  >
                    Retry Delivery
                  </Button>
                )}
              </button>
            ))
          )}
        </CardContent>
      </Card>
      <DetailDialog
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) setSelected(undefined)
        }}
        title={selected?.title ?? 'Notification'}
        description="Notification details"
        items={
          selected
            ? [
                { label: 'Message', value: selected.message },
                { label: 'Time', value: selected.time },
                { label: 'Status', value: selected.deliveryStatus ?? 'READ', status: true },
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
import { useState } from 'react'
import { toast } from 'sonner'
import DetailDialog from '@/components/shared/DetailDialog'
import EmptyState from '@/components/shared/EmptyState'
