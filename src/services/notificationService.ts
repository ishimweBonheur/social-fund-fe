import { apiClient, type ApiEnvelope } from '@/services/api'
import type { Notification, UserRole } from '@/types/app'
import { authStorage } from '@/services/authStorage'

interface NotificationDto {
  ID?: string
  id?: string
  Type?: string
  type?: string
  Subject?: string
  subject?: string
  Message?: string
  message?: string
  CreatedAt?: string
  created_at?: string
  Status?: string
  status?: string
  ReadAt?: string
  read_at?: string
  Attempts?: number
  attempts?: number
  SentAt?: string
  sent_at?: string
  LastError?: string
  last_error?: string
  NextRetryAt?: string
  next_retry_at?: string
  Recipient?: string
  recipient?: string
}
const mapNotification = (item: NotificationDto, role: UserRole): Notification => ({
  id: item.ID ?? item.id ?? '',
  title: item.Subject ?? item.subject ?? item.Type ?? item.type ?? 'Notification',
  message: item.Message ?? item.message ?? '',
  time:
    (item.CreatedAt ?? item.created_at)
      ? new Date(item.CreatedAt ?? item.created_at!).toLocaleString()
      : '',
  read: Boolean(item.ReadAt ?? item.read_at),
  audience: role,
  deliveryStatus: item.Status ?? item.status,
  attempts: item.Attempts ?? item.attempts ?? 0,
  sentAt: item.SentAt ?? item.sent_at,
  lastError: item.LastError ?? item.last_error,
  nextRetryAt: item.NextRetryAt ?? item.next_retry_at,
  recipient: item.Recipient ?? item.recipient ?? '',
})
export async function listNotifications(): Promise<Notification[]> {
  const role = authStorage.getUser()?.role ?? 'MEMBER'
  const endpoint = role === 'ADMIN' ? '/admin/notifications/' : '/notifications/'
  const { data } = await apiClient.get<ApiEnvelope<NotificationDto[]>>(endpoint)
  return data.data.map((item) => mapNotification(item, role as UserRole))
}
export async function listNotificationDeliveries(): Promise<Notification[]> {
  const { data } = await apiClient.get<ApiEnvelope<NotificationDto[]>>('/admin/notifications/', {
    params: { scope: 'all', limit: 100 },
  })
  return data.data.map((item) => mapNotification(item, 'ADMIN'))
}
export function subscribeNotifications(onNotifications: (items: Notification[]) => void) {
  const token = authStorage.getToken()
  const role = authStorage.getUser()?.role
  if (!token || !role) return () => undefined
  let stopped = false
  let socket: WebSocket | undefined
  let retry: number | undefined
  let attempts = 0
  const connect = () => {
    const api = new URL(apiClient.defaults.baseURL || '/api/v1', window.location.origin)
    api.protocol = api.protocol === 'https:' ? 'wss:' : 'ws:'
    api.pathname = '/ws/notifications'
    api.search = new URLSearchParams({ access_token: token }).toString()
    socket = new WebSocket(api)
    socket.onopen = () => {
      attempts = 0
    }
    socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(String(event.data)) as {
          type?: string
          data?: NotificationDto[]
          message?: string
        }
        if (payload.type === 'account_suspended') {
          stopped = true
          authStorage.clear()
          sessionStorage.setItem(
            'social-fund:suspended-message',
            payload.message ||
              'Your account has been suspended. Contact support for help getting back online.',
          )
          window.dispatchEvent(new Event('social-fund:unauthorized'))
          socket?.close()
          return
        }
        if (payload.type === 'notifications' && Array.isArray(payload.data)) {
          onNotifications(payload.data.map((item) => mapNotification(item, role)))
        }
      } catch {
        /* Ignore malformed frames and keep the live connection. */
      }
    }
    socket.onclose = () => {
      if (stopped) return
      attempts += 1
      retry = window.setTimeout(connect, Math.min(30_000, 1_000 * 2 ** Math.min(attempts, 5)))
    }
  }
  connect()
  return () => {
    stopped = true
    if (retry) window.clearTimeout(retry)
    socket?.close()
  }
}
const base = () =>
  authStorage.getUser()?.role === 'ADMIN' ? '/admin/notifications' : '/notifications'
export async function readNotification(id: string) {
  await apiClient.post(`${base()}/${id}/read`)
}
export async function readAllNotifications() {
  await apiClient.post(`${base()}/read-all`)
}
export async function retryNotification(id: string) {
  await apiClient.post(`/admin/notifications/${id}/retry`)
}
export async function submitSupportRequest(input: {
  category: string
  message: string
  contributionId?: string
}) {
  await apiClient.post('/notifications/support-requests', {
    category: input.category,
    message: input.message,
    contribution_id: input.contributionId,
  })
}
