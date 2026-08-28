import { apiClient, type ApiEnvelope } from '@/services/api'
import type { Notification, UserRole } from '@/types/app'
import { authStorage } from '@/services/authStorage'

interface NotificationDto { ID: string; Type: string; Subject?: string; Message?: string; CreatedAt?: string; Status: string; ReadAt?: string }
export async function listNotifications(): Promise<Notification[]> {
  const role = authStorage.getUser()?.role ?? 'MEMBER'
  const endpoint = role === 'ADMIN' ? '/admin/notifications/' : '/notifications/'
  const { data } = await apiClient.get<ApiEnvelope<NotificationDto[]>>(endpoint)
  return data.data.map((item) => ({ id: item.ID, title: item.Subject ?? item.Type, message: item.Message ?? '', time: item.CreatedAt ? new Date(item.CreatedAt).toLocaleString() : '', read: Boolean(item.ReadAt), audience: role as UserRole, deliveryStatus: item.Status }))
}
const base = () => authStorage.getUser()?.role === 'ADMIN' ? '/admin/notifications' : '/notifications'
export async function readNotification(id: string) { await apiClient.post(`${base()}/${id}/read`) }
export async function readAllNotifications() { await apiClient.post(`${base()}/read-all`) }
export async function retryNotification(id: string) { await apiClient.post(`/admin/notifications/${id}/retry`) }
export async function submitSupportRequest(input: { category: string; message: string; contributionId?: string }) { await apiClient.post('/notifications/support-requests', { category: input.category, message: input.message, contribution_id: input.contributionId }) }
