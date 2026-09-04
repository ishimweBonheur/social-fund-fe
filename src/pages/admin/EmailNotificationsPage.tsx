import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import DetailDialog from '@/components/shared/DetailDialog'
import EmptyState from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useRemoteData } from '@/hooks/useRemoteData'
import { listNotificationDeliveries, retryNotification } from '@/services/notificationService'
import type { Notification } from '@/types/app'

const dateTime = (value?: string) => (value ? new Date(value).toLocaleString() : '—')

export default function EmailNotificationsPage() {
  const remote = useRemoteData(useCallback(() => listNotificationDeliveries(), []))
  const [selected, setSelected] = useState<Notification>()
  const deliveries = remote.data ?? []
  const retry = async (item: Notification) => {
    try {
      await retryNotification(item.id)
      toast.success('Email queued for retry.')
      remote.reload()
    } catch {
      toast.error('Unable to retry this email.')
    }
  }
  return (
    <div className="w-full space-y-5">
      <PageHeader
        title="Email Notifications"
        description="Track queued, sent, and failed emails"
        action={
          <Button
            variant="outline"
            className="rounded-full"
            disabled={remote.isLoading}
            onClick={remote.reload}
          >
            Refresh
          </Button>
        }
      />
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {deliveries.length === 0 && !remote.isLoading ? (
            <EmptyState
              title="No email records"
              description="Email delivery attempts will appear here."
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Recipient</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Attempts</TableHead>
                    <TableHead>Sent at</TableHead>
                    <TableHead>Last error</TableHead>
                    <TableHead>Next retry at</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deliveries.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <p className="font-medium">{item.recipient}</p>
                        <p className="max-w-64 truncate text-xs text-muted-foreground">
                          {item.title}
                        </p>
                      </TableCell>
                      <TableCell>{item.deliveryStatus ?? 'PENDING'}</TableCell>
                      <TableCell>{item.attempts}</TableCell>
                      <TableCell>{dateTime(item.sentAt)}</TableCell>
                      <TableCell className="max-w-64 truncate">{item.lastError || '—'}</TableCell>
                      <TableCell>{dateTime(item.nextRetryAt)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelected(item)}
                          >
                            View
                          </Button>
                          {item.deliveryStatus === 'FAILED' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => void retry(item)}
                            >
                              Retry
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      <DetailDialog
        open={Boolean(selected)}
        onOpenChange={(open) => !open && setSelected(undefined)}
        title={selected?.title ?? 'Email details'}
        description={selected?.recipient}
        items={
          selected
            ? [
                { label: 'Message', value: selected.message },
                { label: 'Status', value: selected.deliveryStatus ?? 'PENDING', status: true },
                { label: 'Attempts', value: String(selected.attempts) },
                { label: 'Sent at', value: dateTime(selected.sentAt) },
                { label: 'Last error', value: selected.lastError || '—' },
                { label: 'Next retry', value: dateTime(selected.nextRetryAt) },
              ]
            : []
        }
      />
    </div>
  )
}
