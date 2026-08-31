import {
  AtSign,
  Bell,
  ChevronRight,
  Phone,
  ReceiptText,
  ShieldCheck,
  UserRound,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import { PageHeader } from '@/components/shared/PageHeader'
import StatusBadge from '@/components/shared/StatusBadge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useApp } from '@/context/AppContext'
import { cn, formatPersonName, humanizeValue } from '@/lib/utils'

type ProfileFormProps = {
  admin?: boolean
}

const initialsFor = (name?: string) => {
  const initials = name
    ?.trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()

  return initials || 'SF'
}

export default function ProfileForm({ admin = false }: ProfileFormProps) {
  const { currentUser } = useApp()
  const name = formatPersonName(currentUser?.fullName || 'Social Fund Member')
  const email = currentUser?.email || 'Not provided'
  const phone = currentUser?.phone || 'Not provided'
  const role = humanizeValue(currentUser?.role || (admin ? 'ADMIN' : 'MEMBER'))
  const status = currentUser?.status || 'ACTIVE'

  const quickLinks = admin
    ? [
        { icon: Bell, label: 'Notification preferences', to: '/admin/notifications' },
        { icon: ReceiptText, label: 'Review audit activity', to: '/admin/audit-logs' },
      ]
    : [
        { icon: Bell, label: 'Notification preferences', to: '/member/notifications' },
        { icon: ReceiptText, label: 'View transaction history', to: '/member/transactions' },
      ]

  return (
    <div className="space-y-6">
      <PageHeader
        title={admin ? 'Settings' : 'Profile'}
        description={
          admin
            ? 'Manage your administrator account and preferences.'
            : 'Your personal details, account access and preferences.'
        }
      />

      <Card className="relative overflow-hidden shadow-card">
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-[#547792]/20 via-[#94B4C1]/15 to-transparent" />
        <CardContent className="relative flex flex-col gap-5 p-6 sm:flex-row sm:items-end sm:justify-between sm:p-8">
          <div className="flex min-w-0 items-center gap-4">
            <Avatar className="size-20 border-4 border-background shadow-sm">
              <AvatarFallback className="bg-primary text-xl font-semibold text-primary-foreground">
                {initialsFor(name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 pt-5">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <h2 className="truncate text-2xl font-semibold tracking-tight text-foreground">
                  {name}
                </h2>
                <StatusBadge status={status} />
              </div>
              <p className="truncate text-sm text-muted-foreground">{email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-muted/70 px-3 py-2 text-sm text-muted-foreground">
            <ShieldCheck className="size-4 text-primary" />
            <span>{role} account</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,.65fr)]">
        <Card className="shadow-card">
          <CardHeader className="border-b border-border/70 pb-5">
            <CardTitle>Personal information</CardTitle>
            <p className="text-sm text-muted-foreground">
              Contact details associated with your Social Fund account.
            </p>
          </CardHeader>
          <CardContent className="grid gap-3 p-5 sm:grid-cols-2">
            <InfoItem
              icon={UserRound}
              label="Full name"
              value={name}
              className="sm:col-span-2"
            />
            <InfoItem
              icon={AtSign}
              label="Email address"
              value={email}
            />
            <InfoItem
              icon={Phone}
              label="Phone number"
              value={phone}
            />
          </CardContent>
        </Card>

        <div className="space-y-5">
          <Card className="shadow-card">
            <CardHeader className="border-b border-border/70 pb-4">
              <CardTitle>Account access</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-5">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-muted-foreground">Access level</span>
                <span className="text-sm font-medium text-foreground">{role}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-muted-foreground">Account status</span>
                <StatusBadge status={status} />
              </div>
              <div className="rounded-lg bg-muted/60 p-3 text-xs leading-relaxed text-muted-foreground">
                Your account information is managed securely by Social Fund administration.
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle>Preferences & activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 px-3 pb-3">
              {quickLinks.map(({ icon: Icon, label, to }) => (
                <Button
                  key={to}
                  variant="ghost"
                  className="h-11 w-full justify-start gap-3 px-3 text-sm font-medium"
                  asChild
                >
                  <Link to={to}>
                    <Icon className="size-4 text-primary" />
                    <span className="flex-1 text-left">{label}</span>
                    <ChevronRight className="size-4 text-muted-foreground" />
                  </Link>
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

type InfoItemProps = {
  icon: typeof UserRound
  label: string
  value: string
  className?: string
}

function InfoItem({ icon: Icon, label, value, className }: InfoItemProps) {
  return (
    <div className={cn('flex min-w-0 items-center gap-3 rounded-lg bg-muted/55 p-4', className)}>
      <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-background text-primary shadow-sm ring-1 ring-border/70">
        <Icon className="size-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="mt-0.5 truncate text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  )
}
