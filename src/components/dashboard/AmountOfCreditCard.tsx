import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function AmountOfCreditCard() {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
      <Card>
        <CardHeader className="pb-1">
          <CardTitle>Amount of credit</CardTitle>
          <CardDescription>Total refund amount with fee</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between pt-0">
          <p className="text-lg font-bold text-foreground">$8,945.89</p>
          <Badge variant="success" className="bg-[#0F9D58]/10 text-[#0F9D58] px-2 py-0.5 text-[10px]">
            +12.8%
          </Badge>
        </CardContent>
      </Card>
    </motion.div>
  )
}
