export const chartTheme = {
  primary: 'var(--color-primary)',
  secondary: 'var(--color-muted-foreground)',
  destructive: 'var(--color-destructive)',
  blue: 'var(--color-ring)',
  grid: 'var(--color-border)',
}

export const formatCurrency = (value: number) => `${value.toLocaleString()} RWF`
export const formatCompact = (value: number) =>
  Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(value)
