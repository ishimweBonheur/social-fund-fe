import { motion } from 'framer-motion'
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ExpandDialog } from '@/components/shared/ExpandDialog'
import { TransferDialog } from '@/components/shared/TransferDialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { paymentGoalData } from '@/data/mock-data'
import { useApp } from '@/context/AppContext'

function ChartContent({ height = 100 }: { height?: number }) {
  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={paymentGoalData} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0F9D58" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#0F9D58" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <XAxis dataKey="label" hide />
          <YAxis hide domain={['dataMin - 2000', 'dataMax + 1000']} />
          <Tooltip
            contentStyle={{ borderRadius: 12, border: '1px solid #E5E7EB', fontSize: 12 }}
            formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Balance']}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#0F9D58"
            strokeWidth={2.5}
            fill="url(#areaGradient)"
            dot={false}
            activeDot={{ r: 4, fill: '#0F9D58', stroke: '#fff', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export function PaymentGoalChart() {
  const { wallets } = useApp()
  const balance = wallets[0]?.balance ?? 32678.9

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="h-full"
    >
      <Card className="h-full">
        <CardHeader className="flex-row items-start justify-between space-y-0 pb-2">
          <div>
            <CardTitle>Payment Goal</CardTitle>
            <CardDescription>Total amount goal</CardDescription>
          </div>
          <ExpandDialog title="Payment Goal" description="Total amount goal — expanded view">
            <div className="mb-4">
              <p className="text-sm text-muted-foreground">Total Balance</p>
              <p className="text-3xl font-bold">
                ${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <ChartContent height={280} />
          </ExpandDialog>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="mb-1">
            <p className="text-xs text-muted-foreground">Total Balance</p>
            <p className="text-lg font-bold tracking-tight text-foreground">
              ${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <ChartContent />
          <div className="mt-3 flex gap-2">
            <TransferDialog mode="send" />
            <TransferDialog mode="receive" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
