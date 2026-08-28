import { apiClient, type ApiEnvelope } from '@/services/api'
import type { Notification, UserRole } from '@/types/app'

interface NotificationDto { ID: string; Type: string; Subject?: string; Message?: string; CreatedAt?: string; Status: string }
export async function listNotifications(): Promise<Notification[]> {
  const { data } = await apiClient.get<ApiEnvelope<NotificationDto[]>>('/admin/notifications/')
  return data.data.map((item) => ({ id: item.ID, title: item.Subject ?? item.Type, message: item.Message ?? '', time: item.CreatedAt ? new Date(item.CreatedAt).toLocaleString() : '', read: item.Status === 'SENT', audience: 'ADMIN' as UserRole, deliveryStatus: item.Status }))
}
export async function readNotification(id: string) { void id; return Promise.resolve() }
export async function readAllNotifications() { return Promise.resolve() }
export async function retryNotification(id: string) { await apiClient.post(`/admin/notifications/${id}/retry`) }
