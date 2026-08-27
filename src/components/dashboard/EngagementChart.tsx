import { useState } from 'react'
import { motion } from 'framer-motion'
import { Wallet } from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ExpandDialog } from '@/components/shared/ExpandDialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { engagementData } from '@/data/mock-data'
import { cn } from '@/lib/utils'

const ACTIVE_MONTH = 'APR'
const ACTIVE_VALUE = '+17.8%'

function ActiveLabel(props: {
  x?: number | string
  y?: number | string
  width?: number | string
  value?: number | string
  index?: number
}) {
  const { x, y, width, index } = props
  if (index !== 3 || x === undefined || y === undefined || width === undefined) return null
  const cx = Number(x) + Number(width) / 2
  const cy = Number(y) - 8
  return (
    <g>
      <rect x={cx - 30} y={cy - 20} width={60} height={22} rx={11} fill="#0F9D58" />
      <text x={cx} y={cy - 5} textAnchor="middle" fill="#fff" fontSize={11} fontWeight={600}>
        {ACTIVE_VALUE}
      </text>
    </g>
  )
}

export function EngagementChart() {
  const [period, setPeriod] = useState<'monthly' | 'annually'>('annually')

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="h-full"
    >
      <Card className="h-full">
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4 text-muted-foreground" />
            <CardTitle>Engagement Rate</CardTitle>
          </div>
          <div className="flex items-center gap-2">
          <div className="flex rounded-full bg-muted p-1">
            {(['monthly', 'annually'] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPeriod(p)}
                className={cn(
                  'rounded-full px-3 py-1 text-xs font-medium capitalize transition-all duration-200',
                  period === p
                    ? 'bg-[#0F9D58] text-white shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {p}
              </button>
            ))}
          </div>
          <ExpandDialog title="Engagement Rate" description="Full engagement analytics">
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={engagementData} barCategoryGap="18%">
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} tickFormatter={(v: number) => `${v / 1000}k`} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#0F9D58" radius={[8, 8, 8, 8]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ExpandDialog>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="h-[190px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={engagementData}
                barCategoryGap="18%"
                margin={{ top: 22, right: 4, left: -18, bottom: 0 }}
              >
                <defs>
                  <pattern
                    id="barStripe"
                    patternUnits="userSpaceOnUse"
                    width="8"
                    height="8"
                    patternTransform="rotate(45)"
                  >
                    <rect width="8" height="8" fill="#D1FAE5" />
                    <line x1="0" y1="0" x2="0" y2="8" stroke="#A7F3D0" strokeWidth="4" />
                  </pattern>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9CA3AF', fontSize: 11, fontWeight: 500 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9CA3AF', fontSize: 11 }}
                  tickFormatter={(v: number) => `${v / 1000}k`}
                  domain={[0, 5000]}
                  ticks={[0, 1000, 2000, 3000, 4000, 5000]}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(15, 157, 88, 0.06)' }}
                  contentStyle={{
                    borderRadius: 12,
                    border: '1px solid #E5E7EB',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  }}
                />
                <Bar dataKey="value" radius={[6, 6, 6, 6]} maxBarSize={36}>
                  {engagementData.map((entry) => (
                    <Cell
                      key={entry.month}
                      fill={entry.month === ACTIVE_MONTH ? '#0F9D58' : 'url(#barStripe)'}
                    />
                  ))}
                  <LabelList dataKey="value" content={<ActiveLabel />} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
