import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import DashboardMetrics from '@/components/shared/DashboardMetrics'
import { FundTable } from '@/components/shared/FundTable'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useRemoteData } from '@/hooks/useRemoteData'
import { getAdminDashboard } from '@/services/fundService'

export default function AdminDashboardPage() {
  const { data, error, isLoading } = useRemoteData(getAdminDashboard)
  if (isLoading) return <p className="rounded-xl bg-card p-8 text-center text-sm text-muted-foreground">Loading dashboard…</p>
  if (error || !data) return <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error || 'Dashboard data is unavailable.'}</p>
  return (
    <div className="space-y-3">
      <PageHeader 
        title="Admin Dashboard" 
        description="Social Fund performance and operations overview" 
      />
      
      <DashboardMetrics 
        items={data.metrics}
      />
      
      <div className="grid gap-3 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Monthly Contributions</CardTitle>
            <CardDescription>Fund growth through August 2026</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.fundGrowth}>
                  <defs>
                    <linearGradient id="fund" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopColor="#0F9D58" stopOpacity={0.3} />
                      <stop offset="1" stopColor="#0F9D58" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `${value / 1000000}m`} />
                  <Tooltip formatter={(value) => `RWF ${Number(value).toLocaleString()}`} />
                  <Area 
                    dataKey="value" 
                    stroke="#0F9D58" 
                    fill="url(#fund)" 
                    strokeWidth={2} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Fund Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.fundHealth.map(([label, value]) => (
              <div 
                key={label} 
                className="flex justify-between border-b pb-3 text-sm last:border-0"
              >
                <span className="text-muted-foreground">{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      
      <div>
        <h2 className="mb-2 text-sm font-semibold">Recent Contributions</h2>
        <FundTable 
          columns={['Member', 'Expected', 'Paid', 'Due Date', 'Payment Date', 'Method', 'Reference', 'Status']} 
          rows={data.recentContributions}
        />
      </div>
    </div>
  )
}
