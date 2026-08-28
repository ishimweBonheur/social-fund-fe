import DataPage from '@/pages/shared/DataPage'
import { getAuditLogs } from '@/services/fundService'

export default function AuditLogsPage() {
  return <DataPage title="Audit Logs" description="Trace important administrative and account activity" columns={['Date & Time', 'Administrator', 'Action', 'Resource', 'IP Address']} loader={getAuditLogs} />
}
