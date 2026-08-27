import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { DashboardGrid } from '@/components/dashboard/DashboardGrid'
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton'

export function DashboardPage() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800)
    return () => clearTimeout(timer)
  }, [])

  return (
    <AnimatePresence mode="wait">
      {loading ? (
        <motion.div key="sk" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <DashboardSkeleton />
        </motion.div>
      ) : (
        <motion.div key="dash" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <DashboardGrid />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
