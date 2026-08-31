import type { ReactNode } from 'react'

export default function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="min-w-0 border border-border/60 bg-muted/30 px-3.5 py-3 transition-colors hover:bg-accent/30">
      <dt className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1.5 break-words text-sm font-semibold leading-5 text-foreground">
        {value || '—'}
      </dd>
    </div>
  )
}
