import { apiClient, type ApiEnvelope } from '@/services/api'
import type { Notification, UserRole } from '@/types/app'

interface NotificationDto { id: string; title: string; message: string; created_at?: string; time?: string; read?: boolean; is_read?: boolean; audience?: UserRole | 'ALL' }
export async function listNotifications(): Promise<Notification[]> {
  const { data } = await apiClient.get<ApiEnvelope<NotificationDto[] | { notifications: NotificationDto[] }>>('/notifications')
  const records = Array.isArray(data.data) ? data.data : data.data.notifications
  return records.map((item) => ({ id: item.id, title: item.title, message: item.message, time: item.time || (item.created_at ? new Date(item.created_at).toLocaleString() : ''), read: item.is_read ?? item.read ?? false, audience: item.audience || 'ALL' }))
}
export async function readNotification(id: string) { await apiClient.patch(`/notifications/${id}/read`) }
export async function readAllNotifications() { await apiClient.patch('/notifications/read-all') }
