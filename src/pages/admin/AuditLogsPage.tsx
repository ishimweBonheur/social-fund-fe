import DataPage from '@/pages/shared/DataPage'
import { listAuditLogs } from '@/services/auditService'

const getAuditLogs = async () => (await listAuditLogs()).map((item) => [new Date(item.createdAt).toLocaleString(), item.userId ?? 'System', item.action, item.entityType, item.entityId, item.ipAddress ?? '—'])

export default function AuditLogsPage() {
  return <DataPage title="Audit Logs" description="Trace immutable administrative and account activity" columns={['Date & Time', 'User ID', 'Action', 'Entity Type', 'Entity ID', 'IP Address']} loader={getAuditLogs} />
}
