import { useState } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  Pie,
  PieChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { engagementData, paymentGoalData } from '@/data/mock-data'
import { cn } from '@/lib/utils'

const pieData = [
  { name: 'Payments', value: 45, color: '#0F9D58' },
  { name: 'Transfers', value: 25, color: '#16A34A' },
  { name: 'Deposits', value: 20, color: '#86EFAC' },
  { name: 'Fees', value: 10, color: '#D1FAE5' },
]

export function AnalyticsPage() {
  const [period, setPeriod] = useState<'monthly' | 'annually'>('annually')

  return (
    <div>
      <PageHeader
        title="Analytics"
        description="Deep insights into your financial performance"
        action={
          <div className="flex rounded-full bg-muted p-1">
            {(['monthly', 'annually'] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPeriod(p)}
                className={cn(
                  'rounded-full px-3 py-1 text-xs font-medium capitalize transition-all',
                  period === p ? 'bg-[#0F9D58] text-white' : 'text-muted-foreground'
                )}
              >
                {p}
              </button>
            ))}
          </div>
        }
      />

      <div className="grid gap-3 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>Balance growth over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={paymentGoalData}>
                  <defs>
                    <linearGradient id="analyticsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0F9D58" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#0F9D58" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
                  <Tooltip />
                  <Area type="monotone" dataKey="value" stroke="#0F9D58" fill="url(#analyticsGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
            <CardDescription>Transaction distribution by type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" paddingAngle={4}>
                    {pieData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 flex flex-wrap justify-center gap-4">
              {pieData.map((d) => (
                <div key={d.name} className="flex items-center gap-2 text-xs">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                  {d.name} ({d.value}%)
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Engagement Metrics</CardTitle>
            <CardDescription>Monthly engagement comparison</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={engagementData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#0F9D58" strokeWidth={2.5} dot={{ fill: '#0F9D58', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
