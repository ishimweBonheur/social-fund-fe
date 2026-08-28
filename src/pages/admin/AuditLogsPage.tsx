import DataPage from '@/pages/shared/DataPage'
import { listAuditLogs } from '@/services/auditService'

const json = (value: unknown) => value === undefined || value === null ? '—' : typeof value === 'string' ? value : JSON.stringify(value)
const getAuditLogs = async () => (await listAuditLogs()).map((item) => [new Date(item.createdAt).toLocaleString(), item.userId ?? 'System', item.action, item.entityType, item.entityId, json(item.oldData), json(item.newData), item.ipAddress ?? '—', item.userAgent ?? '—'])

export default function AuditLogsPage() {
  return <DataPage title="Audit Logs" description="Trace immutable administrative and account activity" columns={['Date & Time', 'User ID', 'Action', 'Entity Type', 'Entity ID', 'Previous Data', 'New Data', 'IP Address', 'User Agent']} loader={getAuditLogs} />
}
