import type { ReactNode } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/dashboardChart'
import { cn } from '@/lib/utils'

interface TooltipPayload { name?: string; value?: number | string; color?: string }
export function DashboardTooltip({ active, label, payload, currency = false }: { active?: boolean; label?: string; payload?: TooltipPayload[]; currency?: boolean }) {
  if (!active || !payload?.length) return null
  return <div className="rounded-xl border bg-card/95 px-3 py-2 text-xs shadow-card backdrop-blur"><p className="mb-1 font-semibold">{label}</p>{payload.map((item) => <p key={item.name} className="flex min-w-36 items-center justify-between gap-4"><span className="text-muted-foreground">{item.name}</span><strong style={{ color: item.color }}>{currency ? formatCurrency(Number(item.value)) : Number(item.value).toLocaleString()}</strong></p>)}</div>
}

export function DashboardChartCard({ title, description, children, hero = false, empty = false, emptyMessage }: { title: string; description: string; children: ReactNode; hero?: boolean; empty?: boolean; emptyMessage: string }) {
  return <Card className="min-w-0 shadow-card"><CardHeader><CardTitle>{title}</CardTitle><CardDescription>{description}</CardDescription></CardHeader><CardContent className={cn(hero ? 'h-80' : 'h-64', 'min-w-0 pt-3')}>{empty ? <div className="grid h-full place-items-center rounded-xl bg-muted/40 px-6 text-center text-sm text-muted-foreground">{emptyMessage}</div> : children}</CardContent></Card>
}

export function DashboardLoading() {
  return <div className="space-y-3"><div className="h-14 animate-pulse rounded-2xl bg-muted" /><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 8 }, (_, index) => <div key={index} className="h-28 animate-pulse rounded-2xl bg-muted" />)}</div><div className="h-80 animate-pulse rounded-2xl bg-muted" /><div className="grid gap-3 lg:grid-cols-2"><div className="h-64 animate-pulse rounded-2xl bg-muted" /><div className="h-64 animate-pulse rounded-2xl bg-muted" /></div></div>
}
