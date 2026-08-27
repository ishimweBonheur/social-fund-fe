import { motion } from 'framer-motion'

interface PageHeaderProps {
  title: string
  description?: string
  action?: React.ReactNode
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-4 flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="min-w-0">
        <h1 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">{title}</h1>
        {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </motion.div>
  )
}
