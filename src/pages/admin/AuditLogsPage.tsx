import { useCallback, useState } from 'react'
import FilterDialog from '@/components/shared/FilterDialog'
import { FundTable } from '@/components/shared/FundTable'
import { PageHeader } from '@/components/shared/PageHeader'
import ServerPagination from '@/components/shared/ServerPagination'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useRemoteData } from '@/hooks/useRemoteData'
import { humanizeValue } from '@/lib/utils'
import { listAuditLogs } from '@/services/auditService'

const emptyValue = '—'
const hiddenKey = /(^id$|Id$|_id$|uuid)/i

const parseData = (value: unknown): unknown => {
  if (typeof value !== 'string') return value
  try {
    return JSON.parse(value)
  } catch {
    return value
  }
}

const formatData = (raw: unknown) => {
  const value = parseData(raw)
  if (!value) return emptyValue
  if (typeof value !== 'object' || Array.isArray(value)) return humanizeValue(String(value))
  const fields = Object.entries(value as Record<string, unknown>).filter(
    ([key]) => !hiddenKey.test(key),
  )
  const selected = fields.find(([key]) => key.toLowerCase() === 'status') ?? fields[0]
  if (!selected) return emptyValue
  return `${humanizeValue(selected[0].toUpperCase())}: ${humanizeValue(String(selected[1]))}`
}

const simplifyUserAgent = (value?: string) => {
  if (!value) return emptyValue
  const browser = /Edg\//i.test(value)
    ? 'Edge'
    : /Firefox\//i.test(value)
      ? 'Firefox'
      : /Chrome\//i.test(value)
        ? 'Chrome'
        : /Safari\//i.test(value)
          ? 'Safari'
          : /Postman/i.test(value)
            ? 'Postman'
            : 'Browser'
  const platform = /Windows/i.test(value)
    ? 'Windows'
    : /Android/i.test(value)
      ? 'Android'
      : /iPhone|iPad|iOS/i.test(value)
        ? 'iOS'
        : /Mac/i.test(value)
          ? 'macOS'
          : /Linux/i.test(value)
            ? 'Linux'
            : ''
  return `${browser}${platform ? ` · ${platform}` : ''}`.slice(0, 20)
}

export default function AuditLogsPage() {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [action, setAction] = useState('ALL')
  const [entityType, setEntityType] = useState('ALL')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const loader = useCallback(
    () =>
      listAuditLogs({
        action: action === 'ALL' ? undefined : action,
        entityType: entityType === 'ALL' ? undefined : entityType,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        page,
        pageSize,
      }),
    [action, entityType, dateFrom, dateTo, page, pageSize],
  )
  const remote = useRemoteData(loader)
  const reset = () => {
    setAction('ALL')
    setEntityType('ALL')
    setDateFrom('')
    setDateTo('')
    setPage(1)
  }
  const rows = (remote.data?.items ?? []).map((item) => [
    new Date(item.createdAt).toLocaleString(),
    item.action,
    item.entityType,
    formatData(item.oldData),
    formatData(item.newData),
    item.ipAddress ?? emptyValue,
    simplifyUserAgent(item.userAgent),
  ])

  return (
    <div className="space-y-5">
      <PageHeader
        title="Audit Logs"
        description="Trace immutable administrative and account activity"
      />
      <FundTable
        columns={[
          'Date & Time',
          'Action',
          'Entity Type',
          'Previous Data',
          'New Data',
          'IP Address',
          'User Agent',
        ]}
        rows={rows}
        title="Audit Logs"
        description={`${remote.data?.total ?? 0} records`}
        toolbar={
          <div className="flex justify-end">
            <FilterDialog
              activeCount={
                [action !== 'ALL', entityType !== 'ALL', Boolean(dateFrom), Boolean(dateTo)].filter(
                  Boolean,
                ).length
              }
              onReset={reset}
              title="Filter audit logs"
            >
              <div>
                <p className="mb-2 text-xs font-semibold">Action</p>
                <Select
                  value={action}
                  onValueChange={(value) => {
                    setAction(value)
                    setPage(1)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All actions</SelectItem>
                    {[
                      'USER_LOGIN',
                      'USER_CREATED',
                      'USER_UPDATED',
                      'USER_ACTIVATED',
                      'USER_SUSPENDED',
                      'PROOF_UPLOADED',
                      'CONTRIBUTION_APPROVED',
                      'CONTRIBUTION_REJECTED',
                      'ASSISTANCE_REQUEST_CREATED',
                      'ASSISTANCE_APPROVED',
                      'ASSISTANCE_PAID',
                    ].map((value) => (
                      <SelectItem
                        key={value}
                        value={value}
                      >
                        {humanizeValue(value)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold">Entity type</p>
                <Select
                  value={entityType}
                  onValueChange={(value) => {
                    setEntityType(value)
                    setPage(1)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All entities</SelectItem>
                    {['USER', 'CONTRIBUTION', 'CONTRIBUTION_PLAN', 'ASSISTANCE_REQUEST'].map(
                      (value) => (
                        <SelectItem
                          key={value}
                          value={value}
                        >
                          {humanizeValue(value)}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold">From date</p>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(event) => {
                    setDateFrom(event.target.value)
                    setPage(1)
                  }}
                />
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold">To date</p>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(event) => {
                    setDateTo(event.target.value)
                    setPage(1)
                  }}
                />
              </div>
            </FilterDialog>
          </div>
        }
        footer={
          <ServerPagination
            page={page}
            pageSize={pageSize}
            total={remote.data?.total ?? 0}
            onPageChange={setPage}
            onPageSizeChange={(value) => {
              setPageSize(value)
              setPage(1)
            }}
          />
        }
      />
    </div>
  )
}
