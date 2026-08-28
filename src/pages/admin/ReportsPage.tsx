import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useRemoteData } from '@/hooks/useRemoteData'
import { getReports } from '@/services/fundService'

export default function ReportsPage() {
  const { data, error, isLoading } = useRemoteData(getReports)
  if (isLoading) return <p className="rounded-xl bg-card p-8 text-center text-sm text-muted-foreground">Loading reports…</p>
  if (error || !data) return <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error || 'Report data is unavailable.'}</p>

  return (
    <div>
      <PageHeader 
        title="Reports" 
        description="Fund performance and member contribution insights" 
        action={<Button className="rounded-full">Export Report</Button>} 
      />
      
      <div className="mb-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {data.metrics.map(([label, value]) => (
          <Card key={label}>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="mt-1 text-xl font-bold">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Fund Growth</CardTitle>
          <CardDescription>Total balance over the last six months</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.fundGrowth}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `${value / 1000000}m`} />
                <Tooltip formatter={(value) => `RWF ${Number(value).toLocaleString()}`} />
                <Bar dataKey="value" fill="#0F9D58" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
