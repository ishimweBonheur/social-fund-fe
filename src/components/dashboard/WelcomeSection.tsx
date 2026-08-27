import { motion } from 'framer-motion'
import { Calendar, ChevronDown } from 'lucide-react'
import { AddWalletDialog } from '@/components/shared/AddWalletDialog'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useApp } from '@/context/AppContext'
import { USER } from '@/lib/brand'

const datePresets = [
  { start: '29 Jun, 2025', end: '29 August, 2025' },
  { start: '01 Jan, 2025', end: '31 Mar, 2025' },
  { start: '01 Apr, 2025', end: '30 Jun, 2025' },
  { start: '01 Jul, 2025', end: '30 Sep, 2025' },
]

export function WelcomeSection() {
  const { dateRange, setDateRange } = useApp()

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-4 flex w-full min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
    >
      <h1 className="truncate text-lg font-bold tracking-tight text-foreground sm:text-xl">
        Welcome Back, {USER.name}
      </h1>

      <div className="flex flex-wrap items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs text-foreground shadow-sm transition-colors hover:bg-muted"
            >
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="hidden sm:inline">
                {dateRange.start} - {dateRange.end}
              </span>
              <span className="sm:hidden">Date range</span>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-56 p-1.5">
            {datePresets.map((preset) => (
              <button
                key={`${preset.start}-${preset.end}`}
                type="button"
                onClick={() => setDateRange(preset)}
                className="w-full rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors hover:bg-muted"
              >
                {preset.start} – {preset.end}
              </button>
            ))}
          </PopoverContent>
        </Popover>

        <AddWalletDialog />
      </div>
    </motion.section>
  )
}
