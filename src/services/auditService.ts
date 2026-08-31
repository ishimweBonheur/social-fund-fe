import { apiClient } from '@/services/api'
interface AuditDto {
  ID: string
  UserID?: string
  Action: string
  EntityType: string
  EntityID: string
  OldData?: unknown
  NewData?: unknown
  IPAddress?: string
  UserAgent?: string
  CreatedAt: string
  ip_address?: string
  user_agent?: string
  created_at?: string
  ipAddress?: string
  userAgent?: string
  createdAt?: string
}
export interface AuditRecord {
  id: string
  userId?: string
  action: string
  entityType: string
  entityId: string
  oldData?: unknown
  newData?: unknown
  ipAddress?: string
  userAgent?: string
  createdAt: string
}
export async function listAuditLogs(
  params: {
    userId?: string
    action?: string
    entityType?: string
    entityId?: string
    dateFrom?: string
    dateTo?: string
  } = {},
) {
  const { data } = await apiClient.get<{ data: AuditDto[] }>('/admin/audit-logs/', {
    params: {
      user_id: params.userId,
      action: params.action,
      entity_type: params.entityType,
      entity_id: params.entityId,
      date_from: params.dateFrom,
      date_to: params.dateTo,
      limit: 100,
    },
  })
  return data.data.map((value) => ({
    id: value.ID,
    userId: value.UserID,
    action: value.Action,
    entityType: value.EntityType,
    entityId: value.EntityID,
    oldData: value.OldData,
    newData: value.NewData,
    ipAddress: value.IPAddress ?? value.ip_address ?? value.ipAddress,
    userAgent: value.UserAgent ?? value.user_agent ?? value.userAgent,
    createdAt: value.CreatedAt ?? value.created_at ?? value.createdAt ?? '',
  }))
}
