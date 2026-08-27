import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

export function WeeklyRevenueCard() {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.05 }}>
      <Card>
        <CardContent className="flex items-center justify-between p-3.5">
          <div>
            <p className="text-xs text-muted-foreground">Weekly Revenue</p>
            <p className="mt-0.5 text-base font-bold text-foreground">+3,945 USD</p>
          </div>
          <Badge variant="success" className="bg-[#0F9D58]/10 text-[#0F9D58] px-2 py-0.5 text-[10px]">
            +12.8%
          </Badge>
        </CardContent>
      </Card>
    </motion.div>
  )
}
