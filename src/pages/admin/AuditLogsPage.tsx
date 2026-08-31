import { humanizeValue } from '@/lib/utils'
import DataPage from '@/pages/shared/DataPage'
import { listAuditLogs } from '@/services/auditService'

const uuidPattern = /\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/gi
const emptyValue = '—'
const hiddenKey = /(^id$|Id$|_id$|uuid)/i

const parseAuditValue = (value: unknown): unknown => {
  if (typeof value !== 'string') return value
  const cleaned = value.replace(uuidPattern, 'Hidden')

  try {
    return JSON.parse(cleaned)
  } catch {
    return cleaned
  }
}

const formatFieldValue = (key: string, value: unknown) => {
  if (value === undefined || value === null || value === '') return emptyValue

  if (/amount|balance|fee/i.test(key)) {
    const amount = Number(value)
    if (Number.isFinite(amount)) {
      return `RWF ${new Intl.NumberFormat('en-RW', { maximumFractionDigits: 2 }).format(amount)}`
    }
  }

  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (typeof value === 'string') return humanizeValue(value.replace(uuidPattern, 'Hidden'))
  if (Array.isArray(value)) return value.map((item) => String(item)).join(', ')
  if (typeof value === 'object') return 'Details updated'
  return String(value)
}

const formatAuditData = (rawValue: unknown) => {
  const value = parseAuditValue(rawValue)
  if (value === undefined || value === null || value === '') return emptyValue
  if (typeof value !== 'object' || Array.isArray(value)) return formatFieldValue('', value)

  const fields = Object.entries(value as Record<string, unknown>)
    .filter(([key]) => !hiddenKey.test(key))
    .map(
      ([key, fieldValue]) =>
        `${humanizeValue(key.replace(/([a-z])([A-Z])/g, '$1_$2').toUpperCase())}: ${formatFieldValue(key, fieldValue)}`,
    )

  return fields.length ? fields.join(' · ') : emptyValue
}

const getAuditLogs = async () =>
  (await listAuditLogs()).map((item) => [
    new Date(item.createdAt).toLocaleString(),
    item.action,
    item.entityType,
    formatAuditData(item.oldData),
    formatAuditData(item.newData),
    item.ipAddress ?? emptyValue,
    item.userAgent ?? emptyValue,
  ])

export default function AuditLogsPage() {
  return (
    <DataPage
      title="Audit Logs"
      description="Trace immutable administrative and account activity"
      columns={[
        'Date & Time',
        'Action',
        'Entity Type',
        'Previous Data',
        'New Data',
        'IP Address',
        'User Agent',
      ]}
      loader={getAuditLogs}
    />
  )
}
