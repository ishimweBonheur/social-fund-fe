import { Download, FileBarChart } from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { engagementData } from '@/data/mock-data'
import { useApp } from '@/context/AppContext'

const reportSummary = [
  { label: 'Total Revenue', value: '$128,450', change: '+14.2%' },
  { label: 'Net Profit', value: '$42,890', change: '+8.5%' },
  { label: 'Expenses', value: '$85,560', change: '-3.1%' },
  { label: 'Growth Rate', value: '17.8%', change: '+2.4%' },
]

export function ReportsPage() {
  const { dateRange } = useApp()

  return (
    <div>
      <PageHeader
        title="Reports"
        description={`Financial reports for ${dateRange.start} – ${dateRange.end}`}
        action={
          <Button className="rounded-full bg-[#0F9D58] hover:bg-[#0F9D58]/90">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        }
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {reportSummary.map((item) => (
          <Card key={item.label}>
            <CardContent className="p-3.5">
              <p className="text-xs text-muted-foreground">{item.label}</p>
              <p className="mt-0.5 text-lg font-bold">{item.value}</p>
              <p className="mt-1 text-xs font-medium text-[#0F9D58]">{item.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileBarChart className="h-5 w-5 text-primary" />
            <CardTitle>Engagement Overview</CardTitle>
          </div>
          <CardDescription>Monthly engagement metrics across all channels</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={engagementData} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip />
                <Bar dataKey="value" fill="#0F9D58" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
